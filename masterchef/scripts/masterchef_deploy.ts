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
    let wnative = config.WNATIVE;
    let orb = config.orb
    let nonfungiblePositionManager = peripheryDeployedContracts.NonfungiblePositionManager


    if (!config) {
        throw new Error(`No config found for network ${networkName}`);
    }

    /**
     * DEPLOY CONTRACT AND VERIFY MasterChefV3 V3
     */
    const MasterChefV3 = await ethers.getContractFactory("MasterChefV3");
    const masterChefV3 = await MasterChefV3.deploy(orb, nonfungiblePositionManager, wnative);

    console.log("masterChefV3 deployed to:", masterChefV3.address);
    await masterChefV3.deployed()
    const masterChefV3Address = masterChefV3.address
    await sleep(3000)
    try {
        await hre.run("verify:verify", {
            address: masterChefV3.address,
            contract: 'contracts/MasterChefV3.sol:MasterChefV3',
            constructorArguments: [orb, nonfungiblePositionManager, wnative],
        });
    } catch (error) {
        console.log('Verify contract SwapRouter error: ', error)
    }
    await sleep(5000)

    /**
     * DEPLOY CONTRACT AND VERIFY MULTICALL V3
     */
    const Multical3 = await ethers.getContractFactory("Multicall3");
    const multical3 = await Multical3.deploy();
    await multical3.deployed();
    const multicallV3Address = multical3.address;
    console.log("Multical3 address:", multical3.address);
    await sleep(3000)
    try {
        await hre.run("verify:verify", {
            address: multicallV3Address, //multical3.address,
            contract: 'contracts/multicall/Multicall3.sol:Multicall3',
            constructorArguments: [],
        });
    } catch (error) {
        console.error('Verify contract Multicall3 error: ', error)
    }


    await sleep(5000)

    //2. MonInterfaceMulticallV2
    const MonInterfaceMulticallV2 = await ethers.getContractFactory("MonInterfaceMulticallV2");
    const monInterfaceMulticallV2 = await MonInterfaceMulticallV2.deploy();
    await monInterfaceMulticallV2.deployed();
    const multicallV2Address = monInterfaceMulticallV2.address
    console.log("MonInterfaceMulticallV2 address:", multicallV2Address);
    await sleep(3000)
    try {
        await hre.run("verify:verify", {
            address: multicallV2Address,
            contract: 'contracts/multicall/MonInterfaceMulticallV2.sol:MonInterfaceMulticallV2',
            constructorArguments: [],
        });
    } catch (e) {
        console.error('Verify contract MonInterfaceMulticallV2 error: ', e)
    }


    const contracts = {
        MasterChefV3: masterChefV3Address,
        Multicall3: multicallV3Address,
        MonInterfaceMulticallV2: multicallV2Address,
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
