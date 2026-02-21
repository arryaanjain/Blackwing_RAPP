// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RAPPRegistry.sol";

/**
 * @title ListingManager
 * @dev Manages product/service listings created by companies.
 *      Maps to ListingController in the Laravel backend.
 *
 *      Supports public and private listings. Private listings have an
 *      explicitly managed access control list of vendor shareIds.
 */
contract ListingManager is Ownable {
    // ────────────────────── Enums ──────────────────────

    enum Visibility {
        PUBLIC,
        PRIVATE
    }

    enum ListingStatus {
        DRAFT,
        ACTIVE,
        CLOSED,
        CANCELLED
    }

    // ────────────────────── Structs ──────────────────────

    struct Listing {
        uint256 id;
        string listingNumber;     // LST-XXXXXXXXXX
        string companyShareId;    // company that created the listing
        string contentHash;       // keccak256(title + description + requirements + specs)
        uint256 basePrice;        // in smallest currency unit
        Visibility visibility;
        ListingStatus status;
        uint256 createdAt;
        uint256 closesAt;
        address createdBy;        // Smart Account address
    }

    // ────────────────────── State ──────────────────────

    RAPPRegistry public registry;

    mapping(uint256 => Listing) private listings;
    uint256 public listingCounter;

    /// listingId => vendorShareId => authorized
    mapping(uint256 => mapping(string => bool)) private authorizedVendors;

    /// companyShareId => listingIds
    mapping(string => uint256[]) private companyListings;

    /// listingNumber => listingId (for lookup by listing number)
    mapping(string => uint256) private listingNumberLookup;

    // ────────────────────── Events ──────────────────────

    event ListingCreated(
        uint256 indexed listingId,
        string listingNumber,
        string companyShareId,
        Visibility visibility,
        uint256 timestamp
    );

    event ListingUpdated(
        uint256 indexed listingId,
        string newContentHash,
        ListingStatus newStatus,
        uint256 timestamp
    );

    event ListingClosed(uint256 indexed listingId, uint256 timestamp);

    event ListingCancelled(uint256 indexed listingId, uint256 timestamp);

    event VendorAccessGranted(
        uint256 indexed listingId,
        string vendorShareId,
        uint256 timestamp
    );

    event VendorAccessRevoked(
        uint256 indexed listingId,
        string vendorShareId,
        uint256 timestamp
    );

    // ────────────────────── Constructor ──────────────────────

    constructor(address _registryAddress) Ownable(msg.sender) {
        registry = RAPPRegistry(_registryAddress);
    }

    // ────────────────────── Modifiers ──────────────────────

    modifier listingExists(uint256 _listingId) {
        require(listings[_listingId].id > 0, "Listing does not exist");
        _;
    }

    modifier onlyListingOwner(uint256 _listingId) {
        require(
            listings[_listingId].createdBy == msg.sender || msg.sender == owner(),
            "Only listing owner or contract owner"
        );
        _;
    }

    // ────────────────────── Write Functions ──────────────────────

    /**
     * @dev Create a new listing
     * @param _listingNumber   Human-readable listing number (LST-XXXXXXXXXX)
     * @param _companyShareId  Share ID of the company creating the listing
     * @param _contentHash     Hash of listing content (title, description, specs, etc.)
     * @param _basePrice       Base/maximum price
     * @param _visibility      PUBLIC or PRIVATE
     * @param _status          DRAFT or ACTIVE (initial status)
     * @param _closesAt        When the listing closes (0 = no deadline)
     * @param _authorizedVendorShareIds  Array of vendor shareIds for PRIVATE listings
     */
    function createListing(
        string calldata _listingNumber,
        string calldata _companyShareId,
        string calldata _contentHash,
        uint256 _basePrice,
        Visibility _visibility,
        ListingStatus _status,
        uint256 _closesAt,
        string[] calldata _authorizedVendorShareIds
    ) external returns (uint256) {
        require(registry.isRegistered(_companyShareId), "Company not registered");
        require(bytes(_listingNumber).length > 0, "Listing number cannot be empty");
        require(listingNumberLookup[_listingNumber] == 0, "Listing number already exists");
        require(
            _status == ListingStatus.DRAFT || _status == ListingStatus.ACTIVE,
            "Initial status must be DRAFT or ACTIVE"
        );

        listingCounter++;
        uint256 listingId = listingCounter;

        listings[listingId] = Listing({
            id: listingId,
            listingNumber: _listingNumber,
            companyShareId: _companyShareId,
            contentHash: _contentHash,
            basePrice: _basePrice,
            visibility: _visibility,
            status: _status,
            createdAt: block.timestamp,
            closesAt: _closesAt,
            createdBy: msg.sender
        });

        listingNumberLookup[_listingNumber] = listingId;
        companyListings[_companyShareId].push(listingId);

        // Grant access to specified vendors for private listings
        if (_visibility == Visibility.PRIVATE) {
            for (uint256 i = 0; i < _authorizedVendorShareIds.length; i++) {
                authorizedVendors[listingId][_authorizedVendorShareIds[i]] = true;
                emit VendorAccessGranted(listingId, _authorizedVendorShareIds[i], block.timestamp);
            }
        }

        emit ListingCreated(listingId, _listingNumber, _companyShareId, _visibility, block.timestamp);
        return listingId;
    }

    /**
     * @dev Update a listing's content and/or status
     */
    function updateListing(
        uint256 _listingId,
        string calldata _newContentHash,
        ListingStatus _newStatus
    )
        external
        listingExists(_listingId)
        onlyListingOwner(_listingId)
    {
        Listing storage listing = listings[_listingId];
        require(
            listing.status != ListingStatus.CANCELLED,
            "Cannot update cancelled listing"
        );

        if (bytes(_newContentHash).length > 0) {
            listing.contentHash = _newContentHash;
        }
        listing.status = _newStatus;

        emit ListingUpdated(_listingId, _newContentHash, _newStatus, block.timestamp);
    }

    /**
     * @dev Close a listing (no more quotes accepted)
     */
    function closeListing(uint256 _listingId)
        external
        listingExists(_listingId)
        onlyListingOwner(_listingId)
    {
        require(listings[_listingId].status == ListingStatus.ACTIVE, "Listing is not active");
        listings[_listingId].status = ListingStatus.CLOSED;
        listings[_listingId].closesAt = block.timestamp;

        emit ListingClosed(_listingId, block.timestamp);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 _listingId)
        external
        listingExists(_listingId)
        onlyListingOwner(_listingId)
    {
        require(
            listings[_listingId].status != ListingStatus.CANCELLED,
            "Already cancelled"
        );
        listings[_listingId].status = ListingStatus.CANCELLED;

        emit ListingCancelled(_listingId, block.timestamp);
    }

    /**
     * @dev Grant a vendor access to a private listing
     */
    function grantVendorAccess(uint256 _listingId, string calldata _vendorShareId)
        external
        listingExists(_listingId)
        onlyListingOwner(_listingId)
    {
        require(!authorizedVendors[_listingId][_vendorShareId], "Vendor already authorized");
        authorizedVendors[_listingId][_vendorShareId] = true;

        emit VendorAccessGranted(_listingId, _vendorShareId, block.timestamp);
    }

    /**
     * @dev Revoke a vendor's access to a private listing
     */
    function revokeVendorAccess(uint256 _listingId, string calldata _vendorShareId)
        external
        listingExists(_listingId)
        onlyListingOwner(_listingId)
    {
        require(authorizedVendors[_listingId][_vendorShareId], "Vendor not authorized");
        authorizedVendors[_listingId][_vendorShareId] = false;

        emit VendorAccessRevoked(_listingId, _vendorShareId, block.timestamp);
    }

    // ────────────────────── View Functions ──────────────────────

    /**
     * @dev Get listing details
     */
    function getListing(uint256 _listingId)
        external
        view
        listingExists(_listingId)
        returns (
            uint256 id,
            string memory listingNumber,
            string memory companyShareId,
            string memory contentHash,
            uint256 basePrice,
            Visibility visibility,
            ListingStatus status,
            uint256 createdAt,
            uint256 closesAt,
            address createdBy
        )
    {
        Listing storage l = listings[_listingId];
        return (
            l.id, l.listingNumber, l.companyShareId, l.contentHash,
            l.basePrice, l.visibility, l.status, l.createdAt,
            l.closesAt, l.createdBy
        );
    }

    /**
     * @dev Check if a listing is currently active and open
     */
    function isListingActive(uint256 _listingId) external view returns (bool) {
        if (listings[_listingId].id == 0) return false;
        Listing storage l = listings[_listingId];
        if (l.status != ListingStatus.ACTIVE) return false;
        if (l.closesAt > 0 && block.timestamp > l.closesAt) return false;
        return true;
    }

    /**
     * @dev Check if a vendor is authorized to view/quote on a listing
     */
    function isVendorAuthorized(uint256 _listingId, string calldata _vendorShareId)
        external
        view
        returns (bool)
    {
        if (listings[_listingId].id == 0) return false;
        // Public listings are accessible to all
        if (listings[_listingId].visibility == Visibility.PUBLIC) return true;
        // Private listings check the access list
        return authorizedVendors[_listingId][_vendorShareId];
    }

    /**
     * @dev Get listing status
     */
    function getListingStatus(uint256 _listingId)
        external
        view
        listingExists(_listingId)
        returns (ListingStatus)
    {
        return listings[_listingId].status;
    }

    /**
     * @dev Get all listing IDs for a company
     */
    function getListingsByCompany(string calldata _companyShareId)
        external
        view
        returns (uint256[] memory)
    {
        return companyListings[_companyShareId];
    }

    /**
     * @dev Get listing ID by listing number (0 if not found)
     */
    function getListingByNumber(string calldata _listingNumber)
        external
        view
        returns (uint256)
    {
        return listingNumberLookup[_listingNumber];
    }
}
