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

    //2
    const SwapRouter = await ethers.getContractFactory("SwapRouter");
    const swapRouter = await SwapRouter.deploy(monPoolDeployer_address, monFactory_address, wnative);
    await swapRouter.deployed();
    console.log("Swap router address:", swapRouter.address);
    const swapRouterAddress = swapRouter.address
    await sleep(5000)
    try {
      await hre.run("verify:verify", {
        address: swapRouter.address,
        contract: 'contracts/v3-periphery/SwapRouter.sol:SwapRouter',
        constructorArguments: [monPoolDeployer_address, monFactory_address, wnative],
    });
    } catch (error) {
      console.log('Verify contract SwapRouter error: ', error)
    }

    await sleep(5000)

     //2
     const NFTDescriptorEx = await ethers.getContractFactory("NFTDescriptorEx");
     const nftDescriptorEx = await NFTDescriptorEx.deploy();
     await nftDescriptorEx.deployed();
     console.log("NFTDescriptorEx address:", nftDescriptorEx.address);
     let nftDescriptorExAddress = nftDescriptorEx.address
    await sleep(5000)
     try {
       await hre.run("verify:verify", {
         address: nftDescriptorEx.address,
         contract: 'contracts/v3-periphery/NFTDescriptorEx.sol:NFTDescriptorEx',
         constructorArguments: [],
     });
     } catch (error) {
       console.log('Verify contract NFTDescriptorEx error: ', error)
     }
 
    await sleep(5000)
    //3
    const baseTokenUri = 'https://nft.monswap.info/v3/'
    const _nativeCurrencyLabelBytes = ethers.utils.formatBytes32String(config.nativeCurrencyLabel);
    const NonfungibleTokenPositionDescriptor = await ethers.getContractFactory("NonfungibleTokenPositionDescriptor");
    const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(wnative, _nativeCurrencyLabelBytes, nftDescriptorExAddress);
    await nonfungibleTokenPositionDescriptor.deployed()
    console.log("🚀 ~ main ~ nonfungibleTokenPositionDescriptor: ", nonfungibleTokenPositionDescriptor.address)
    await sleep(5000)
    try {
      await hre.run("verify:verify", {
        address: nonfungibleTokenPositionDescriptor.address,
        contract: 'contracts/v3-periphery/NonfungibleTokenPositionDescriptor.sol:NonfungibleTokenPositionDescriptor',
        constructorArguments: [wnative, _nativeCurrencyLabelBytes, nftDescriptorExAddress],
    });
    } catch (error) {
      console.log('Verify contract SwapRouter error: ', error)
    }
    await sleep(5000)

    //4
    const NonfungiblePositionManager = await ethers.getContractFactory("NonfungiblePositionManager");
    const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
        monPoolDeployer_address,
        monFactory_address,
        wnative,
        nonfungibleTokenPositionDescriptor.address
    );
    await nonfungiblePositionManager.deployed();
    console.log('nonfungiblePositionManager', nonfungiblePositionManager.address)
    await sleep(5000)
    await hre.run("verify:verify", {
        address: nonfungiblePositionManager.address,
        contract: 'contracts/v3-periphery/NonfungiblePositionManager.sol:NonfungiblePositionManager',
        constructorArguments: [monPoolDeployer_address,
            monFactory_address,
            wnative,
            nonfungibleTokenPositionDescriptor.address],
    });
    await sleep(5000)

    //5
    const MonInterfaceMulticall = await ethers.getContractFactory("MonInterfaceMulticall");
    const monInterfaceMulticall = await MonInterfaceMulticall.deploy();
    await monInterfaceMulticall.deployed();
    console.log('monInterfaceMulticall', monInterfaceMulticall.address)
    await sleep(5000)
    await hre.run("verify:verify", {
        address: monInterfaceMulticall.address,
        contract: 'contracts/v3-periphery/lens/MonInterfaceMulticall.sol:MonInterfaceMulticall',
        constructorArguments: [],
    });
    await sleep(5000)

    //6
    const V3Migrator = await ethers.getContractFactory("V3Migrator");
    const v3Migrator = await V3Migrator.deploy(monPoolDeployer_address,
        monFactory_address,
        wnative,
        nonfungiblePositionManager.address);
    await v3Migrator.deployed();
    console.log('V3Migrator', v3Migrator.address)
    await sleep(5000)
    await hre.run("verify:verify", {
        address: v3Migrator.address,
        contract: 'contracts/v3-periphery/V3Migrator.sol:V3Migrator',
        constructorArguments: [monPoolDeployer_address,
            monFactory_address,
            wnative,
            nonfungiblePositionManager.address],
    });
    await sleep(5000)

    //7
    const TickLens = await ethers.getContractFactory("TickLens");
    const tickLens = await TickLens.deploy();
    await tickLens.deployed();
    console.log('tickLens', tickLens.address)
    await sleep(5000)
    try {
        await hre.run("verify:verify", {
            address: tickLens.address,
            contract: 'contracts/v3-periphery/lens/TickLens.sol:TickLens',
            constructorArguments: [],
        });
    } catch (error) {
        console.error("Verify TickLens error: ", error)
    }
    await sleep(5000)

    //8
    const QuoterV2 = await ethers.getContractFactory("QuoterV2");
    const quoterV2 = await QuoterV2.deploy(monPoolDeployer_address, monFactory_address, wnative);
    await quoterV2.deployed();
    console.log('quoterV2', quoterV2.address)
    try {
        await hre.run("verify:verify", {
            address: quoterV2.address,
            contract: 'contracts/v3-periphery/lens/QuoterV2.sol:QuoterV2',
            constructorArguments: [monPoolDeployer_address, monFactory_address, wnative],
        });
    } catch (error) {
        console.error("Verify QuoterV2 error: ", error)
    }


    const contracts = {
        SwapRouter: swapRouterAddress,
        V3Migrator: v3Migrator.address,
        NFTDescriptorEx: nftDescriptorExAddress,
        QuoterV2: quoterV2.address,
        TickLens: tickLens.address,
        NonfungibleTokenPositionDescriptor: nonfungibleTokenPositionDescriptor.address,
        NonfungiblePositionManager: nonfungiblePositionManager.address,
        MonInterfaceMulticall: monInterfaceMulticall.address,
    }
    console.log(contracts);
    fs.writeFileSync(`./deployment/periphery/${networkName}.json`, JSON.stringify(contracts, null, 2))
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
