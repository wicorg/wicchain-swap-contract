// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import './base/periphery/base/SelfPermit.sol';
import './base/periphery/base/PeripheryImmutableState.sol';

import './interfaces/ISmartRouter.sol';
import './V2SwapRouter.sol';
import './V3SwapRouter.sol';
import './StableSwapRouter.sol';
import './base/ApproveAndCall.sol';
import './base/MulticallExtended.sol';

/// @title Pancake Smart Router
contract SmartRouter is ISmartRouter, V3SwapRouter, ApproveAndCall, MulticallExtended, SelfPermit {
    constructor(
        address _deployer,
        address _factoryV3,
        address _positionManager,
        address _WETH9
    ) ImmutableState(address(0), _positionManager) PeripheryImmutableState(_deployer, _factoryV3, _WETH9) {}
}
