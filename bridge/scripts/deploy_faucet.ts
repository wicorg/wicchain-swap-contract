import { ethers, network } from "hardhat";
import hre from "hardhat";
import { configs } from "../../configs"
import fs from 'fs'

async function main() {
  const networkName = network.name
  console.log("Deploying contracts in: ", networkName);
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

    const config = configs[networkName]

    console.info("Config: ", config)
  
    // 1. Deploy DiamondCutFacet (Facet hỗ trợ diamondCut)
    console.info("\n\nDEPLOYING DiamondCutFacet ....");
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet"); // Giả sử bạn có contract này
    const diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.deployed()
    console.log("DiamondCutFacet deployed to:", diamondCutFacet.address);

    try {
      await hre.run("verify:verify", {
        address: diamondCutFacet.address,
        contract: 'contracts/DiamondCutFacet.sol:DiamondCutFacet',
        constructorArguments: [],
    });
    } catch (error) {
      console.log('Verify contract DiamondCutFacet error: ', error)
    }
    await sleep(5000)

    // 2. Deploy LiFiDiamond
    console.info("\n\nDEPLOYING LiFiDiamond ....");
    const LiFiDiamond = await ethers.getContractFactory("LiFiDiamond");
    const lifiDiamond = await LiFiDiamond.deploy(deployer.address, diamondCutFacet.address);
    await lifiDiamond.deployed()
    console.log("LiFiDiamond deployed to:", lifiDiamond.address);

    try {
      await hre.run("verify:verify", {
        address: lifiDiamond.address,
        contract: 'contracts/LiFiDiamond.sol:LiFiDiamond',
        constructorArguments: [deployer.address, diamondCutFacet.address],
    });
    } catch (error) {
      console.log('Verify contract DiamondCutFacet error: ', error)
    }
    await sleep(5000)

    // 3. Deploy RelayReceiver
    console.info("\n\nDEPLOYING RelayReceiver ....");
    const RelayReceiver = await ethers.getContractFactory("RelayReceiver");
    const relayReceiver = await RelayReceiver.deploy(config.relayReceiver);
    await relayReceiver.deployed()
    console.log("RelayFacet deployed to:", relayReceiver.address);
    const relayReceiverAddress = relayReceiver.address

    try {
      await hre.run("verify:verify", {
        address: relayReceiver.address,
        contract: 'contracts/Relay/RelayReceiver.sol:RelayReceiver',
        constructorArguments: [config.relayReceiver],
    });
    } catch (error) {
      console.log('Verify contract RelayReceiver error: ', error)
    }
    await sleep(5000)
  
    // 3. Deploy RelayFacet
    console.info("\n\nDEPLOYING RelayFacet ....");
    const RelayFacet = await ethers.getContractFactory("RelayFacetV2");
    const relayFacet = await RelayFacet.deploy(relayReceiverAddress, config.relayResolver, config.feeProtocolAddress);
    await relayFacet.deployed()
    console.log("RelayFacet deployed to:", relayFacet.address);

    try {
      await hre.run("verify:verify", {
        address: relayFacet.address,
        contract: 'contracts/Facets/RelayFacetV2.sol:RelayFacetV2',
        constructorArguments: [relayReceiverAddress, config.relayResolver, config.feeProtocolAddress],
      });
    } catch (error) {
      console.log('Verify contract RelayReceiver error: ', error)
    }
    await sleep(5000)
  
  
    const contracts = {
      DiamondCutFacet: diamondCutFacet.address,
      LiFiDiamond: lifiDiamond.address,
      RelayReceiver: relayReceiver.address,
      RelayFacet: relayFacet.address
    }
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
