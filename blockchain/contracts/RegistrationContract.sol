// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RegistrationContract
 * @dev Contract for registering companies and vendors on blockchain with transparent verification
 * @author RAPP Platform
 */
contract RegistrationContract {
    // State variables
    address public owner;
    uint256 public totalRegistrations;
    
    // Enums
    enum EntityType { COMPANY, VENDOR }
    enum RegistrationStatus { PENDING, VERIFIED, REJECTED }
    
    // Structs
    struct Registration {
        string shareId;           // Unique share ID from database
        string entityId;          // Company ID or Vendor ID from database
        string name;              // Company name or Vendor name
        EntityType entityType;    // Company or Vendor
        address registrar;        // Address that registered the entity
        uint256 timestamp;        // Registration timestamp
        RegistrationStatus status; // Current status
        string ipfsHash;          // IPFS hash for additional data
        bool exists;              // Check if registration exists
    }
    
    // Mappings
    mapping(string => Registration) public registrations; // shareId => Registration
    mapping(address => string[]) public userRegistrations; // user => shareIds
    mapping(EntityType => uint256) public registrationCounts; // type => count
    
    // Events
    event EntityRegistered(
        string indexed shareId,
        string indexed entityId,
        string name,
        EntityType entityType,
        address indexed registrar,
        uint256 timestamp
    );
    
    event RegistrationStatusUpdated(
        string indexed shareId,
        RegistrationStatus oldStatus,
        RegistrationStatus newStatus,
        uint256 timestamp
    );
    
    event IPFSHashUpdated(
        string indexed shareId,
        string oldHash,
        string newHash,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier registrationExists(string memory _shareId) {
        require(registrations[_shareId].exists, "Registration does not exist");
        _;
    }
    
    modifier onlyRegistrar(string memory _shareId) {
        require(
            registrations[_shareId].registrar == msg.sender || msg.sender == owner,
            "Only registrar or owner can call this function"
        );
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        totalRegistrations = 0;
    }
    
    /**
     * @dev Register a new company or vendor
     * @param _shareId Unique share ID from database
     * @param _entityId Company ID or Vendor ID from database
     * @param _name Company name or Vendor name
     * @param _entityType Type of entity (COMPANY or VENDOR)
     * @param _ipfsHash Optional IPFS hash for additional data
     */
    function registerEntity(
        string memory _shareId,
        string memory _entityId,
        string memory _name,
        EntityType _entityType,
        string memory _ipfsHash
    ) external {
        require(!registrations[_shareId].exists, "Entity already registered with this share ID");
        require(bytes(_shareId).length > 0, "Share ID cannot be empty");
        require(bytes(_entityId).length > 0, "Entity ID cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        // Create new registration
        Registration storage newRegistration = registrations[_shareId];
        newRegistration.shareId = _shareId;
        newRegistration.entityId = _entityId;
        newRegistration.name = _name;
        newRegistration.entityType = _entityType;
        newRegistration.registrar = msg.sender;
        newRegistration.timestamp = block.timestamp;
        newRegistration.status = RegistrationStatus.PENDING;
        newRegistration.ipfsHash = _ipfsHash;
        newRegistration.exists = true;
        
        // Update counters and mappings
        totalRegistrations++;
        registrationCounts[_entityType]++;
        userRegistrations[msg.sender].push(_shareId);
        
        // Emit event
        emit EntityRegistered(
            _shareId,
            _entityId,
            _name,
            _entityType,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Update registration status (only owner)
     * @param _shareId Share ID of the registration
     * @param _newStatus New status to set
     */
    function updateRegistrationStatus(
        string memory _shareId,
        RegistrationStatus _newStatus
    ) external onlyOwner registrationExists(_shareId) {
        RegistrationStatus oldStatus = registrations[_shareId].status;
        registrations[_shareId].status = _newStatus;
        
        emit RegistrationStatusUpdated(_shareId, oldStatus, _newStatus, block.timestamp);
    }
    
    /**
     * @dev Update IPFS hash for additional data
     * @param _shareId Share ID of the registration
     * @param _newIpfsHash New IPFS hash
     */
    function updateIpfsHash(
        string memory _shareId,
        string memory _newIpfsHash
    ) external onlyRegistrar(_shareId) registrationExists(_shareId) {
        string memory oldHash = registrations[_shareId].ipfsHash;
        registrations[_shareId].ipfsHash = _newIpfsHash;
        
        emit IPFSHashUpdated(_shareId, oldHash, _newIpfsHash, block.timestamp);
    }
    
    /**
     * @dev Get registration details by share ID
     * @param _shareId Share ID to query
     * @return shareId The share ID of the registration
     * @return entityId The entity ID of the registration
     * @return name The name of the entity
     * @return entityType The type of entity (COMPANY or VENDOR)
     * @return registrar The address that registered the entity
     * @return timestamp The registration timestamp
     * @return status The current registration status
     * @return ipfsHash The IPFS hash for additional data
     */
    function getRegistration(string memory _shareId)
        external
        view
        registrationExists(_shareId)
        returns (
            string memory shareId,
            string memory entityId,
            string memory name,
            EntityType entityType,
            address registrar,
            uint256 timestamp,
            RegistrationStatus status,
            string memory ipfsHash
        )
    {
        Registration storage reg = registrations[_shareId];
        return (
            reg.shareId,
            reg.entityId,
            reg.name,
            reg.entityType,
            reg.registrar,
            reg.timestamp,
            reg.status,
            reg.ipfsHash
        );
    }
    
    /**
     * @dev Check if an entity is registered and verified
     * @param _shareId Share ID to check
     * @return isRegistered True if registered
     * @return isVerified True if verified
     */
    function isEntityVerified(string memory _shareId)
        external
        view
        returns (bool isRegistered, bool isVerified)
    {
        if (!registrations[_shareId].exists) {
            return (false, false);
        }
        
        isRegistered = true;
        isVerified = registrations[_shareId].status == RegistrationStatus.VERIFIED;
        return (isRegistered, isVerified);
    }
    
    /**
     * @dev Get all registrations by a user
     * @param _user User address
     * @return Array of share IDs registered by the user
     */
    function getUserRegistrations(address _user)
        external
        view
        returns (string[] memory)
    {
        return userRegistrations[_user];
    }
    
    /**
     * @dev Get registration counts by type
     * @param _entityType Entity type to query
     * @return count Number of registrations of this type
     */
    function getRegistrationCount(EntityType _entityType)
        external
        view
        returns (uint256 count)
    {
        return registrationCounts[_entityType];
    }
    
    /**
     * @dev Get platform statistics
     * @return totalRegs Total registrations
     * @return companyCount Total companies
     * @return vendorCount Total vendors
     */
    function getPlatformStats()
        external
        view
        returns (
            uint256 totalRegs,
            uint256 companyCount,
            uint256 vendorCount
        )
    {
        return (
            totalRegistrations,
            registrationCounts[EntityType.COMPANY],
            registrationCounts[EntityType.VENDOR]
        );
    }
    
    /**
     * @dev Emergency function to transfer ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }
    
    /**
     * @dev Verify if a share ID exists (public function)
     * @param _shareId Share ID to check
     * @return exists True if registration exists
     */
    function checkRegistrationExists(string memory _shareId) external view returns (bool exists) {
        return registrations[_shareId].exists;
    }
}
