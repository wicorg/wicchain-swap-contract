// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './pool/IMonPoolImmutables.sol';
import './pool/IMonPoolState.sol';
import './pool/IMonPoolDerivedState.sol';
import './pool/IMonPoolActions.sol';
import './pool/IMonPoolOwnerActions.sol';
import './pool/IMonPoolEvents.sol';

/// @title The interface for a PancakeSwap V3 Pool
/// @notice A PancakeSwap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IMonPool is
    IMonPoolImmutables,
    IMonPoolState,
    IMonPoolDerivedState,
    IMonPoolActions,
    IMonPoolOwnerActions,
    IMonPoolEvents
{

}
