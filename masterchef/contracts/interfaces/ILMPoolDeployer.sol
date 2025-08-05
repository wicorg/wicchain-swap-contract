// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IMonPool.sol";
import "./ILMPool.sol";

interface ILMPoolDeployer {
    function deploy(IMonPool pool) external returns (ILMPool lmPool);
}
