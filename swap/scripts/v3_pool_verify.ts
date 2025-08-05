import { ethers, network, upgrades } from "hardhat";
import hre from "hardhat";
import { configs } from "../../configs"
import fs from 'fs'

const Web3 = require('web3');
const web3 = new Web3('https://nd-598-389-440.p2pify.com/882051c14f0c650fdce4ecc7daf56cd6');


async function main() {
    const networkName = network.name
    console.log("Deploying contracts in: ", networkName);
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    //2
    let poolAddress = "0x5eFC5Ad9b664FE84dacF5179ed523e40436BE476"
    try {
      await hre.run("verify:verify", {
        address: poolAddress,
        contract: 'contracts/v3-core/MonPool.sol:MonPool',
        constructorArguments: [],
    });
    } catch (error) {
      console.log('Verify contract MonPool error: ', error)
    }

}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


// npx hardhat run scripts/deploy.js --network monTestnet
