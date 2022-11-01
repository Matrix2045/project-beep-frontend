import * as nearAPI from 'near-api-js';
import { functionCall} from "near-api-js/lib/transaction.js";
import { signAndSendTransaction, getTxData } from '../utils/transaction';
import store from "@/store/index.js";


export default class MainContract{
    contract
    methods = {
        viewMethods: [
            'check_viewed',
            'check_shared'
        ],
        changeMethods: [
            'add_content',
            'add_encrypt_content',
            'follow',
            'unfollow',
            'like',
            'unlike',
            'share',
            'report',
            'del_content'
        ]  // mint
    }

    async _signAndSendTransaction(transaction) {
        return await signAndSendTransaction(this.contract.contractId, this.contract.account, transaction)
    }

    getContractId(){
        return store.state.nearConfig.MAIN_CONTRACT
    }


    async addContent(param,account) {
        const transaction = {
            methodName: "add_content",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        };
        return await this._signAndSendTransaction(transaction)
    }

    async addEncryptContent(param) {
        const transaction = {
            methodName: "add_encrypt_content",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async report(param){
        const transaction = {
            methodName: "report",
            args: param,
            deposit: "5000000000000000000000000",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async delContent(param){
        const transaction = {
            methodName: "del_content",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async follow(param){
        const transaction = {
            methodName: "follow",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async unfollow(param){
        const transaction = {
            methodName: "unfollow",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async like(param){
        const transaction = {
            methodName: "like",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async unlike(param){
        const transaction = {
            methodName: "unlike",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async share(param){
        const transaction = {
            methodName: "share",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}