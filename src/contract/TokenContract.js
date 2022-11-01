import store from "@/store/index.js";

export async function getMetadata(tokenId) {
    try {
        return await store.state.viewAccount.viewFunction(tokenId, "ft_metadata", {});
    } catch(e) {
        return false;
    }
}

export async function getBalanceOf(tokenId, accountId) {
    try{
        return await store.state.viewAccount.viewFunction(tokenId, 'ft_balance_of', {account_id: accountId});
    } catch(e) {
        return false;
    }
}

export async function getTotalSuply(tokenId) {
    try {
        return await store.state.viewAccount.viewFunction(tokenId, 'ft_total_supply', {});
    } catch(e) {
        return false;
    }
}