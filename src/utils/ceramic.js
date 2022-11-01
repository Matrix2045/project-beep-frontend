import { CeramicClient } from '@ceramicnetwork/http-client'
import { DID } from 'dids'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { ThreeIdConnect } from '@3id/connect'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
//import { ThreeIdProvider } from '@3id/did-provider'
//import { NearAuthProvider } from './nearAuthProvider.js'
import { NearAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import store from "@/store/index.js";
import { DIDDataStore } from '@glazed/did-datastore'
import { SelfID } from '@self.id/web'
import fetch from './fetch'

export const aliases = {
    definitions: {
        cryptoAccounts: 'kjzl6cwe1jw149z4rvwzi56mjjukafta30kojzktd9dsrgqdgz4wlnceu59f95f',
        alsoKnownAs: 'kjzl6cwe1jw146zfmqa10a5x1vry6au3t362p44uttz4l0k4hi88o41zplhmxnf',
        basicProfile: 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic'
    },
    schemas: {
        CryptoAccounts: 'ceramic://k3y52l7qbv1frypussjburqg4fykyyycfu0p9znc75lv2t5cg4xaslhagkd7h7mkg',
        AlsoKnownAs: 'ceramic://k3y52l7qbv1fryojt8n8cw2k04p9wp67ly59iwqs65dejso566fij5wsdrb871yio',
        BasicProfile: 'ceramic://k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio'
    },
    tiles: {}
};

function createProvider() {
    const near = store.state.near
    const accountId = store.getters.accountId
    const chainRef = `${store.state.nearConfig.networkId}`
    const authProvider = new NearAuthProvider(near, accountId, chainRef)
    return authProvider
}

// async function initStream(accountId) {
//     const msg = {
//         type: 1,
//         genesis: {
//             header: {
//                 controllers: [`${accountId}`],
//                 family: "caip10-near:testnet"
//             }
//         },
//         opts: {
//             anchor:false,
//             publish:false,
//             sync:0,
//             pin:true
//         }
//     }
//     // {"type":1,
//     // "genesis":
//     // {"header":
//     // {"controllers":["DTyucMu4g2irbXULsxU3kX8pvHT8w2mWBvTnWsmYJcPY@near:testnet"],
//     // "family":"caip10-near:testnet"}},
//     // "opts":{"anchor":false,"publish":false,"sync":0,"pin":true}}

//     let res = await fetch(`${store.state.nearConfig.CERAMIC_API}/api/v0/streams`, {
//         body: JSON.stringify(msg),
//         headers: {
//             "Content-Type": "application/json",
//             // "Access-Control-Allow-Origin": "https://app-clay.3idconnect.org",
//             // "origin": "https://app-clay.3idconnect.org"
//         },
//         method: 'POST'
//     })
//     return res.streamId
// }

async function getDID(seed) {
    const provider = new Ed25519Provider(seed)
    const did = new DID({ provider, resolver: getKeyResolver() })
    await did.authenticate()
    return did
}


async function getLinkedDID(ceramic, accountId, authProvider) {
    const link = await Caip10Link.fromAccount(
      ceramic,
      accountId,
    )
    const sign = await authProvider.authenticate("ceramic")
    const arr = Buffer.from(sign).slice(0, 32)
    const did = await getDID(arr)
    ceramic.did = did
    if (link.did != did) {
        await link.setDid(
            did,
            authProvider,
        )
    }
    return link
}

async function createSelfID(authProvider) {
  
    return await SelfID.authenticate({
      authProvider: authProvider,
      ceramic: 'testnet-clay',
      // Make sure the `ceramic` and `connectNetwork` parameter connect to the same network
      connectNetwork: 'testnet-clay',
    })
}

export class Ceramic {

    link = {}
    dataStore = {}

    constructor(link, dataStore) {
        this.stream = link
        this.dataStore = dataStore
    }

    static async new() {
        const authProvider = createProvider()
        const account = await authProvider.accountId()
        const accountId = `${account.address}@${account.chainId}`
        //const streamId = await initStream(accountId)
        const ceramic = new CeramicClient(store.state.nearConfig.CERAMIC_API)
        //const did = await getLinkedDID(ceramic, accountId, authProvider)
        //const did = getDID(ceramic, accountId)
        //const selfId = await createSelfID(authProvider)
        const link = await getLinkedDID(ceramic, accountId, authProvider)
        //await selfId.set('basicProfile', {name: "bhccccc"})
        //const profile = await selfId.get('basicProfile')
        //console.log(profile)
        const dataStore = new DIDDataStore({ ceramic, model: aliases })
        const res = await dataStore.get("basicProfile", link.did)
        //console.log(accountId)
        //await dataStore.set('basicProfile', {name: "bhccccc"})
        console.log(res)
        //return new Ceramic(link, dataStore)
    }

    async getProfile(did) {

    }
}




