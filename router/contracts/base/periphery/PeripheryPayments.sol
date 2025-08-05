// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import './interfaces/IPeripheryPayments.sol';
import './interfaces/IWMON.sol';
import './libraries/TransferHelper.sol';
import './base/PeripheryImmutableState.sol';

abstract contract PeripheryPayments is IPeripheryPayments, PeripheryImmutableState {
    receive() external payable {
        require(msg.sender == WMON, 'Not Wrap Native Token');
    }

    /// @inheritdoc IPeripheryPayments
    function unwrapWMON(uint256 amountMinimum, address recipient) public payable override {
        uint256 balanceWMON = IWMON(WMON).balanceOf(address(this));
        require(balanceWMON >= amountMinimum, 'Insufficient Wrap Native Token');

        if (balanceWMON > 0) {
            IWMON(WMON).withdraw(balanceWMON);
            TransferHelper.safeTransferMON(recipient, balanceWMON);
        }
    }

    /// @inheritdoc IPeripheryPayments
    function sweepToken(
        address token,
        uint256 amountMinimum,
        address recipient
    ) public payable override {
        uint256 balanceToken = IERC20(token).balanceOf(address(this));
        require(balanceToken >= amountMinimum, 'Insufficient token');

        if (balanceToken > 0) {
            TransferHelper.safeTransfer(token, recipient, balanceToken);
        }
    }

    /// @inheritdoc IPeripheryPayments
    function refundMON() external payable override {
        if (address(this).balance > 0) TransferHelper.safeTransferMON(msg.sender, address(this).balance);
    }

    /// @param token The token to pay
    /// @param payer The entity that must pay
    /// @param recipient The entity that will receive payment
    /// @param value The amount to pay
    function pay(
        address token,
        address payer,
        address recipient,
        uint256 value
    ) internal {
        if (token == WMON && address(this).balance >= value) {
            // pay with WMON
            IWMON(WMON).deposit{value: value}(); // wrap only what is needed to pay
            IWMON(WMON).transfer(recipient, value);
        } else if (payer == address(this)) {
            // pay with tokens already in the contract (for the exact input multihop case)
            TransferHelper.safeTransfer(token, recipient, value);
        } else {
            // pull payment
            TransferHelper.safeTransferFrom(token, payer, recipient, value);
        }
    }
}
