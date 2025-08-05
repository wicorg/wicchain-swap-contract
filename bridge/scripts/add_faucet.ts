import { ethers, network } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name

  console.log('networkName: ', networkName)
  console.log('owner: ', deployer.address)

  const deployedContracts = await import(`../deployment/${networkName}.json`)

  const config = {
    liFiDiamond: deployedContracts.LiFiDiamond,
    relayFacet: deployedContracts.RelayFacet,
  }
  console.info('🚀 ~ main ~ config:', config)

  // Kết nối với LiFiDiamond qua giao diện IDiamondCut
  const LiFiDiamond = await ethers.getContractAt('IDiamondCut', config.liFiDiamond)

  // Lấy interface của RelayFacet để tính selector
  const RelayFacet = await ethers.getContractFactory('RelayFacetV2')
  const relayFacetInterface = RelayFacet.interface
  const functionSelectors = [
    relayFacetInterface.getSighash('startBridgeTokensViaRelay'),
    relayFacetInterface.getSighash('swapAndStartBridgeTokensViaRelay'),
    relayFacetInterface.getSighash('feeProtocolAddress'),
  ]

  // Tạo dữ liệu diamondCut
  const cut = [
    {
      facetAddress: config.relayFacet,
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
