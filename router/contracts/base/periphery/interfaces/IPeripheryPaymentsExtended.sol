// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;

import './IPeripheryPayments.sol';

/// @title Periphery Payments Extended
/// @notice Functions to ease deposits and withdrawals of MON and tokens
interface IPeripheryPaymentsExtended is IPeripheryPayments {
    // function unwrapWMON(uint256 amount, address to) external payable;

    /// @notice Wraps the contract's MON balance into WMON
    /// @dev The resulting WMON9 is custodied by the router, thus will require further distribution
    /// @param value The amount of MON to wrap
    function wrapMON(uint256 value) external payable;

    /// @notice Transfers the full amount of a token held by this contract to msg.sender
    /// @dev The amountMinimum parameter prevents malicious contracts from stealing the token from users
    /// @param token The contract address of the token which will be transferred to msg.sender
    /// @param amountMinimum The minimum amount of token required for a transfer
    function sweepToken(address token, uint256 amountMinimum) external payable;

    /// @notice Transfers the specified amount of a token from the msg.sender to address(this)
    /// @param token The token to pull
    /// @param value The amount to pay
    function pull(address token, uint256 value) external payable;
}
