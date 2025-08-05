import {ethers, network} from "hardhat";
import hre from "hardhat";
import fs from 'fs'

async function main() {
    const networkName = network.name
    console.log("Deploying contracts in: ", networkName);
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    //1
    let monPoolDeployer_address = ''
    const MonPoolDeployer = await ethers.getContractFactory('MonPoolDeployer')
    let monPoolDeployer = await MonPoolDeployer.deploy()
    await monPoolDeployer.deployed();
    await sleep(5000)
    monPoolDeployer_address = monPoolDeployer.address
    console.log('monPoolDeployer', monPoolDeployer_address)
    try {
        await hre.run("verify:verify", {
            address: monPoolDeployer_address,
            contract: 'contracts/v3-core/MonPoolDeployer.sol:MonPoolDeployer',
            constructorArguments: [],
        });
    } catch (e) {
        console.log("Verifiy contract Deployer error: ", e)
    }

    await sleep(5000)

    //2
    const MonFactory = await ethers.getContractFactory('MonFactory')
    let monFactory = await MonFactory.deploy(monPoolDeployer_address)
    await monFactory.deployed();
    const monFactory_address = monFactory.address
    await sleep(5000)
    console.log('monFactory', monFactory_address)
    try {
        await hre.run("verify:verify", {
            address: monFactory_address,
            contract: 'contracts/v3-core/MonFactory.sol:MonFactory',
            constructorArguments: [monPoolDeployer_address],
        });
    } catch (error) {
        console.error('Verify contract MonFactory error: ', error);
    }

    //3
    await monPoolDeployer.setFactoryAddress(monFactory_address);

    //4
    const contracts = {
        MonFactory: monFactory_address,
        MonPoolDeployer: monPoolDeployer_address,
    }

    // Đường dẫn thư mục chứa tệp
    fs.writeFileSync(`./deployment/core/${networkName}.json`, JSON.stringify(contracts, null, 2))
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
