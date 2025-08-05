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

    const config = configs[networkName]
    
    const coreDeployedContracts = await import(`../deployment/core/${networkName}.json`)

    console.log("coreDeployedContracts: ", coreDeployedContracts);
    //1
    let wnative = config.WNATIVE;
    let monFactory_address = coreDeployedContracts.MonFactory;
    let monPoolDeployer_address = coreDeployedContracts.MonPoolDeployer;

    const peripheryDeployedContracts = await import(`../deployment/periphery/${networkName}.json`)

    console.info("🚀 ~ main ~ peripheryDeployedContracts:", peripheryDeployedContracts)
    //2
    let swapRouterAddress = peripheryDeployedContracts.SwapRouter
    console.log('swapRouterAddress: ', swapRouterAddress)
    try {
      await hre.run("verify:verify", {
        address: swapRouterAddress,
        contract: 'contracts/v3-periphery/SwapRouter.sol:SwapRouter',
        constructorArguments: [monPoolDeployer_address, monFactory_address, wnative],
    });
    } catch (error) {
      console.log('Verify contract SwapRouter error: ', error)
    }

    await sleep(5000)

     //2
     let nftDescriptorExAddress = peripheryDeployedContracts.NFTDescriptorEx
     console.log('nftDescriptorExAddress: ', nftDescriptorExAddress)
     try {
       await hre.run("verify:verify", {
         address: nftDescriptorExAddress,
         contract: 'contracts/v3-periphery/NFTDescriptorEx.sol:NFTDescriptorEx',
         constructorArguments: [],
     });
     } catch (error) {
       console.log('Verify contract NFTDescriptorEx error: ', error)
     }

    await sleep(5000)

    //3
    const _nativeCurrencyLabelBytes = ethers.utils.formatBytes32String(config.nativeCurrencyLabel);
    const nonfungibleTokenPositionDescriptorAddress = peripheryDeployedContracts.NonfungibleTokenPositionDescriptor
    console.log('nonfungibleTokenPositionDescriptorAddress: ', nonfungibleTokenPositionDescriptorAddress)
    try {
      await hre.run("verify:verify", {
        address: nonfungibleTokenPositionDescriptorAddress,
        contract: 'contracts/v3-periphery/NonfungibleTokenPositionDescriptor.sol:NonfungibleTokenPositionDescriptor',
        constructorArguments: [wnative, _nativeCurrencyLabelBytes, nftDescriptorExAddress],
    });
    } catch (error) {
      console.log('Verify contract SwapRouter error: ', error)
    }
    await sleep(5000)
    //4

    const nonfungiblePositionManagerAddress = peripheryDeployedContracts.NonfungiblePositionManager
    console.log('NonfungiblePositionManager: ', nonfungiblePositionManagerAddress)
    await hre.run("verify:verify", {
        address: nonfungiblePositionManagerAddress,
        contract: 'contracts/v3-periphery/NonfungiblePositionManager.sol:NonfungiblePositionManager',
        constructorArguments: [monPoolDeployer_address,
            monFactory_address,
            wnative,
            nonfungibleTokenPositionDescriptorAddress],
    });
    await sleep(5000)

    //5
    const monInterfaceMulticallAddress = peripheryDeployedContracts.MonInterfaceMulticall
    console.log('monInterfaceMulticall', monInterfaceMulticallAddress)
    await hre.run("verify:verify", {
        address: monInterfaceMulticallAddress,
        contract: 'contracts/v3-periphery/lens/MonInterfaceMulticall.sol:MonInterfaceMulticall',
        constructorArguments: [],
    });
    await sleep(5000)

    //6
    const v3MigratorAddress = peripheryDeployedContracts.V3Migrator
    console.log('V3Migrator', v3MigratorAddress)
    await hre.run("verify:verify", {
        address: v3MigratorAddress,
        contract: 'contracts/v3-periphery/V3Migrator.sol:V3Migrator',
        constructorArguments: [monPoolDeployer_address,
            monFactory_address,
            wnative,
            nonfungiblePositionManagerAddress],
    });
    await sleep(5000)

    //7
    const ticklenV2Address = peripheryDeployedContracts.TickLens
    console.log('tickLens: ', ticklenV2Address)
    await hre.run("verify:verify", {
        address: ticklenV2Address,
        contract: 'contracts/v3-periphery/lens/TickLens.sol:TickLens',
        constructorArguments: [],
    });
    await sleep(5000)

    //8
    const quoterV2Address = peripheryDeployedContracts.QuoterV2
    console.log('quoterV2', quoterV2Address)
    await hre.run("verify:verify", {
        address: quoterV2Address,
        contract: 'contracts/v3-periphery/lens/QuoterV2.sol:QuoterV2',
        constructorArguments: [monPoolDeployer_address, monFactory_address, wnative],
    });

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
