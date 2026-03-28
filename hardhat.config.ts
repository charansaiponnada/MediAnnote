import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.28",
        settings: {
            evmVersion: "cancun",
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    paths: {
        sources: "./contracts",
        artifacts: "./contracts/artifacts",
        cache: "./contracts/cache",
    },
    networks: {
        hardhat: {},
        mumbai: {
            url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
            accounts: process.env.DEPLOYER_PRIVATE_KEY
                ? [process.env.DEPLOYER_PRIVATE_KEY]
                : [],
        },
        amoy: {
            url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
            accounts: process.env.DEPLOYER_PRIVATE_KEY
                ? [process.env.DEPLOYER_PRIVATE_KEY]
                : [],
        },
    },
};

export default config;
