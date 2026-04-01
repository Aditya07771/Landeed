// file: blockchain/contracts/Acquisition.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./LandRegistry.sol";

contract Acquisition {
    enum AcquisitionStatus {
        Pending,
        Verified,
        Approved,
        Rejected,
        Completed
    }

    struct AcquisitionRequest {
        string landId;
        address authority;
        address verifier;
        AcquisitionStatus status;
        uint256 amount;
        string notes;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    LandRegistry public landRegistry;
    
    mapping(string => AcquisitionRequest) public acquisitions;
    mapping(address => bool) public authorities;
    mapping(address => bool) public verifiers;
    
    address public admin;
    string[] public acquisitionIds;

    event AcquisitionRequested(
        string indexed landId,
        address indexed authority,
        uint256 amount,
        uint256 timestamp
    );

    event LandVerified(
        string indexed landId,
        address indexed verifier,
        string notes,
        uint256 timestamp
    );

    event AcquisitionApproved(
        string indexed landId,
        address indexed authority,
        uint256 timestamp
    );

    event AcquisitionRejected(
        string indexed landId,
        address indexed verifier,
        string reason,
        uint256 timestamp
    );

    event OwnershipTransferred(
        string indexed landId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Only authority");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Only verifier");
        _;
    }

    modifier acquisitionExists(string memory _landId) {
        require(acquisitions[_landId].exists, "Acquisition not found");
        _;
    }

    constructor(address _landRegistryAddress) {
        admin = msg.sender;
        landRegistry = LandRegistry(_landRegistryAddress);
    }

    function addAuthority(address _authority) external onlyAdmin {
        authorities[_authority] = true;
    }

    function removeAuthority(address _authority) external onlyAdmin {
        authorities[_authority] = false;
    }

    function addVerifier(address _verifier) external onlyAdmin {
        verifiers[_verifier] = true;
    }

    function removeVerifier(address _verifier) external onlyAdmin {
        verifiers[_verifier] = false;
    }

    function requestAcquisition(
        string memory _landId,
        uint256 _amount
    ) external onlyAuthority returns (bool) {
        require(!acquisitions[_landId].exists, "Acquisition already exists");
        require(_amount > 0, "Amount must be greater than 0");

        (,,LandRegistry.LandStatus status,,) = landRegistry.getLand(_landId);
        require(status == LandRegistry.LandStatus.Available, "Land not available");

        acquisitions[_landId] = AcquisitionRequest({
            landId: _landId,
            authority: msg.sender,
            verifier: address(0),
            status: AcquisitionStatus.Pending,
            amount: _amount,
            notes: "",
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });

        acquisitionIds.push(_landId);

        landRegistry.updateLandStatus(_landId, LandRegistry.LandStatus.UnderAcquisition);

        emit AcquisitionRequested(_landId, msg.sender, _amount, block.timestamp);

        return true;
    }

    function verifyLand(
        string memory _landId,
        string memory _notes
    ) external onlyVerifier acquisitionExists(_landId) returns (bool) {
        AcquisitionRequest storage acq = acquisitions[_landId];
        require(acq.status == AcquisitionStatus.Pending, "Invalid status");

        acq.verifier = msg.sender;
        acq.status = AcquisitionStatus.Verified;
        acq.notes = _notes;
        acq.updatedAt = block.timestamp;

        emit LandVerified(_landId, msg.sender, _notes, block.timestamp);

        return true;
    }

    function approveAcquisition(
        string memory _landId
    ) external onlyAuthority acquisitionExists(_landId) returns (bool) {
        AcquisitionRequest storage acq = acquisitions[_landId];
        require(acq.status == AcquisitionStatus.Verified, "Not verified");
        require(acq.authority == msg.sender, "Not requesting authority");

        acq.status = AcquisitionStatus.Approved;
        acq.updatedAt = block.timestamp;

        emit AcquisitionApproved(_landId, msg.sender, block.timestamp);

        return true;
    }

    function rejectAcquisition(
        string memory _landId,
        string memory _reason
    ) external onlyVerifier acquisitionExists(_landId) returns (bool) {
        AcquisitionRequest storage acq = acquisitions[_landId];
        require(
            acq.status == AcquisitionStatus.Pending || 
            acq.status == AcquisitionStatus.Verified,
            "Cannot reject"
        );

        acq.status = AcquisitionStatus.Rejected;
        acq.notes = _reason;
        acq.updatedAt = block.timestamp;

        landRegistry.updateLandStatus(_landId, LandRegistry.LandStatus.Available);

        emit AcquisitionRejected(_landId, msg.sender, _reason, block.timestamp);

        return true;
    }

    function transferOwnership(
        string memory _landId,
        address _newOwner
    ) external onlyAuthority acquisitionExists(_landId) returns (bool) {
        AcquisitionRequest storage acq = acquisitions[_landId];
        require(acq.status == AcquisitionStatus.Approved, "Not approved");
        require(acq.authority == msg.sender, "Not requesting authority");

        (,address currentOwner,,,) = landRegistry.getLand(_landId);

        landRegistry.transferOwnership(_landId, _newOwner);

        acq.status = AcquisitionStatus.Completed;
        acq.updatedAt = block.timestamp;

        emit OwnershipTransferred(_landId, currentOwner, _newOwner, block.timestamp);

        return true;
    }

    function getAcquisition(string memory _landId)
        external
        view
        acquisitionExists(_landId)
        returns (
            address authority,
            address verifier,
            AcquisitionStatus status,
            uint256 amount,
            string memory notes,
            uint256 createdAt,
            uint256 updatedAt
        )
    {
        AcquisitionRequest memory acq = acquisitions[_landId];
        return (
            acq.authority,
            acq.verifier,
            acq.status,
            acq.amount,
            acq.notes,
            acq.createdAt,
            acq.updatedAt
        );
    }

    function getAcquisitionCount() external view returns (uint256) {
        return acquisitionIds.length;
    }
}