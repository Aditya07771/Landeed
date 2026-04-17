// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PrivateTransfer {
    address public admin;

    event SaleInitiated(string landId, address seller, address buyer, uint256 amount, uint256 timestamp);
    event SaleCompleted(string landId, address seller, address buyer, uint256 amount, uint256 timestamp);
    event SaleCancelled(string landId, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function initiateSale(string memory landId, address buyer) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        emit SaleInitiated(landId, msg.sender, buyer, msg.value, block.timestamp);
    }

    function completeSale(string memory landId, address seller, address buyer, uint256 amount) external onlyAdmin {
        emit SaleCompleted(landId, seller, buyer, amount, block.timestamp);
    }

    function cancelSale(string memory landId) external {
        emit SaleCancelled(landId, block.timestamp);
    }
}
