require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
// require("undici");
// require("dotenv").config();

require("@chainlink/env-enc").config();

// require("./tasks/deploy-fundme");
// require("./tasks/interact-fundme");

// import all tasks from tasks/index.js
require("./tasks");
//import mocha
require("mocha");
//0.3888  0.2298
const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  mocha: {
    timeout: 300000 // 300 seconds 
  },
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

  namedAccounts: {
    firstAccount: {
      //networks -->sepolia-->accounts[0]
      default: 0
    },
    secondAccount: {
      //networks -->sepolia-->accounts[1]
      default: 1
    },
  },
  gasReporter: {
    enabled: true,
  }
};
