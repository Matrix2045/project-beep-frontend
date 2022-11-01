import { AccountId } from 'caip';
import * as uint8arrays from 'uint8arrays';
import * as nearApiJs from 'near-api-js';
import * as sha256 from '@stablelib/sha256';

function getConsentMessage(did, addTimestamp = true) {
    const res = {
        message: 'Link this account to your identity' + '\n\n' + did,
    };
    if (addTimestamp) {
        res.timestamp = Math.floor(Date.now() / 1000);
        res.message += ' \n' + 'Timestamp: ' + res.timestamp;
    }
    return res;
}

function asOldCaipString(input) {
    return `${input.address}@${input.chainId.namespace}:${input.chainId.reference}`;
}


const getSignature = async (signer, accountId, message, networkId) => {
    const signed = await signer.signMessage(message, accountId, networkId);
    return uint8arrays.toString(signed.signature, 'base64');
};
export class NearAuthProvider {
    constructor(near, accountName, chainRef) {
        this.near = near;
        this.accountName = accountName;
        this.chainRef = chainRef;
        this.isAuthProvider = true;
    }
    async authenticate(message) {
        const key = await this.near.connection.signer.keyStore.getKey(this.chainRef, this.accountName);
        const signer = await nearApiJs.InMemorySigner.fromKeyPair(this.chainRef, this.accountName, key);
        const digest = sha256.hash(uint8arrays.fromString(message));
        const { signature } = await signer.signMessage(digest, this.accountName, this.chainRef);
        return uint8arrays.toString(signature, 'base16');
    }
    async createLink(did) {
        const key = await this.near.connection.signer.keyStore.getKey(this.chainRef, this.accountName);
        const signer = await nearApiJs.InMemorySigner.fromKeyPair(this.chainRef, this.accountName, key);
        const { message, timestamp } = getConsentMessage(did, true);
        const signature = await getSignature(signer, this.accountName, message, this.chainRef);
        const account = await this.accountId();
        return {
            version: 2,
            type: 'near',
            message,
            signature,
            account: asOldCaipString(account),
            timestamp,
        };
    }
    async accountId() {
        //const key = await this.near.connection.signer.keyStore.getKey(this.chainRef, this.accountName);
        //const signer = await nearApiJs.InMemorySigner.fromKeyPair(this.chainRef, this.accountName, key);
        //const publicKey = await signer.getPublicKey(this.accountName, this.chainRef);
        const address = uint8arrays.toString(Buffer.from(this.accountName.split('.')[0]), 'base58btc');
        return new AccountId({
            address: address,
            chainId: `near:${this.chainRef}`,
        });
    }
    withAddress(address) {
        return new NearAuthProvider(this.near, address, this.chainRef);
    }
}
//# sourceMappingURL=near.js.map