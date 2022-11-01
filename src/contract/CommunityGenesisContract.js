import * as nearAPI from 'near-api-js';
import { signAndSendTransaction, getTxData } from '../utils/transaction';
import store from "@/store/index.js";
import bs58 from "bs58";


export default class CommunityGenesisContract{
    contract
    methods = {
        viewMethods: [
            'get_account_communities',
            'get_communities',
            'get_community_info',
            'get_code_info',
            'get_code_storage_cost',
            'get_code_types'
        ],
        changeMethods: [
            'deploy_community',
        ]  // mint
    }

    async _signAndSendTransaction(transaction) {
        return await signAndSendTransaction(this.contract.contractId, this.contract.account, transaction)
    }

    getContractId(){
        return store.state.nearConfig.COMMUNITY_GENESIS_CONTRACT
    }


    async deployCommunity(param) {
        const transaction = {
            methodName: "deploy_community",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async getAccountCommunities(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'get_account_communities', param);
    }

    async getCommunities(){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'get_communities', param);
    }

    async getCommunityInfo(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'get_community_info', param);
    }
s
    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}