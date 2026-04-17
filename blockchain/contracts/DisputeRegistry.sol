// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DisputeRegistry {
    address public admin;

    event DisputeFiled(string landId, address filedBy, string category, uint256 timestamp);
    event DisputeResolved(string landId, address resolvedBy, string resolution, uint256 timestamp);
    event LandFrozen(string landId, address frozenBy, uint256 timestamp);
    event LandUnfrozen(string landId, address unfrozenBy, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function fileDispute(string memory landId, string memory category) external {
        emit DisputeFiled(landId, msg.sender, category, block.timestamp);
    }

    function resolveDispute(string memory landId, string memory resolution) external onlyAdmin {
        emit DisputeResolved(landId, msg.sender, resolution, block.timestamp);
    }

    function freezeLand(string memory landId) external onlyAdmin {
        emit LandFrozen(landId, msg.sender, block.timestamp);
    }

    function unfreezeLand(string memory landId) external onlyAdmin {
        emit LandUnfrozen(landId, msg.sender, block.timestamp);
    }
}
