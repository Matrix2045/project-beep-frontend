import * as nearAPI from 'near-api-js';
import { functionCall} from "near-api-js/lib/transaction.js";
import { executeMultipleTransactions, getTxData } from '../utils/transaction';
import store from "@/store/index.js";


export default class NftContract{
    contract
    methods = {
        viewMethods: [
            
        ],
        changeMethods: [
            'ft_collect'
        ]  // mint
    }

    async _signAndSendTransaction(transaction) {
        const txs = [{
            receiverId: this.contract.contractId,
            actions: [{
                kind: "functionCall",
                ...transaction
            }]
        }]
        return await executeMultipleTransactions(this.contract.account, txs)
    }

    getContractId(){
        return store.state.nearConfig.DRIP_CONTRACT
    }


    async collect(params) {
        const txs = []
        params.forEach(param => {
            txs.push({
                receiverId: this.contract.contractId,
                actions: [{
                    kind: "functionCall",
                    methodName: "ft_collect",
                    args: {collects:param.collects},
                    deposit: param.deposit.toString(),
                    gas: "300000000000000"
                }]
            })
        })
        return await executeMultipleTransactions(this.contract.account, txs,null,true)
        // const transaction = {
        //     methodName: "ft_collect",
        //     args: param,
        //     deposit: deposit,
        //     gas: "300000000000000"
        // };
        // return await this._signAndSendTransaction(transaction)

    }

    async getDrips(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'ft_balance_of', param);
    }


    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}