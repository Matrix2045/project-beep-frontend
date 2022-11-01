import * as nearAPI from 'near-api-js';
import { functionCall} from "near-api-js/lib/transaction.js";
import { executeMultipleTransactions, getTxData } from '../utils/transaction';
import store from "@/store/index.js";


export default class NftContract{
    contract
    methods = {
        viewMethods: [
            'nft_get_series_single',
            'nft_get_series_price',
            'nft_supply_for_series',
            'nft_tokens_by_series'
        ],
        changeMethods: [
            'nft_create_series',
            'nft_mint'
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
        return store.state.nearConfig.NFT_CONTRACT
    }


    async nftCreateSeries(param,deposit) {
        const transaction = {
            methodName: "nft_create_series",
            args: param,
            deposit: deposit,
            gas: "300000000000000"
        };
        return await this._signAndSendTransaction(transaction)
    }

    async nftMint(param,deposit) {
        const transaction = {
            methodName: "nft_mint",
            args: param,
            deposit: deposit,
            gas: "300000000000000"
        };
        return await this._signAndSendTransaction(transaction)
    }

    async getSeries(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'nft_get_series_single', param);
    }
    
    async getPrice(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'nft_get_series_price', param);
    }

    async getSupply(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'nft_supply_for_series', param);
    }

    async getTokens(param){
        try {
            return await store.state.viewAccount.viewFunction(this.getContractId(), 'nft_tokens_by_series', param);
        } catch (e) {
            return []
        }
        
    }


    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}