// file: blockchain/contracts/Escrow.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Escrow {
    enum PaymentStatus {
        Pending,
        Locked,
        Released,
        Refunded
    }

    struct Payment {
        string landId;
        address authority;
        address landOwner;
        uint256 amount;
        PaymentStatus status;
        uint256 lockedAt;
        uint256 releasedAt;
        bool exists;
    }

    mapping(string => Payment) public payments;
    string[] public paymentIds;

    address public admin;

    event FundsLocked(
        string indexed landId,
        address indexed authority,
        address indexed landOwner,
        uint256 amount,
        uint256 timestamp
    );

    event FundsReleased(
        string indexed landId,
        address indexed landOwner,
        uint256 amount,
        uint256 timestamp
    );

    event FundsRefunded(
        string indexed landId,
        address indexed authority,
        uint256 amount,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier paymentExists(string memory _landId) {
        require(payments[_landId].exists, "Payment not found");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function lockFunds(
        string memory _landId,
        address _landOwner
    ) external payable returns (bool) {
        require(!payments[_landId].exists, "Payment already exists");
        require(msg.value > 0, "Amount must be greater than 0");
        require(_landOwner != address(0), "Invalid land owner");

        payments[_landId] = Payment({
            landId: _landId,
            authority: msg.sender,
            landOwner: _landOwner,
            amount: msg.value,
            status: PaymentStatus.Locked,
            lockedAt: block.timestamp,
            releasedAt: 0,
            exists: true
        });

        paymentIds.push(_landId);

        emit FundsLocked(_landId, msg.sender, _landOwner, msg.value, block.timestamp);

        return true;
    }

    function releaseFunds(
        string memory _landId
    ) external paymentExists(_landId) returns (bool) {
        Payment storage payment = payments[_landId];
        
        require(payment.status == PaymentStatus.Locked, "Funds not locked");
        require(
            msg.sender == admin || msg.sender == payment.authority,
            "Not authorized"
        );

        payment.status = PaymentStatus.Released;
        payment.releasedAt = block.timestamp;

        (bool sent, ) = payment.landOwner.call{value: payment.amount}("");
        require(sent, "Transfer failed");

        emit FundsReleased(_landId, payment.landOwner, payment.amount, block.timestamp);

        return true;
    }

    function refundFunds(
        string memory _landId
    ) external paymentExists(_landId) returns (bool) {
        Payment storage payment = payments[_landId];
        
        require(payment.status == PaymentStatus.Locked, "Funds not locked");
        require(
            msg.sender == admin || msg.sender == payment.authority,
            "Not authorized"
        );

        payment.status = PaymentStatus.Refunded;

        (bool sent, ) = payment.authority.call{value: payment.amount}("");
        require(sent, "Refund failed");

        emit FundsRefunded(_landId, payment.authority, payment.amount, block.timestamp);

        return true;
    }

    function getPayment(string memory _landId)
        external
        view
        paymentExists(_landId)
        returns (
            address authority,
            address landOwner,
            uint256 amount,
            PaymentStatus status,
            uint256 lockedAt,
            uint256 releasedAt
        )
    {
        Payment memory p = payments[_landId];
        return (
            p.authority,
            p.landOwner,
            p.amount,
            p.status,
            p.lockedAt,
            p.releasedAt
        );
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}