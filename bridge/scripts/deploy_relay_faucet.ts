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
  
    // // 3. Deploy RelayReceiver
    // console.info("\n\nDEPLOYING RelayReceiver ....");
    // const RelayReceiver = await ethers.getContractFactory("RelayReceiver");
    // const relayReceiver = await RelayReceiver.deploy(config.relayReceiver);
    // await relayReceiver.deployed()
    // console.log("RelayFacet deployed to:", relayReceiver.address);
    // const relayReceiverAddress = relayReceiver.address
    const relayReceiverAddress = '0x93e5C17726915Ae44b5525D981dc9e0d54f43f9F'
    //
    // try {
    //   await hre.run("verify:verify", {
    //     address: relayReceiver.address,
    //     contract: 'contracts/Relay/RelayReceiver.sol:RelayReceiver',
    //     constructorArguments: [config.relayReceiver],
    // });
    // } catch (error) {
    //   console.log('Verify contract RelayReceiver error: ', error)
    // }
    // await sleep(5000)
  
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

  // Kết nối với LiFiDiamond qua giao diện IDiamondCut
  const LiFiDiamond = await ethers.getContractAt('IDiamondCut', '0x29e7567639Fe63dCBD300a498cf6da5d237EB7C5')

  // Lấy interface của RelayFacet để tính selector
  const relayFacetInterface = RelayFacet.interface
  const functionSelectors = [
    relayFacetInterface.getSighash('startBridgeTokensViaRelay'),
    relayFacetInterface.getSighash('swapAndStartBridgeTokensViaRelay'),
  ]

  // Tạo dữ liệu diamondCut
  const cut = [
    {
      facetAddress: relayFacet.address,
      action: 0, // 0 = Add (FacetCutAction.Add)
      functionSelectors: functionSelectors,
    },
  ]

  // Gọi diamondCut để thêm RelayFacet
  const txAddRelay = await LiFiDiamond.diamondCut(
      cut,
      ethers.constants.AddressZero, // Không có init contract
      '0x' // Không có calldata cho init
  )
  await txAddRelay.wait()
  console.log('RelayFacet added to LiFiDiamond at tx:', txAddRelay.hash)
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
