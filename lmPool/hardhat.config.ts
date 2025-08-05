require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");

import { configs } from "../configs"
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
  },
  networks: {
    sepolia: {
      url: configs['sepolia'].rpcUrl,
      chainId: configs['sepolia'].chainId,
      accounts: [ configs['sepolia'].privateKey ],
      apiKey: configs['sepolia'].verifyKey
    },
    arb: {
      url: configs['arb'].rpcUrl,
      chainId: configs['arb'].chainId,
      accounts: [ configs['arb'].privateKey ],
      apiKey: configs['arb'].verifyKey
    },
    polygonAmoy: {
      url: configs['polygonAmoy'].rpcUrl,
      chainId: configs['polygonAmoy'].chainId,
      accounts: [ configs['polygonAmoy'].privateKey ],
      apiKey: configs['polygonAmoy'].verifyKey
    },
    bscTestnet: {
      url: configs['bscTestnet'].rpcUrl,
      chainId: configs['bscTestnet'].chainId,
      accounts: [ configs['bscTestnet'].privateKey ],
      apiKey: configs['bscTestnet'].verifyKey
    },
    monchain: {
      url: configs['monchain'].rpcUrl,
      chainId: configs['monchain'].chainId,
      accounts: [ configs['monchain'].privateKey ],
      apiKey: configs['monchain'].verifyKey
    },
    wicchain: {
      url: configs['wicchain'].rpcUrl,
      chainId: configs['wicchain'].chainId,
      accounts: [ configs['wicchain'].privateKey ],
      apiKey: configs['wicchain'].verifyKey
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: configs['bscTestnet'].verifyKey, // BSC Testnet API Key
      monchain: configs['monchain'].verifyKey, // MonTestnet API Key
      wicchain: configs["wicchain"].verifyKey, // WicChain API Key
    },
    customChains: [
      {
        network: "monchain",
        chainId: configs['monchain'].chainId,
        urls: {
          apiURL: "https://explorer.monchain.info/api",
          browserURL: "https://explorer.monchain.info:443"
        }
      },
      {
        network: "wicchain",
        chainId: 6689,
        urls: {
          apiURL: "https://testnet-api.wicscan.com/api", // explorer api path for verify
          browserURL: "https://testnet.wicscan.com" //explorer domain
        }
      }
    ]
  }
};
