// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RAPPRegistry
 * @dev Consolidated registration contract for companies and vendors on the RAPP platform.
 *      Replaces RAPPRegistration.sol, RegistrationContract.sol, and registration parts of
 *      ReverseAuctionPlatform.sol.
 *
 *      Stores a metadataHash instead of raw data (GST, location, etc.) to save gas.
 *      Heavy data lives off-chain in the database; the blockchain provides an immutable
 *      audit trail and public verifiability.
 */
contract RAPPRegistry is Ownable {
    // ────────────────────── Enums ──────────────────────

    enum EntityType {
        COMPANY,
        VENDOR
    }

    // ────────────────────── Structs ──────────────────────

    struct Entity {
        string shareId;        // SH-XXXXXXXXXXXX
        string name;
        EntityType entityType; // COMPANY or VENDOR
        string metadataHash;   // keccak256 of off-chain JSON (GST, location, businessType, etc.)
        address registrar;     // Biconomy Smart Account or EOA that registered
        uint256 registeredAt;
        bool isActive;
    }

    // ────────────────────── State ──────────────────────

    /// shareId → Entity
    mapping(string => Entity) private entities;

    /// registrar address → list of shareIds they own
    mapping(address => string[]) private registrarEntities;

    /// shareId existence check (cheaper than checking struct)
    mapping(string => bool) public shareIdExists;

    /// Counters
    uint256 public totalCompanies;
    uint256 public totalVendors;

    // ────────────────────── Events ──────────────────────

    event EntityRegistered(
        string indexed shareId,
        string name,
        EntityType entityType,
        address indexed registrar,
        uint256 timestamp
    );

    event EntityDeactivated(string indexed shareId, uint256 timestamp);

    event EntityReactivated(string indexed shareId, uint256 timestamp);

    event MetadataUpdated(
        string indexed shareId,
        string oldMetadataHash,
        string newMetadataHash,
        uint256 timestamp
    );

    // ────────────────────── Constructor ──────────────────────

    constructor() Ownable(msg.sender) {}

    // ────────────────────── Modifiers ──────────────────────

    modifier entityExists(string memory _shareId) {
        require(shareIdExists[_shareId], "Entity does not exist");
        _;
    }

    modifier onlyRegistrarOrOwner(string memory _shareId) {
        require(
            entities[_shareId].registrar == msg.sender || msg.sender == owner(),
            "Only registrar or owner"
        );
        _;
    }

    // ────────────────────── Write Functions ──────────────────────

    /**
     * @dev Register a new company or vendor entity
     * @param _shareId   Unique share ID from the database (SH-XXXXXXXXXXXX)
     * @param _name      Entity name (company or vendor name)
     * @param _entityType COMPANY (0) or VENDOR (1)
     * @param _metadataHash keccak256 hash of off-chain JSON payload
     */
    function registerEntity(
        string calldata _shareId,
        string calldata _name,
        EntityType _entityType,
        string calldata _metadataHash
    ) external {
        require(!shareIdExists[_shareId], "Share ID already registered");
        require(bytes(_shareId).length > 0, "Share ID cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");

        entities[_shareId] = Entity({
            shareId: _shareId,
            name: _name,
            entityType: _entityType,
            metadataHash: _metadataHash,
            registrar: msg.sender,
            registeredAt: block.timestamp,
            isActive: true
        });

        shareIdExists[_shareId] = true;
        registrarEntities[msg.sender].push(_shareId);

        if (_entityType == EntityType.COMPANY) {
            totalCompanies++;
        } else {
            totalVendors++;
        }

        emit EntityRegistered(_shareId, _name, _entityType, msg.sender, block.timestamp);
    }

    /**
     * @dev Deactivate an entity (soft delete)
     */
    function deactivateEntity(string calldata _shareId)
        external
        entityExists(_shareId)
        onlyRegistrarOrOwner(_shareId)
    {
        require(entities[_shareId].isActive, "Entity already inactive");
        entities[_shareId].isActive = false;

        emit EntityDeactivated(_shareId, block.timestamp);
    }

    /**
     * @dev Reactivate a deactivated entity
     */
    function reactivateEntity(string calldata _shareId)
        external
        entityExists(_shareId)
        onlyRegistrarOrOwner(_shareId)
    {
        require(!entities[_shareId].isActive, "Entity already active");
        entities[_shareId].isActive = true;

        emit EntityReactivated(_shareId, block.timestamp);
    }

    /**
     * @dev Update the metadata hash for an entity
     */
    function updateMetadata(string calldata _shareId, string calldata _newMetadataHash)
        external
        entityExists(_shareId)
        onlyRegistrarOrOwner(_shareId)
    {
        string memory oldHash = entities[_shareId].metadataHash;
        entities[_shareId].metadataHash = _newMetadataHash;

        emit MetadataUpdated(_shareId, oldHash, _newMetadataHash, block.timestamp);
    }

    // ────────────────────── View Functions ──────────────────────

    /**
     * @dev Get full entity details by shareId
     */
    function getEntity(string calldata _shareId)
        external
        view
        entityExists(_shareId)
        returns (
            string memory shareId,
            string memory name,
            EntityType entityType,
            string memory metadataHash,
            address registrar,
            uint256 registeredAt,
            bool isActive
        )
    {
        Entity storage e = entities[_shareId];
        return (e.shareId, e.name, e.entityType, e.metadataHash, e.registrar, e.registeredAt, e.isActive);
    }

    /**
     * @dev Check if a shareId is registered AND currently active
     */
    function isRegistered(string calldata _shareId) external view returns (bool) {
        return shareIdExists[_shareId] && entities[_shareId].isActive;
    }

    /**
     * @dev Check if a shareId ever existed (active or not)
     */
    function exists(string calldata _shareId) external view returns (bool) {
        return shareIdExists[_shareId];
    }

    /**
     * @dev Get the registrar address for an entity
     */
    function getRegistrar(string calldata _shareId)
        external
        view
        entityExists(_shareId)
        returns (address)
    {
        return entities[_shareId].registrar;
    }

    /**
     * @dev Get all shareIds registered by an address
     */
    function getEntitiesByRegistrar(address _registrar)
        external
        view
        returns (string[] memory)
    {
        return registrarEntities[_registrar];
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats()
        external
        view
        returns (uint256 companies, uint256 vendors, uint256 total)
    {
        return (totalCompanies, totalVendors, totalCompanies + totalVendors);
    }
}
