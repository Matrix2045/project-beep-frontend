import store from "@/store/index.js";
import * as nearAPI from 'near-api-js';
import getConfig from "../config";
import api from '@/axios/index.js';
import { getMetadata } from "../contract/TokenContract";
import { getQueryString, parseAmount, setShareInfo } from "./util";
import { getTxData, storeAccessKey } from "./transaction";
//import { Ceramic } from "./ceramic";
import * as bs58 from 'bs58';
import secret from "./secret.js"
import { loginSenderMainContract, senderEvents } from "./sender";

function initS3() {
  const data = secret  //process.env.NODE_ENV === 'production' ? json.mainnet : json.testnet); 
  AWS.config.update({accessKeyId: data.s3.access_key_id, secretAccessKey: data.s3.secret_access_key});
  AWS.config.apiVersions = {
    s3: '2006-03-01',
  };
  window.s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('s3-accelerate.amazonaws.com')
  });
}

async function initViewAccount() {
  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const near = await nearAPI.connect({
    keyStore,
    ...store.state.nearConfig,
  });
  let viewAccount = await near.account();
  store.commit("setViewAccount", viewAccount)
}

async function resolveUrlTransactionHashes(txs) {
  for (let tx of txs) {
    if (tx == '') {
      return
    }
    const txData = await getTxData(tx)
    const index = txData.transaction.actions.findIndex(item => !!item.AddKey)
    if (index > -1) {
      const functionCall = txData.transaction.actions[index].AddKey.access_key.permission.FunctionCall
      if (functionCall) {
        const contractId = functionCall.receiver_id
        const accountId = txData.transaction.receiver_id
        await storeAccessKey(accountId, contractId)
      }
      
    }
  }
}

async function resolveUrlLogin(publicKey, allKeys, accountId) {
  if (!accountId) {
    return
  }

  const authData = {
    accountId,
    allKeys
  }
  window.localStorage.setItem(`${store.state.nearConfig.MAIN_CONTRACT}_wallet_auth_key`, JSON.stringify(authData));
  if (publicKey) {
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const keyPair = await keyStore.getKey(store.state.nearConfig.networkId, 'pending_key' + publicKey);
    if (keyPair) {
      await keyStore.setKey(store.state.nearConfig.networkId, accountId, keyPair);
      await keyStore.removeKey(store.state.nearConfig.networkId, 'pending_key' + publicKey);
    }
  }
  
}

export function resolveUrl() {
  const currentUrl = new URL(window.location.href);
  const publicKey = currentUrl.searchParams.get('public_key') || '';
  const allKeys = (currentUrl.searchParams.get('all_keys') || '').split(',');
  const accountId = currentUrl.searchParams.get('account_id') || '';
  const transactionHashes = (currentUrl.searchParams.get("transactionHashes") || '').split(',')
  resolveUrlTransactionHashes(transactionHashes)
  resolveUrlLogin(publicKey, allKeys, accountId)
  currentUrl.searchParams.delete('public_key');
  currentUrl.searchParams.delete('all_keys');
  currentUrl.searchParams.delete('account_id');
  currentUrl.searchParams.delete('meta');
  currentUrl.searchParams.delete('transactionHashes');
  window.history.replaceState({}, document.title, currentUrl.toString());
}


export function loginWallet() {
  const loginInfo = getLoginInfo()
  return loginInfo && loginInfo.wallet
}

export function getLoginInfo() {
  const loginInfo = JSON.parse(window.localStorage.getItem("loginInfo"))
  return loginInfo ? loginInfo : {}
}

export async function initSignIn() {
  if (!store.state.walletConnection.isSignedIn()) {
    return
  }
  const accountId = store.state.walletConnection.getAccountId()
  if (!window.localStorage.getItem("loginInfo")) {
    window.localStorage.setItem("loginInfo", JSON.stringify({
      wallet: "near",
      accountId: accountId,
      accessKey: await store.state.keyStore.getKey(store.state.nearConfig.networkId, accountId)
    }))
  }
  const account = store.state.walletConnection.account()
  store.commit("setAccount", account)
  store.commit("setSignedIn", true)
  //Ceramic.new()
  let res = await api.profile.get_user_info({account_id:store.getters.accountId})
  if (res.success) {
    store.commit("setProfile", res.data);
  }
  await setShareInfo();
}



export async function init() {
  
  store.commit("setNearConfig", getConfig()) //process.env.NODE_ENV === 'production' ? "mainnet" : "development"); 
  initS3()
  const providers = new nearAPI.providers.JsonRpcProvider(store.state.nearConfig.nodeUrl)
  // const block = await providers.block({blockId: "DmnyAuMHfQXEypMAf8BeyzsBLBz8TxVd4yyHM9UnLjXy"})
  // for (let chunk of block.chunks) {
  //   console.log(await providers.chunk(chunk.chunk_hash))
  // }
  //console.log(await providers.txStatus("9F1k3SFgMJ1yAW1cbX8WvwrM2eSZxdS3tDndq6uwKq7G", "perp.spin-fi.testnet"))

  
  store.commit("setProvider", providers)
  
  initViewAccount()
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  store.commit("setKeyStore", keyStore)
  const near = await nearAPI.connect({
    keyStore: keyStore,
    ...store.state.nearConfig,
  });
  
  store.commit("setNear", near);
  const walletConnection = new nearAPI.WalletConnection(near, store.state.nearConfig.MAIN_CONTRACT)
  store.commit("setWalletConnection", walletConnection);
  await loginSenderMainContract()
  await senderEvents()

  if (window.localStorage.getItem(`${store.state.nearConfig.MAIN_CONTRACT}_wallet_auth_key`)) {
    await initSignIn()
  }
};