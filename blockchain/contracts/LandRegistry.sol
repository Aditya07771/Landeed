// file: blockchain/contracts/LandRegistry.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LandRegistry {
    enum LandStatus {
        Available,
        UnderAcquisition,
        Acquired,
        Disputed
    }

    struct Land {
        string landId;
        address owner;
        LandStatus status;
        bytes32 documentHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Land) public lands;
    string[] public landIds;

    address public admin;

    event LandRegistered(
        string indexed landId,
        address indexed owner,
        bytes32 documentHash,
        uint256 timestamp
    );

    event LandStatusUpdated(
        string indexed landId,
        LandStatus oldStatus,
        LandStatus newStatus,
        uint256 timestamp
    );

    event LandOwnershipTransferred(
        string indexed landId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    event DocumentHashUpdated(
        string indexed landId,
        bytes32 oldHash,
        bytes32 newHash,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier landExists(string memory _landId) {
        require(lands[_landId].exists, "Land does not exist");
        _;
    }

    modifier onlyLandOwner(string memory _landId) {
        require(lands[_landId].owner == msg.sender, "Not land owner");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerLand(
        string memory _landId,
        bytes32 _documentHash
    ) external returns (bool) {
        require(!lands[_landId].exists, "Land already registered");
        require(bytes(_landId).length > 0, "Invalid land ID");

        lands[_landId] = Land({
            landId: _landId,
            owner: msg.sender,
            status: LandStatus.Available,
            documentHash: _documentHash,
            timestamp: block.timestamp,
            exists: true
        });

        landIds.push(_landId);

        emit LandRegistered(_landId, msg.sender, _documentHash, block.timestamp);

        return true;
    }

    function getLand(string memory _landId) 
        external 
        view 
        landExists(_landId)
        returns (
            string memory landId,
            address owner,
            LandStatus status,
            bytes32 documentHash,
            uint256 timestamp
        ) 
    {
        Land memory land = lands[_landId];
        return (
            land.landId,
            land.owner,
            land.status,
            land.documentHash,
            land.timestamp
        );
    }

    function updateLandStatus(
        string memory _landId,
        LandStatus _newStatus
    ) external landExists(_landId) returns (bool) {
        require(
            msg.sender == admin || msg.sender == lands[_landId].owner,
            "Not authorized"
        );

        LandStatus oldStatus = lands[_landId].status;
        lands[_landId].status = _newStatus;

        emit LandStatusUpdated(_landId, oldStatus, _newStatus, block.timestamp);

        return true;
    }

    function transferOwnership(
        string memory _landId,
        address _newOwner
    ) external landExists(_landId) returns (bool) {
        require(_newOwner != address(0), "Invalid address");
        require(
            msg.sender == admin || msg.sender == lands[_landId].owner,
            "Not authorized"
        );

        address previousOwner = lands[_landId].owner;
        lands[_landId].owner = _newOwner;
        lands[_landId].status = LandStatus.Acquired;

        emit LandOwnershipTransferred(_landId, previousOwner, _newOwner, block.timestamp);

        return true;
    }

    function updateDocumentHash(
        string memory _landId,
        bytes32 _newHash
    ) external landExists(_landId) onlyLandOwner(_landId) returns (bool) {
        bytes32 oldHash = lands[_landId].documentHash;
        lands[_landId].documentHash = _newHash;

        emit DocumentHashUpdated(_landId, oldHash, _newHash, block.timestamp);

        return true;
    }

    function getLandCount() external view returns (uint256) {
        return landIds.length;
    }

    function verifyDocumentHash(
        string memory _landId,
        bytes32 _hash
    ) external view landExists(_landId) returns (bool) {
        return lands[_landId].documentHash == _hash;
    }
}