// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IMasterChefV3 {
    function latestPeriodEndTime() external view returns (uint256);

    function latestPeriodStartTime() external view returns (uint256);

    function upkeep(uint256 amount, uint256 duration, bool withUpdate) external;

    function userPositionInfos(uint256 _tokenId)
    external
    view
    returns (
        uint128,
        uint128,
        int24,
        int24,
        uint256,
        uint256,
        address,
        uint256,
        uint256
    );

    function poolInfo(uint256 _pid)
        external
        view
        returns (
            uint256,
            address,
            address,
            address,
            uint24,
            uint256,
            uint256
        );

    function v3PoolAddressPid(address _pool) external view returns (uint256);

    function updateBoostMultiplier(uint256 _tokenId, uint256 _newMultiplier) external;

    function updateLiquidity(uint256 _tokenId) external;

    function nonfungiblePositionManager() external view returns (address);
}
