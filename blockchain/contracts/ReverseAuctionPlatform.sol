// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ReverseAuctionPlatform
 * @dev Main contract for the Reverse Auction Platform managing companies, vendors, and listings
 * demo auction contract, doesnt do stuff
 */
contract ReverseAuctionPlatform {
    // State variables
    address public owner;
    uint256 private companyIdCounter = 1;
    
    // Structs
    struct Company {
        string companyId;
        string name;
        string gstNumber;
        string email;
        address walletAddress;
        bool isRegistered;
        mapping(address => bool) approvedVendors;
        mapping(address => bool) pendingVendors;
        uint256 timestamp;
    }
    
    struct Vendor {
        string name;
        string gstNumber;
        string email;
        address walletAddress;
        bool isRegistered;
        uint256 timestamp;
        mapping(string => bool) associatedCompanies;
        mapping(string => bool) pendingRequests;
    }

    struct ProductListing {
        uint256 id;
        string companyId;
        string title;
        string description;
        uint256 quantity;
        uint256 maxPrice;
        bool isPublic;
        bool acceptCrypto;
        address[] authorizedVendors;
        uint256 deadline;
        bool isActive;
        address owner;
    }
    
    // Mappings
    mapping(address => Company) private companies;
    mapping(address => Vendor) private vendors;
    mapping(string => address) private companyIdToAddress;
    mapping(uint256 => ProductListing) private productListings;
    uint256 private productListingCounter = 1;
    
    // Events
    event CompanyRegistered(string companyId, address indexed companyAddress);
    event VendorRegistered(address indexed vendorAddress);
    event CompanyAccessRequested(string companyId, address indexed vendorAddress);
    event VendorApproved(string companyId, address indexed vendorAddress);
    event VendorRejected(string companyId, address indexed vendorAddress);
    event ProductListingCreated(uint256 indexed listingId, string companyId);
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }
    
    modifier onlyCompany() {
        require(companies[msg.sender].isRegistered, "Only registered companies can call this function");
        _;
    }
    
    modifier onlyVendor() {
        require(vendors[msg.sender].isRegistered, "Only registered vendors can call this function");
        _;
    }
    
    // Functions
    
    /**
     * @dev Register a new company
     * @param name Company name
     * @param gstNumber Company GST number
     * @param email Company email
     * @return companyId Unique identifier for the company
     */
    function registerCompany(string memory name, string memory gstNumber, string memory email) public returns (string memory) {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        
        // Generate company ID
        string memory companyId = string(abi.encodePacked("COMP-", uint2str(companyIdCounter)));
        companyIdCounter++;
        
        // Create company
        Company storage newCompany = companies[msg.sender];
        newCompany.companyId = companyId;
        newCompany.name = name;
        newCompany.gstNumber = gstNumber;
        newCompany.email = email;
        newCompany.walletAddress = msg.sender;
        newCompany.isRegistered = true;
        newCompany.timestamp = block.timestamp;
        
        // Map company ID to address
        companyIdToAddress[companyId] = msg.sender;
        
        emit CompanyRegistered(companyId, msg.sender);
        
        return companyId;
    }
    
    /**
     * @dev Register a new vendor
     * @param name Vendor name
     * @param gstNumber Vendor GST number
     * @param email Vendor email
     */
    function registerVendor(string memory name, string memory gstNumber, string memory email) public {
        require(!vendors[msg.sender].isRegistered, "Vendor already registered");
        
        // Create vendor
        Vendor storage newVendor = vendors[msg.sender];
        newVendor.name = name;
        newVendor.gstNumber = gstNumber;
        newVendor.email = email;
        newVendor.walletAddress = msg.sender;
        newVendor.isRegistered = true;
        newVendor.timestamp = block.timestamp;
        
        emit VendorRegistered(msg.sender);
    }
    
    /**
     * @dev Request access to a company as a vendor
     * @param companyId ID of the company to request access to
     */
    function requestCompanyAccess(string memory companyId) public onlyVendor {
        address companyAddress = companyIdToAddress[companyId];
        require(companyAddress != address(0), "Company does not exist");
        require(!companies[companyAddress].approvedVendors[msg.sender], "Already approved by this company");
        require(!companies[companyAddress].pendingVendors[msg.sender], "Request already pending");
        
        // Add vendor to pending list
        companies[companyAddress].pendingVendors[msg.sender] = true;
        vendors[msg.sender].pendingRequests[companyId] = true;
        
        emit CompanyAccessRequested(companyId, msg.sender);
    }
    
    /**
     * @dev Approve a vendor's access request
     * @param vendorAddress Address of the vendor to approve
     */
    function approveVendor(address vendorAddress) public onlyCompany {
        require(companies[msg.sender].pendingVendors[vendorAddress], "No pending request from this vendor");
        
        // Remove from pending and add to approved
        companies[msg.sender].pendingVendors[vendorAddress] = false;
        companies[msg.sender].approvedVendors[vendorAddress] = true;
        
        // Update vendor's associated companies
        vendors[vendorAddress].associatedCompanies[companies[msg.sender].companyId] = true;
        vendors[vendorAddress].pendingRequests[companies[msg.sender].companyId] = false;
        
        emit VendorApproved(companies[msg.sender].companyId, vendorAddress);
    }
    
    /**
     * @dev Reject a vendor's access request
     * @param vendorAddress Address of the vendor to reject
     */
    function rejectVendor(address vendorAddress) public onlyCompany {
        require(companies[msg.sender].pendingVendors[vendorAddress], "No pending request from this vendor");
        
        // Remove from pending
        companies[msg.sender].pendingVendors[vendorAddress] = false;
        vendors[vendorAddress].pendingRequests[companies[msg.sender].companyId] = false;
        
        emit VendorRejected(companies[msg.sender].companyId, vendorAddress);
    }
    
    /**
     * @dev Create a new product listing
     * @param title Product title
     * @param description Product description
     * @param quantity Product quantity
     * @param maxPrice Maximum price
     * @param isPublic Whether the listing is public
     * @param acceptCrypto Whether to accept cryptocurrency
     * @param authorizedVendors Array of vendor addresses authorized to see the listing
     * @param durationInDays Duration of the listing in days
     * @return listingId ID of the created listing
     */
    function createProductListing(
        string memory title,
        string memory description,
        uint256 quantity,
        uint256 maxPrice,
        bool isPublic,
        bool acceptCrypto,
        address[] memory authorizedVendors,
        uint256 durationInDays
    ) public onlyCompany returns (uint256) {
        uint256 listingId = productListingCounter++;
        uint256 deadline = block.timestamp + (durationInDays * 1 days);
        
        ProductListing storage newListing = productListings[listingId];
        newListing.id = listingId;
        newListing.companyId = companies[msg.sender].companyId;
        newListing.title = title;
        newListing.description = description;
        newListing.quantity = quantity;
        newListing.maxPrice = maxPrice;
        newListing.isPublic = isPublic;
        newListing.acceptCrypto = acceptCrypto;
        newListing.deadline = deadline;
        newListing.isActive = true;
        newListing.owner = msg.sender;
        
        if (!isPublic) {
            // Validate that all authorized vendors are approved by the company
            for (uint256 i = 0; i < authorizedVendors.length; i++) {
                require(companies[msg.sender].approvedVendors[authorizedVendors[i]], "Unauthorized vendor in list");
                newListing.authorizedVendors.push(authorizedVendors[i]);
            }
        }
        
        emit ProductListingCreated(listingId, companies[msg.sender].companyId);
        
        return listingId;
    }
    
    /**
     * @dev Get a product listing by ID
     * @param listingId ID of the listing to retrieve
     * @return id The listing ID
     * @return companyId The company ID who created the listing
     * @return title The listing title
     * @return description The listing description
     * @return quantity The product quantity
     * @return maxPrice The maximum price
     * @return isPublic Whether the listing is public
     * @return acceptCrypto Whether cryptocurrency is accepted
     * @return authorizedVendors Array of authorized vendors
     * @return deadline The listing deadline
     * @return isActive Whether the listing is active
     * @return listingOwner The address of the listing owner
     */
    function getProductListing(uint256 listingId) public view returns (
        uint256 id,
        string memory companyId,
        string memory title,
        string memory description,
        uint256 quantity,
        uint256 maxPrice,
        bool isPublic,
        bool acceptCrypto,
        address[] memory authorizedVendors,
        uint256 deadline,
        bool isActive,
        address listingOwner
    ) {
        ProductListing storage listing = productListings[listingId];
        require(listing.id == listingId, "Listing does not exist");
        
        // If not public, only owner or authorized vendors can view
        if (!listing.isPublic) {
            require(
                msg.sender == listing.owner || 
                isAuthorizedVendor(listing.authorizedVendors, msg.sender),
                "Not authorized to view this listing"
            );
        }
        
        return (
            listing.id,
            listing.companyId,
            listing.title,
            listing.description,
            listing.quantity,
            listing.maxPrice,
            listing.isPublic,
            listing.acceptCrypto,
            listing.authorizedVendors,
            listing.deadline,
            listing.isActive,
            listing.owner
        );
    }
    
    /**
     * @dev Get all listings visible to a vendor
     * @return Array of listing IDs
     */
    function getVisibleListingsForVendor() public view onlyVendor returns (uint256[] memory) {
        // Count visible listings first
        uint256 count = 0;
        for (uint256 i = 1; i < productListingCounter; i++) {
            if (isListingVisibleToVendor(i, msg.sender)) {
                count++;
            }
        }
        
        // Then populate the array
        uint256[] memory visibleListings = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < productListingCounter; i++) {
            if (isListingVisibleToVendor(i, msg.sender)) {
                visibleListings[index] = i;
                index++;
            }
        }
        
        return visibleListings;
    }
    
    /**
     * @dev Check if a listing is visible to a vendor
     */
    function isListingVisibleToVendor(uint256 listingId, address vendorAddress) internal view returns (bool) {
        ProductListing storage listing = productListings[listingId];
        
        if (listing.id == 0 || !listing.isActive) {
            return false;
        }
        
        if (listing.isPublic) {
            return true;
        }
        
        return isAuthorizedVendor(listing.authorizedVendors, vendorAddress);
    }
    
    /**
     * @dev Check if a vendor is in the authorized list
     */
    function isAuthorizedVendor(address[] memory authorizedVendors, address vendorAddress) internal pure returns (bool) {
        for (uint256 i = 0; i < authorizedVendors.length; i++) {
            if (authorizedVendors[i] == vendorAddress) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get pending vendor requests for a company
     */
    function getPendingVendorRequests() public view onlyCompany returns (address[] memory) {
        // Count pending vendors first
        uint256 count = 0;
        uint256 registeredVendorsCount = 0;
        
        // First count all registered vendors to set the maximum array size
        for (uint256 i = 0; i < 100; i++) { // Limit to prevent gas issues
            address potentialVendor = address(uint160(i + 1)); // Sample addresses
            if (vendors[potentialVendor].isRegistered) {
                registeredVendorsCount++;
            }
        }
        
        // Create a temporary array of the maximum possible size
        address[] memory tempPending = new address[](registeredVendorsCount);
        
        // Check which vendors are pending
        for (uint256 i = 0; i < 100; i++) { // Limit to prevent gas issues
            address potentialVendor = address(uint160(i + 1)); // Sample addresses
            if (companies[msg.sender].pendingVendors[potentialVendor]) {
                tempPending[count] = potentialVendor;
                count++;
            }
        }
        
        // Create final array with correct size
        address[] memory pendingVendors = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            pendingVendors[i] = tempPending[i];
        }
        
        return pendingVendors;
    }
    
    /**
     * @dev Check if a user is registered as a company
     */
    function isCompany(address userAddress) public view returns (bool) {
        return companies[userAddress].isRegistered;
    }
    
    /**
     * @dev Check if a user is registered as a vendor
     */
    function isVendor(address userAddress) public view returns (bool) {
        return vendors[userAddress].isRegistered;
    }
    
    /**
     * @dev Get company information
     */
    function getCompanyInfo(address companyAddress) public view returns (
        string memory companyId,
        string memory name,
        string memory gstNumber,
        string memory email
    ) {
        require(companies[companyAddress].isRegistered, "Company not registered");
        
        Company storage company = companies[companyAddress];
        return (
            company.companyId,
            company.name,
            company.gstNumber,
            company.email
        );
    }
    
    /**
     * @dev Get vendor information
     */
    function getVendorInfo(address vendorAddress) public view returns (
        string memory name,
        string memory gstNumber,
        string memory email
    ) {
        require(vendors[vendorAddress].isRegistered, "Vendor not registered");
        
        Vendor storage vendor = vendors[vendorAddress];
        return (
            vendor.name,
            vendor.gstNumber,
            vendor.email
        );
    }
    
    /**
     * @dev Convert uint to string
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
