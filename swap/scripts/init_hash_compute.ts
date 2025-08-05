import { ethers } from 'hardhat'
import MonPoolArtifact from '../artifacts/contracts/v3-core/MonPool.sol/MonPool.json'

const hash = ethers.utils.keccak256(MonPoolArtifact.bytecode)
console.log(hash)