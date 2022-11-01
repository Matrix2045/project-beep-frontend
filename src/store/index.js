import { createStore } from "vuex";
import getConfig from "../config";
import { initSignIn, loginWallet } from "../utils/init";
import { loginSenderMainContract, senderEvents } from "../utils/sender";

const state = () => ({
  theme: "black",
  keyStore: {},
  near: {},
  wallectConnection: {},
  signedIn: false,
  account: {},
  viewAccount: {},
  nearConfig: {},
  profile: {},
  provider: {},
  searchWord:"",
  dripActive:false,
  pendingTransactions: {}
});

const mutations = {
  setTheme(state, value) {
    state.theme = value;
  },
  setKeyStore(state, value) {
    state.keyStore = value
  },
  setNear(state, value) {
    state.near = value
  },
  setWalletConnection(state, value) {
    state.walletConnection = value
  },
  setAccount(state, value) {
    state.account = value
  },
  setViewAccount(state, value) {
    state.viewAccount = value
  },
  setNearConfig(state, value) {
    state.nearConfig = value
  },
  setSignedIn(state, value) {
    state.signedIn = value
  },
  setProfile(state, value) {
    state.profile = value
  },
  setProvider(state, value) {
    state.provider = value
  },
  setSearchWord(state, value) {
    state.searchWord = value
  },
  setDripActive(state, value) {
    state.dripActive = value
  },
  setPendingTransaction(state, value) {
    state.pendingTransactions[value.pendingId] = {
      status: value.status,
      data: value.data
    }
  }
};

const actions = {
  async login({ commit, getters, state}, wallet) {
    if (!getters.isLogin) {
      if (!wallet || wallet == "near") {
        await state.walletConnection.requestSignIn(state.nearConfig.MAIN_CONTRACT);
      } else if (wallet == "sender") {
        const res = await window.near.requestSignIn({
          contractId: state.nearConfig.MAIN_CONTRACT, 
        })
        if (res && res.accessKey) {
          await loginSenderMainContract(res.accessKey)
          await senderEvents()
          await initSignIn()
        }
        return res;
        
      }
    }
  },

  async logout({ commit, getters, state }) {
    let logout = true
    if (loginWallet() == "sender") {
      // const allKeys = []
      // for (let key in window.near.authData.allKeys) {
      //   allKeys.push(key)
      // }
      // console.log(allKeys)
      logout = await window.near.signOut({contractId: state.nearConfig.MAIN_CONTRACT})
    } 
    console.log(logout)
    if (logout == true || (logout.error && logout.error.indexOf("sign") > -1)) {
      await state.walletConnection.signOut()
      window.localStorage.removeItem("loginInfo")
      commit("setAccount", {})
      commit("setSignedIn", false)
    }
  },

  async logoutSilence({ commit, getters, state }) {
    await state.walletConnection.signOut()
    window.localStorage.removeItem("loginInfo")
    commit("setAccount", {})
    commit("setSignedIn", false)
  }
}

const getters = {
  isLogin(state) {
    return state.signedIn
  },

  accountId(state) {
    if (!state.account) {
      return
    }
    return state.account.accountId
  },

  getPendingTransactions(state) {
    return state.pendingTransactions
  },

  getAwsImg() {
    const nearConfig = getConfig();
    return (img)=>{
      if(img.indexOf(nearConfig.IPFS+'/ipfs')>-1){
        return img.replace(nearConfig.IPFS+'/ipfs',nearConfig.AWS_STORAGE)
      }else{
        return img
      }
    }
  }
}

const store = createStore({
  state,
  mutations,
  getters,
  actions
});

export default store;
