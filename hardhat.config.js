require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
// require("./tasks/deploy-fundme");
// require("./tasks/interact-fundme");

// import all tasks from tasks/index.js
require("./tasks"); 

// require("undici");

// require("dotenv").config();
require("@chainlink/env-enc").config();

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  // defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      //Alkemys, Infura, QuickNode, or any other Ethereum node provider
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
      chainId: 11155111,
      // accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  sourcify: {
    enabled: true
  },
};
