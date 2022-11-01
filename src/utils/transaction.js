import getConfig from "@/config";
import { KeyPair, keyStores, connect, WalletConnection } from 'near-api-js';
import { getDeposit, getGas, formatAmount, parseAmount } from "@/utils/util"
import * as transaction from "near-api-js/lib/transaction.js";
import { PublicKey } from 'near-api-js/lib/utils';
import { baseDecode, serialize } from 'borsh';
import store from "@/store/index.js";
import BN from 'bn.js';
import { checkReceiptsSuccess, getErrorInfo, getShareInfo, setShareInfo } from "./util";
import bs58 from 'bs58'
import { loginSenderOtherContract } from "./sender";
import { loginWallet } from "./init";

async function executeMultipleSenderTransactions(transactions,onlyCheckOneReceipt=false) {
    const addKeyTx = []
    const functionCallTx = []
    const depositFunctionCallTx = []
    const wallets = {}
    // transactions.forEach(async (tx) => {
    for (let i=0;i<transactions.length;i++) {
        let tx = transactions[i];
        for (let action of tx.actions) {
            if (action.kind == "addKey") {
                addKeyTx.push(tx)
            } else if (action.kind == "functionCall") {
                if (new BN(action.deposit).cmp(new BN(0)) == 1) {
                    depositFunctionCallTx.push(tx)
                } else {
                    const keyStore = new keyStores.BrowserLocalStorageKeyStore(window.localStorage, tx.receiverId);
                    const near = await connect({
                        keyStore: keyStore,
                        ...store.state.nearConfig,
                    });
                    const wallet = new WalletConnection(near, tx.receiverId)
                    wallets[tx.receiverId] = wallet
                    functionCallTx.push(tx)
                }
            }
        }
    }
    if (depositFunctionCallTx.length == 0) {
        if (addKeyTx.length > 0) {
            for (let tx of addKeyTx) {
                const receiverId = tx.receiverId
                const res = await window.near.requestSignIn({
                    contractId: receiverId, 
                })

                if (!res.error) {
                    console.log("in")
                    await loginSenderOtherContract(res.accessKey, wallets[receiverId], receiverId)
                }
            }
        } 
    }

    if (functionCallTx.length > 0) {
        for (let tx of functionCallTx) {
            let account = store.state.account
            const wallet = wallets[tx.receiverId]
            
            if (wallet.isSignedIn() && store.getters.accountId == wallet.getAccountId()) {
                account = wallet.account()
            } else {
                depositFunctionCallTx.push(tx)
                continue
            }
            for (let action of tx.actions) {
                await signAndSendTransaction(tx.receiverId, account, action)
            }
            
        }
    }
    
    if (depositFunctionCallTx.length > 0) {
        const res = await window.near.requestSignTransactions({ transactions: depositFunctionCallTx });
        if (res.error) {
            return {
                status: 'fail',
                error: res.error
            }
        }
        return {
            status: checkReceiptsSuccess(res.response[0],onlyCheckOneReceipt) ? 'success' : 'fail',
            data: res.response[0]
        }
    }

    return {
        status: "success",
    }

}


async function createTransaction({ receiverId, actions, nonceOffset = 1 }) {
    if (loginWallet() == "sender") {
        actions = actions.map((fc) => {
            if (fc.kind == "functionCall") {
                return {
                    kind: fc.kind,
                    methodName: fc.methodName,
                    args: fc.args,
                    gas: fc.gas,
                    deposit: fc.deposit
                }
            } else if (fc.kind == "addKey") {

                // return {
                //   kind: fc.kind,
                //   args: {
                //     publicKey: fc.publicKey.toString(),
                //     accessKey: {
                //       nonce: fc.accessKey.nonce,
                //       permission: {
                //         FunctionCall: {
                //           allowance: fc.accessKey.permission.functionCall.allowance,
                //           receiverId: fc.accessKey.permission.functionCall.receiverId,
                //           methodNames: fc.accessKey.permission.functionCall.methodNames
                //         }
                //       }
                //     }
                //   },
                // }
            }
        })
        return {
            receiverId: receiverId,
            actions
        }
    }



    actions = await Promise.all(
        actions.map(async (fc) => {
            if (fc.kind == "functionCall") {
                return transaction.functionCall(
                    fc.methodName,
                    fc.args,
                    getGas(fc.gas),
                    getDeposit(fc.deposit)
                )
            } else if (fc.kind == "addKey") {
                const accessKey = await generateAccessKey(store.getters.accountId, receiverId)
                receiverId = store.getters.accountId
                return transaction.addKey(
                    accessKey.publicKey,
                    accessKey.accessKey
                )
            }
        })
    )


    const localKey = await store.state.account.connection.signer.getPublicKey(
        store.getters.accountId,
        store.state.nearConfig.networkId
    );

    const block = await store.state.provider.block({ finality: 'final' });
    const blockHash = baseDecode(block.header.hash);

    const publicKey = PublicKey.from(localKey);
    const nonce = block.header.height + nonceOffset          //accessKey.access_key.nonce + nonceOffset;

    return transaction.createTransaction(
        store.getters.accountId,
        publicKey,
        receiverId,
        nonce,
        actions,
        blockHash
    );
}

export async function signAndSendTransaction(contractId, account, tx) {
    async function sendTransaction(pendingId, tx) {
        try {
            const actions = [transaction.functionCall(tx.methodName, tx.args, tx.gas, tx.deposit)]
            const [txHashRaw, signedTx] = await account.signTransaction(contractId, actions)
            const res = await store.state.provider.sendTransaction(signedTx);
            const shareInfo = getShareInfo()
            if (shareInfo && contractId == shareInfo.args.contract_id) {
                const actions = [transaction.functionCall(
                    "share_view",
                    { hierarchies: shareInfo.args.hierarchies, inviter_id: shareInfo.args.inviter_id },
                    "100000000000000",
                    "0")]
                await account.signAndSendTransaction({ receiverId: contractId, actions: actions })
            }
            const success = checkReceiptsSuccess(res)
            if (!success) {
                if (getErrorInfo(res) == "lack_of_balance") {
                    const keyStore = new keyStores.BrowserLocalStorageKeyStore(window.localStorage, tx.receiverId);
                    const near = await connect({
                        keyStore: keyStore,
                        ...store.state.nearConfig,
                    });
                    const wallet = new WalletConnection(near, tx.receiverId)
                    wallet.signOut()
                    const txs = [{
                        receiverId: contractId,
                        actions: [{
                            kind: "functionCall",
                            ...tx
                        }]
                    }, {
                        receiverId: contractId,
                        actions: [{
                            kind: "addKey",
                        }],
                    }]
                    return await executeMultipleTransactions(account, txs)
                }
            } else {
                store.commit("setPendingTransaction", {
                    pendingId: pendingId,
                    status: success ? "success" : "fail",
                    data: res,
                })
            }
        } catch (e) {
            store.commit("setPendingTransaction", {
                pendingId: pendingId,
                status: "fail",
                data: {},
                error: e
            })
        }

    }
    try {
        tx.timestamp = Date.now()
        const pendingId = JSON.stringify(tx)
        store.commit("setPendingTransaction", {
            pendingId,
            status: "pending"
        })

        sendTransaction(pendingId, tx)
        return {
            status: "pending",
            data: pendingId
        }
    } catch (e) {
        console.log(e)
        return {
            status: "fail",
            data: {},
            error: e
        }
    }

}

export async function getTxData(hash) {
    let result = await store.state.provider.sendJsonRpc("EXPERIMENTAL_tx_status", [hash, store.getters.accountId]);
    return result
}

export async function getReceiptState(receipt_id) {
    const result = await store.state.provider.sendJsonRpc("EXPERIMENTAL_receipt", { "receipt_id": receipt_id });
    return result
}

export async function getTotalSpend(result) {
    let total = new BN(0);
    for (let i = 0; i < result.length; i++) {
        const res = result[i];
        for (let j = 0; j < res.receipts_outcome.length; j++) {
            const receipt = res.receipts_outcome[j];
            total = total.add(new BN(receipt.outcome.tokens_burnt));
        }
    }
    total = formatAmount(total.toString(10), 24, 2);
    return total;
}

export async function executeMultipleTransactions(
    account,
    transactions,
    callbackUrl=null,
    onlyCheckOneReceipt=false
) {

    const shareInfo = getShareInfo()
    if (shareInfo) {
        transactions.push({
            receiverId: shareInfo.args.contract_id,
            actions: [{
                kind: "functionCall",
                methodName: "share_view",
                args: { hierarchies: shareInfo.args.hierarchies, inviter_id: shareInfo.args.inviter_id },
                deposit: "0",
                gas: "100000000000000"
            }]
        })
    }
    
    if (loginWallet() == "sender") {
        return await executeMultipleSenderTransactions(transactions,onlyCheckOneReceipt)
    } else {
        const nearTransactions = await Promise.all(
            transactions.map((t, i) => {
                return createTransaction({
                    receiverId: t.receiverId,
                    nonceOffset: i + 1,
                    actions: t.actions
    
                });
            })
        );
        
        await store.state.walletConnection.requestSignTransactions(nearTransactions, callbackUrl);
        return {
            status: 'redirect',
            data: {}
        }
    }
    
};

export async function generateAccessKey(accountId, contractId, secretKey) {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore(window.localStorage, contractId);
    let keyPair = {}
    if (!secretKey) {
        keyPair = KeyPair.fromRandom("ed25519")
    } else {
        keyPair = KeyPair.fromString(secretKey)
    }
    await keyStore.setKey(store.state.nearConfig.networkId, "pending::" + accountId, keyPair);
    return {
        publicKey: keyPair.getPublicKey(),
        accessKey: transaction.functionCallAccessKey(contractId, [], parseAmount(0.25)),
    }
}

export async function storeAccessKey(accountId, contractId) {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore(window.localStorage, contractId);
    const keyPair = await keyStore.getKey(store.state.nearConfig.networkId, "pending::" + accountId)
    if (!keyPair) {
        return
    }
    const authDataKey = contractId + '_wallet_auth_key';
    const authData = {
        accountId,
        allKeys: [keyPair.getPublicKey().toString()]
    };
    window.localStorage.setItem(authDataKey, JSON.stringify(authData));
    await keyStore.setKey(store.state.nearConfig.networkId, accountId, keyPair)
    await keyStore.removeKey(store.state.nearConfig.networkId, "pending::" + accountId)
}