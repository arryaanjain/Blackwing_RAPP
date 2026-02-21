// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RAPPRegistration
 * @dev Contract for registering companies and vendors on the RAPP platform
 * demo contract,doesnt do stuff
 */
contract RAPPRegistration {
    
    // Events
    event CompanyRegistered(address indexed walletAddress, string name, string shareId);
    event VendorRegistered(address indexed walletAddress, string name, string shareId);
    
    // Structs
    struct Company {
        string name;
        string shareId;
        string businessType;
        string location;
        address walletAddress;
        uint256 registeredAt;
        bool isActive;
    }
    
    struct Vendor {
        string name;
        string shareId;
        string specialization;
        string location;
        address walletAddress;
        uint256 registeredAt;
        bool isActive;
    }
    
    // State variables
    mapping(address => Company) public companies;
    mapping(address => Vendor) public vendors;
    mapping(string => bool) public shareIdExists;
    
    address[] public companyAddresses;
    address[] public vendorAddresses;
    
    // Modifiers
    modifier notAlreadyRegisteredAsCompany() {
        require(!companies[msg.sender].isActive, "Company already registered");
        _;
    }
    
    modifier notAlreadyRegisteredAsVendor() {
        require(!vendors[msg.sender].isActive, "Vendor already registered");
        _;
    }
    
    modifier uniqueShareId(string memory _shareId) {
        require(!shareIdExists[_shareId], "Share ID already exists");
        _;
    }
    
    modifier notEmpty(string memory _str) {
        require(bytes(_str).length > 0, "String cannot be empty");
        _;
    }
    
    // Functions
    
    /**
     * @dev Register a new company
     * @param _name Company name
     * @param _shareId Unique share ID
     * @param _businessType Type of business
     * @param _location Company location
     */
    function registerCompany(
        string memory _name,
        string memory _shareId,
        string memory _businessType,
        string memory _location
    ) 
        external 
        notAlreadyRegisteredAsCompany 
        uniqueShareId(_shareId)
        notEmpty(_name)
        notEmpty(_shareId)
        notEmpty(_businessType)
        notEmpty(_location)
    {
        companies[msg.sender] = Company({
            name: _name,
            shareId: _shareId,
            businessType: _businessType,
            location: _location,
            walletAddress: msg.sender,
            registeredAt: block.timestamp,
            isActive: true
        });
        
        shareIdExists[_shareId] = true;
        companyAddresses.push(msg.sender);
        
        emit CompanyRegistered(msg.sender, _name, _shareId);
    }
    
    /**
     * @dev Register a new vendor
     * @param _name Vendor name
     * @param _shareId Unique share ID
     * @param _specialization Vendor specialization
     * @param _location Vendor location
     */
    function registerVendor(
        string memory _name,
        string memory _shareId,
        string memory _specialization,
        string memory _location
    ) 
        external 
        notAlreadyRegisteredAsVendor 
        uniqueShareId(_shareId)
        notEmpty(_name)
        notEmpty(_shareId)
        notEmpty(_specialization)
        notEmpty(_location)
    {
        vendors[msg.sender] = Vendor({
            name: _name,
            shareId: _shareId,
            specialization: _specialization,
            location: _location,
            walletAddress: msg.sender,
            registeredAt: block.timestamp,
            isActive: true
        });
        
        shareIdExists[_shareId] = true;
        vendorAddresses.push(msg.sender);
        
        emit VendorRegistered(msg.sender, _name, _shareId);
    }
    
    /**
     * @dev Get company details
     * @param _companyAddress Address of the company
     * @return name Company name
     * @return shareId Company share ID
     * @return businessType Company business type
     * @return location Company location
     * @return walletAddress Company wallet address
     * @return registeredAt Registration timestamp
     * @return isActive Company active status
     */
    function getCompany(address _companyAddress) 
        external 
        view 
        returns (
            string memory name,
            string memory shareId,
            string memory businessType,
            string memory location,
            address walletAddress,
            uint256 registeredAt,
            bool isActive
        ) 
    {
        Company memory company = companies[_companyAddress];
        return (
            company.name,
            company.shareId,
            company.businessType,
            company.location,
            company.walletAddress,
            company.registeredAt,
            company.isActive
        );
    }
    
    /**
     * @dev Get vendor details
     * @param _vendorAddress Address of the vendor
     * @return name Vendor name
     * @return shareId Vendor share ID
     * @return specialization Vendor specialization
     * @return location Vendor location
     * @return walletAddress Vendor wallet address
     * @return registeredAt Registration timestamp
     * @return isActive Vendor active status
     */
    function getVendor(address _vendorAddress) 
        external 
        view 
        returns (
            string memory name,
            string memory shareId,
            string memory specialization,
            string memory location,
            address walletAddress,
            uint256 registeredAt,
            bool isActive
        ) 
    {
        Vendor memory vendor = vendors[_vendorAddress];
        return (
            vendor.name,
            vendor.shareId,
            vendor.specialization,
            vendor.location,
            vendor.walletAddress,
            vendor.registeredAt,
            vendor.isActive
        );
    }
    
    /**
     * @dev Check if a company is registered
     * @param _companyAddress Address to check
     * @return True if company is registered
     */
    function isCompanyRegistered(address _companyAddress) external view returns (bool) {
        return companies[_companyAddress].isActive;
    }
    
    /**
     * @dev Check if a vendor is registered
     * @param _vendorAddress Address to check
     * @return True if vendor is registered
     */
    function isVendorRegistered(address _vendorAddress) external view returns (bool) {
        return vendors[_vendorAddress].isActive;
    }
    
    /**
     * @dev Get total number of registered companies
     * @return Number of companies
     */
    function getTotalCompanies() external view returns (uint256) {
        return companyAddresses.length;
    }
    
    /**
     * @dev Get total number of registered vendors
     * @return Number of vendors
     */
    function getTotalVendors() external view returns (uint256) {
        return vendorAddresses.length;
    }
    
    /**
     * @dev Verify registration by share ID
     * @param _shareId Share ID to verify
     * @return True if share ID exists
     */
    function verifyByShareId(string memory _shareId) external view returns (bool) {
        return shareIdExists[_shareId];
    }
}
