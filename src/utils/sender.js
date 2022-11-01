import store from "@/store/index.js";
import * as nearAPI from 'near-api-js';
import { getLoginInfo, initSignIn, loginWallet } from "./init";

async function login(accountId, accessKey, walletConnection, contractId) {

    if (!accountId || accountId == '' || !accessKey) {
        return
    }
    const storageKey = `${contractId}_wallet_auth_key`
    const keyPair = nearAPI.KeyPair.fromString(accessKey.secretKey)
    await walletConnection._keyStore.setKey(store.state.nearConfig.networkId, accountId, keyPair)
    const authData = {
        accountId,
        allKeys: [keyPair.getPublicKey().toString()]
    }

    walletConnection._authData = authData
    walletConnection._connectedAccount = new nearAPI.ConnectedWalletAccount(walletConnection, walletConnection._near.connection, accountId);
    window.localStorage.setItem(storageKey, JSON.stringify(authData));
}

function isSignedIn(contractId=store.state.nearConfig.MAIN_CONTRACT) {
    const loginInfo = getLoginInfo()
    if (contractId == store.state.nearConfig.MAIN_CONTRACT) {
        return window.near && loginInfo && loginInfo.wallet == "sender"
    } else {
        return window.near && loginInfo && loginInfo.wallet == "sender" && window.near.authData.allKeys[contractId]
    }
}

export async function loginSenderMainContract(accessKey, accountId) {
    if (!(typeof window.near !== 'undefined' && window.near.isSender)) {
        return
    }

    if (loginWallet() && loginWallet() != "sender") {
        return
    }
    
    if (!accountId) {
        accountId = getLoginInfo().accountId
    }
    if (!accountId) {
        accountId = window.near.accountId
    }
    if (!accessKey) {
        accessKey = getLoginInfo().accessKey
    }

    if (!store.state.walletConnection.isSignedIn() && (isSignedIn() || accessKey)) {
        await login(accountId, accessKey, store.state.walletConnection, store.state.nearConfig.MAIN_CONTRACT)
    }

    if (accountId && accessKey) {
        window.localStorage.setItem("loginInfo", JSON.stringify({
            wallet: "sender",
            accountId: accountId,
            accessKey: accessKey
        }))
    }
    
}


export async function loginSenderOtherContract(accessKey, walletConnection, contractId) {

    if (!(typeof window.near !== 'undefined' && window.near.isSender)) {
        console.log("unknown error")
        return
    }

    if (!isSignedIn()) {
        console.log("is not signed in main contract")
        return
    }
    
    const accountId = getLoginInfo().accountId
    
    if (!accessKey) {
        const keys = window.near.authData.allKeys[contractId]
        accessKey = keys && keys.length > 0 && keys[0].accessKey
    }

    if ((!walletConnection.isSignedIn() || walletConnection.getAccountId() != getLoginInfo().accountId || window.near.accountId != getLoginInfo().accountId) && (isSignedIn(contractId) || accessKey)) {
        await login(accountId, accessKey, walletConnection, contractId)
    }
}

export async function senderEvents() {
    if (!(typeof window.near !== 'undefined' && window.near.isSender)) {
        return
    }
    if (loginWallet() != "sender") {
        return
    }
    window.near.on("accountChanged", async (accountId) => {
        store.dispatch("logoutSilence")  
        await loginSenderMainContract(null, accountId)
        await senderEvents()
        await initSignIn()
    })
    window.near.on("rpcChanged", (response) => {
        if (response.network != store.state.nearConfig.networkId) {
            store.dispatch("logoutSilence") 
        }
    })

    window.near.on("signOut", async () => {
        await store.state.walletConnection.signOut()
        store.commit("setAccount", {})
        store.commit("setSignedIn", false)
    })
}