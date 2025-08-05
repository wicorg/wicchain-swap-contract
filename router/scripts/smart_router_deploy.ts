import {ethers, network} from "hardhat";
import hre from "hardhat";
import {configs} from "../../configs"
import fs from 'fs'

async function main() {
    const networkName = network.name
    console.log("Deploying contracts in: ", networkName);
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const config = configs[networkName]

    const coreDeployedContracts = await import(`../../swap/deployment/core/${networkName}.json`)
    const peripheryDeployedContracts = await import(`../../swap/deployment/periphery/${networkName}.json`)

    console.log("coreDeployedContracts: ", coreDeployedContracts);
    //1
    const wnative = config.WNATIVE;
    const nonfungiblePositionManager = peripheryDeployedContracts.NonfungiblePositionManager
    const factoryV3 = coreDeployedContracts.MonFactory

    if (!config) {
        throw new Error(`No config found for network ${networkName}`);
    }

    /** SmartRouterHelper */
    console.log('Deploying SmartRouterHelper...')
    const SmartRouterHelper = await ethers.getContractFactory('SmartRouterHelper')
    const smartRouterHelper = await SmartRouterHelper.deploy()
    console.log('SmartRouterHelper deployed to:', smartRouterHelper.address)
    await smartRouterHelper.deployed()

    try {
        await hre.run("verify:verify", {
            address: smartRouterHelper.address,
            contract: 'contracts/libraries/SmartRouterHelper.sol:SmartRouterHelper',
            constructorArguments: [],
        });
    } catch (error) {
        console.log('Verify contract SmartRouterHelper error: ', error)
    }

    await sleep(10000)

    /** SmartRouter */
    console.log('Deploying SmartRouter...')
    const SmartRouter = await ethers.getContractFactory('SmartRouter', {
        libraries: {
            SmartRouterHelper: smartRouterHelper.address,
        },
    })

    const smartRouter = await SmartRouter.deploy(deployer.address, factoryV3, nonfungiblePositionManager, wnative);

    console.log("smartRouter deployed to:", smartRouter.address);
    await smartRouter.deployed()
    const smartRouterAddress = smartRouter.address
    try {
        await hre.run("verify:verify", {
            address: smartRouter.address,
            contract: 'contracts/SmartRouter.sol:SmartRouter',
            constructorArguments: [deployer.address, factoryV3, nonfungiblePositionManager, wnative],
        });
    } catch (error) {
        console.log('Verify contract SwapRouter error: ', error)
    }
    await sleep(5000)


    const contracts = {
        SmartRouter: smartRouterAddress,
        SmartRouterHelper: smartRouterHelper.address
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
