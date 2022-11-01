import { getMetadata } from "../contract/TokenContract"
import api from '@/axios/index.js';

export function getUserTokenList() {
    return JSON.parse(localStorage.getItem('tokenList')) || []
}

export async function addUserToken(token_id) {
    let metadata = await getMetadata(token_id)
    if (!metadata) {
        return {
            success: false,
            err: 'not valid token id'
        }
    }
    let tokenList = getUserTokenList() || []
    if (tokenList.findIndex(item => item == token_id) > -1) {
        return {
            success: false,
            err: 'already add'
        }
    }
    tokenList.push(token_id)
    localStorage.setItem('tokenList', JSON.stringify(tokenList))
    return {
        success: true,
    }
}