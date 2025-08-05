// @ts-ignore
import {ethers, network} from "hardhat";
import hre from "hardhat";
import {configs} from "../../configs"
import fs from 'fs'

import {abi} from '../../swap/artifacts/contracts/v3-core/MonFactory.sol/MonFactory.json'
import {abi as abiMC} from '../../masterchef/artifacts/contracts/MasterChefV3.sol/MasterChefV3.json'

async function main() {
    const networkName = network.name
    console.log("Deploying contracts in: ", networkName);
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const config = configs[networkName]

    const coreDeployedContracts = await import(`../../swap/deployment/core/${networkName}.json`)
    const peripheryDeployedContracts = await import(`../../swap/deployment/periphery/${networkName}.json`)
    const masterchefDeployedContracts = await import(`../../masterchef/deployment/${networkName}.json`)

    console.log("coreDeployedContracts: ", coreDeployedContracts);
    //1
    let wnative = config.WNATIVE;
    let monFactory_address = coreDeployedContracts.MonFactory;
    console.log('monFactory_address: ', monFactory_address)
    let orb = config.orb
    let nonfungiblePositionManager = peripheryDeployedContracts.NonfungiblePositionManager
    const masterChefV3Address = masterchefDeployedContracts.MasterChefV3

    if (!config) {
        throw new Error(`No config found for network ${networkName}`);
    }
    console.log('masterChefV3Address: ', masterChefV3Address)

    const MonLmPoolDeployer = await ethers.getContractFactory('MonLmPoolDeployer')
    const monLmPoolDeployer = await MonLmPoolDeployer.deploy(masterChefV3Address)
    console.log('monLmPoolDeployer deployed to:', monLmPoolDeployer.address)
    const lmPoolDeployerAddrees = monLmPoolDeployer.address
    await monLmPoolDeployer.deployed()

    await sleep(5000)

    try {
        await hre.run("verify:verify", {
            address: lmPoolDeployerAddrees,
            contract: 'contracts/MonLmPoolDeployer.sol:MonLmPoolDeployer',
            constructorArguments: [masterChefV3Address],
        });
    } catch (error) {
        console.log('Verify contract MonLmPoolDeployer error: ', error)
    }
    await sleep(5000)

    const monFactory = new ethers.Contract(monFactory_address, abi, deployer)

    const tnx1 = await monFactory.setLmPoolDeployer(lmPoolDeployerAddrees)
    console.log('Factory setLmPoolDeployer success: ', tnx1.hash)

    const masterChef = new ethers.Contract(masterChefV3Address, abiMC, deployer)

    const txn2 = await masterChef.setLMPoolDeployer(lmPoolDeployerAddrees)
    console.log('MasterChef setLmPoolDeployer success: ', txn2.hash)

    const contracts = {
        MasterChefV3: masterChefV3Address,
        MonLmPoolDeployer: lmPoolDeployerAddrees
    }
    console.log(contracts);
    fs.writeFileSync(`./deployment/${networkName}.json`, JSON.stringify(contracts, null, 2))
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
