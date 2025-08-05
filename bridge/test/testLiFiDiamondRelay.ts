import { ethers, network } from 'hardhat'
import axios from 'axios'

async function main() {
  const [owner] = await ethers.getSigners()
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name

  console.log('networkName: ', networkName)
  console.log('owner: ', owner.address)

  const token = '0x9ea9C357B797f1Ebbf0760fB9399d768159F1746'
  const contractAddress = '0xa869e5b8dc4f65d1db38bad8c011dc24e5812ba0'
  const chainId = 6689
  const destinationChainId = 97
  const receiverAddress = '0x4298706288f08E37B41096e888B00100Bd99e060'
  const sendingAssetId = token
  const receiverAssetId = '0x8Be1DE32b85adb702a425faf0Eea252258e1a375'
  const result = await axios.post('http://66.179.80.119:8070/api/v1/sign/relay-transfer', {
    contractAddress: contractAddress,
    chainId: chainId,
    destinationChainId: destinationChainId,
    receiverAddress: receiverAddress,
    sendingAssetId: sendingAssetId,
    receiverAssetId: receiverAssetId,
    amountIn: 1000000000000000000,
    routes: [
      // {
      //   tokenInAddress: '0x2A4b180Da0A45A5AE65f230c228de0d4DE0B7057',
      //   tokenOutAddress: receiverAssetId,
      //   fee: 100,
      //   amountOut: 100000000000000000,
      //   amountInMaximum: 7202,
      //   sqrtPriceLimitX96: 2.1259580808896625e22,
      // },
    ],
  })

  if (result.status != 200) {
    console.error('Lỗi khi gọi API:', result.data)
    throw result.data
  }

  const dataRes = result.data.data
  console.info('🚀 ~ main ~ dataRes:', dataRes)
  const signature = dataRes.signature
  const transactionId = dataRes.requestId
  const integrator = dataRes.iterator
  const feeProtocol = dataRes.feeProtocol
  const feeNetwork = dataRes.feeNetwork

  const bridgeData = {
    transactionId: transactionId, // mã request id
    bridge: 'relay', // mã loại bridge,
    integrator: integrator, // tên itergrator
    referrer: ethers.constants.AddressZero, // mặc định 0x0
    sendingAssetId: token, // địa chỉ token, nếu là native thì để 0x000
    receiver: receiverAddress, // đỉa chỉ ví nhận tiền
    minAmount: ethers.utils.parseUnits('1', 6), // số tiền tối thiểu muốn chuyển sang mạng kahcs
    destinationChainId: destinationChainId, // chain id của mạng đích
    hasSourceSwaps: false, // luônlà false
    hasDestinationCall: false, // luôn là false
  }
  console.info("🚀 ~ testLiFiDiamondRelay.ts:72 ~ bridgeData:", bridgeData);

  const relayData = {
    requestId: transactionId, // phải giống request id
    nonEVMReceiver: ethers.constants.HashZero, // luôn là 0x000
    receivingAssetId: ethers.utils.hexZeroPad(receiverAssetId, 32), // địa chỉ token ở mạng đích, nếu là native để 0x000
    signature: signature, //mã signature từ backend trả ra
  }
  console.info("🚀 ~ testLiFiDiamondRelay.ts:80 ~ relayData:", relayData);

  const feeData = {
    feeProtocolAmount: feeProtocol,
    feeNetworkAmount: feeNetwork,
  }
  console.info("🚀 ~ testLiFiDiamondRelay.ts:86 ~ feeData:", feeData);

  // contract thông qua lifi
  const liFiDiamond = await ethers.getContractAt('RelayFacetV2', contractAddress) // địa chri contract lifi

  console.info('🚀 ~ main ~ relayData:', relayData)
  var txn = await liFiDiamond.startBridgeTokensViaRelay(bridgeData, relayData, feeData, {
    value: feeNetwork, // nếu chuyển từ native token thì value phải >= minAmount, nếu là token thì 0 cần truyền
    gasLimit: 3000000,
    gasPrice: ethers.utils.parseUnits('500', 'gwei'),
  })
  console.info('🚀 ~ main ~ txn:', txn.hash)

  return txn
}

async function signMessage(messageHash: string, privateKey: string): Promise<string> {
  const wallet = new ethers.Wallet(privateKey)
  const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash))
  return signature
}

function calculateMessageHash({
  requestId,
  chainId,
  contractAddress,
  sendingAssetId,
  destinationChainId,
  receiver,
  receivingAssetId,
}: {
  requestId: string
  chainId: number
  contractAddress: string
  sendingAssetId: string
  destinationChainId: number
  receiver: string
  receivingAssetId: string
}): [string, string] {
  var requestByte32 = ethers.utils.formatBytes32String(requestId)
  console.info('🚀 ~ requestByte32:', requestByte32)
  console.info('🚀 ~ chainId:', chainId)
  var contractByte32 = ethers.utils.hexZeroPad(contractAddress, 32)
  console.info('🚀 ~ contractByte32:', contractByte32)
  var sendingAssetIdByte32 = ethers.utils.hexZeroPad(sendingAssetId, 32)
  console.info('🚀 ~ sendingAssetIdByte32:', sendingAssetIdByte32)
  console.info('🚀 ~ destinationChainId:', destinationChainId)
  var receiverByte32 = ethers.utils.hexZeroPad(receiver, 32)
  console.info('🚀 ~ receiverByte32:', receiverByte32)
  var receivingAssetIdByte32 = ethers.utils.hexZeroPad(receivingAssetId, 32)
  console.info('🚀 ~ receivingAssetIdByte32:', receivingAssetIdByte32)
  // Chuyển đổi các giá trị thành dạng bytes32
  const packedData = ethers.utils.solidityPack(
    ['bytes32', 'uint256', 'bytes32', 'bytes32', 'uint256', 'bytes32', 'bytes32'],
    [
      requestByte32,
      chainId,
      contractByte32, // bytes32 từ address
      sendingAssetIdByte32, // bytes32 từ address
      destinationChainId,
      receiverByte32, // bytes32 từ address
      receivingAssetIdByte32,
    ]
  )

  // Tính keccak256 = ethers.utils.keccak256(packedData)
  var messageHash = ethers.utils.keccak256(packedData)
  return [toEthSignedMessageHash(messageHash), packedData]
}

function toEthSignedMessageHash(hash: string): string {
  // Ensure hash is valid bytes32
  if (!ethers.utils.isHexString(hash, 32)) {
    throw new Error('Invalid bytes32 hash')
  }

  // The Ethereum signed message prefix is "\x19Ethereum Signed Message:\n32"
  // We need to concatenate this with the hash and then hash the result

  // Convert prefix to hex (equivalent to Solidity's string literal)
  const prefix = ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n32')

  // Convert hash to bytes
  const hashBytes = ethers.utils.arrayify(hash)

  // Concatenate prefix and hash
  const messageBytes = ethers.utils.concat([prefix, hashBytes])

  // Compute keccak256 of the concatenated bytes
  const result = ethers.utils.keccak256(messageBytes)

  return result
}

// Hàm recover trả về địa chỉ người ký từ hash và chữ ký
function recover(hash: string, signature: Uint8Array | string): string {
  // Chuyển đổi signature thành Uint8Array nếu là chuỗi hex
  const sigBytes = typeof signature === 'string' ? ethers.utils.arrayify(signature) : signature

  // Kiểm tra độ dài chữ ký
  const sigLength = sigBytes.length
  console.info('🚀 ~ recover ~ sigLength:', sigLength)
  let v: number
  let r: string
  let s: string

  if (sigLength === 64) {
    // Chữ ký EIP-2098 (64 bytes: r [32 bytes] + vs [32 bytes])
    r = ethers.utils.hexlify(sigBytes.slice(0, 32)) // Lấy 32 bytes đầu tiên cho r
    const vs = ethers.utils.arrayify(sigBytes.slice(32, 64)) // Lấy 32 bytes tiếp theo cho vs
    v = (vs[0] >> 7) + 27 // Lấy bit cao nhất của vs và cộng 27 để tính v
    s = ethers.utils.hexlify(ethers.BigNumber.from(ethers.utils.hexlify(vs)).shl(1).shr(1).toHexString()) // Xóa bit cao nhất để lấy s
  } else if (sigLength === 65) {
    // Chữ ký truyền thống (65 bytes: r [32 bytes] + s [32 bytes] + v [1 byte])
    r = ethers.utils.hexlify(sigBytes.slice(0, 32)) // Lấy 32 bytes đầu tiên cho r
    s = ethers.utils.hexlify(sigBytes.slice(32, 64)) // Lấy 32 bytes tiếp theo cho s
    v = sigBytes[64] // Lấy byte cuối cho v
  } else {
    throw new Error('InvalidSignature: Signature length must be 64 or 65 bytes')
  }

  // Tạo chữ ký đầy đủ từ r, s, v
  const fullSignature = ethers.utils.joinSignature({ r, s, v })

  // Khôi phục địa chỉ từ hash và chữ ký
  let recoveredAddress: string
  try {
    recoveredAddress = ethers.utils.recoverAddress(hash, fullSignature)
  } catch (error) {
    throw new Error('InvalidSignature')
  }

  // Kiểm tra nếu không khôi phục được địa chỉ (tương đương returndatasize() == 0 trong Solidity)
  if (recoveredAddress === ethers.constants.AddressZero) {
    throw new Error('InvalidSignature')
  }

  return recoveredAddress
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
