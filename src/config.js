import env from "./env.js";

export default function getConfig() {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
        MAIN_CONTRACT: "v8-app.bhc8521.testnet",
        COMMUNITY_GENESIS_CONTRACT: "community.bhc8521.testnet",
        NFT_CONTRACT: "nft.bhc8521.testnet",
        DRIP_CONTRACT: "drip2.bhc8521.testnet",
        TOKEN_FACTORY: "token3.popula.near",
        FACILITY_FACTORY: "facility.popula.near",
        LINKDROP: "linkdrop6.popula.near",
        REFERRAL: "referral2.popula.near",
        IPFS: "https://ipfs.popula.io",
        CERAMIC_NETWORK: 'mainnet', 
        CERAMIC_API: 'https://ceramic-private.3boxlabs.com',
        AWS_STORAGE: 'https://popula-frontend.s3-accelerate.amazonaws.com/user'
      };
    case "testnet":
      return {
        networkId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
        MAIN_CONTRACT: "app.beepopula.testnet",
        COMMUNITY_GENESIS_CONTRACT: "community.beepopula.testnet",
        NFT_CONTRACT: "nft.beepopula.testnet",
        DRIP_CONTRACT: "drip.beepopula.testnet",
        TOKEN_FACTORY: "token.beepopula.testnet",
        IPFS: "https://ipfs.popula.io",
        CERAMIC_NETWORK: 'testnet-clay', 
        CERAMIC_API: 'http://54.255.155.106:7007',
        AWS_STORAGE: 'https://popula-frontend.s3-accelerate.amazonaws.com/user'
      };
      case "dev-testnet":
        return {
          networkId: "testnet",
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://wallet.testnet.near.org",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://explorer.testnet.near.org",
          MAIN_CONTRACT: "v8-app.bhc8521.testnet",
          COMMUNITY_GENESIS_CONTRACT: "community-genesis2.bhc8521.testnet",
          NFT_CONTRACT: "nft.bhc8521.testnet",
          DRIP_CONTRACT: "drip2.bhc8521.testnet",
          TOKEN_FACTORY: "token3.bhc8521.testnet",
          IPFS: "https://ipfs.popula.io",
          CERAMIC_NETWORK: 'testnet-clay', 
          CERAMIC_API: 'http://54.255.155.106:7007',
          AWS_STORAGE: 'https://popula-frontend.s3-accelerate.amazonaws.com/user'
        };
    case "betanet":
      return {
        networkId: "betanet",
        nodeUrl: "https://rpc.betanet.near.org",
        walletUrl: "https://wallet.betanet.near.org",
        helperUrl: "https://helper.betanet.near.org",
        explorerUrl: "https://explorer.betanet.near.org",
      };
    case "local":
      return {
        networkId: "local",
        nodeUrl: "http://localhost:3030",
        keyPath: `${process.env.HOME}/.near/validator_key.json`,
        walletUrl: "http://localhost:4000/wallet",
      };
    case "test":
    case "ci":
      return {
        networkId: "shared-test",
        nodeUrl: "https://rpc.ci-testnet.near.org",
        masterAccount: "test.near",
      };
    case "ci-betanet":
      return {
        networkId: "shared-test-staging",
        nodeUrl: "https://rpc.ci-betanet.near.org",
        masterAccount: "test.near",
      };
    default:
      throw Error(
        `Unconfigured environment '${env}'. Can be configured in src/config.js.`
      );
  }
}
