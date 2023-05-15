import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const Goerli_URL = process.env.Goerli;
const Private_key = process.env.PRIVATE_KEY as string;
const apikey = process.env.API_Key as string;
const Sepolia_URL = process.env.Sepolia;
const Mainnet_URL = process.env.Mainnet;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: Goerli_URL || "",
      accounts: [Private_key],
    },
    sepolia: {
      url: Sepolia_URL || "",
      accounts: [Private_key],
    },
    mainnet: {
      url: Mainnet_URL || "",
      accounts: [Private_key],
    },
  },
  etherscan: {
    apiKey: apikey,
  },
};

export default config;
