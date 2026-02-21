require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../backend/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    artifacts: "../backend/storage/blockchain/artifacts",
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 20,
        accountsBalance: "10000000000000000000000" // 10000 ETH
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },

    // Ethereum Testnets
    sepolia: {
      url: process.env.BLOCKCHAIN_NODE_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000 // 8 gwei
    },
    goerli: {
      url: process.env.BLOCKCHAIN_NODE_URL || "https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 5,
      gas: 2100000,
      gasPrice: 8000000000
    },

    // Ethereum Mainnet
    mainnet: {
      url: process.env.BLOCKCHAIN_NODE_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 1,
      gas: 2100000,
      gasPrice: 20000000000 // 20 gwei
    },

    // Polygon Networks
    mumbai: {
      url: process.env.BLOCKCHAIN_NODE_URL || "https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 2100000,
      gasPrice: 8000000000
    },
    polygon: {
      url: process.env.BLOCKCHAIN_NODE_URL || "https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 137,
      gas: 2100000,
      gasPrice: 8000000000
    },

    // Arbitrum Networks
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 421614
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 42161
    },

    // Linea Networks
    lineaSepolia: {
      url: process.env.BLOCKCHAIN_NODE_URL || "https://linea-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 59141,
      gas: 2100000,
      gasPrice: 8000000000
    },
    linea: {
      url: "https://linea-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY",
      accounts: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY] : [],
      chainId: 59144,
      gas: 2100000,
      gasPrice: 8000000000
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
