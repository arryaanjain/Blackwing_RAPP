// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RAPPRegistry.sol";
import "./ListingManager.sol";

/**
 * @title QuoteManager
 * @dev Manages vendor quotations/bids on listings.
 *      Maps to QuoteController in the Laravel backend.
 *
 *      Flow: Vendor submits quote → Company reviews → Accept/Reject
 *      Vendor can update (while SUBMITTED) or withdraw.
 */
contract QuoteManager is Ownable {
    // ────────────────────── Enums ──────────────────────

    enum QuoteStatus {
        SUBMITTED,
        UNDER_REVIEW,
        ACCEPTED,
        REJECTED,
        WITHDRAWN
    }

    // ────────────────────── Structs ──────────────────────

    struct Quote {
        uint256 id;
        string quoteNumber;       // QUO-XXXXXXXXXX
        uint256 listingId;        // references ListingManager
        string vendorShareId;
        uint256 quotedPrice;      // in smallest currency unit
        string proposalHash;      // keccak256(proposal_details + line_items + T&C)
        uint256 deliveryDays;
        QuoteStatus status;
        uint256 submittedAt;
        uint256 expiresAt;
        uint256 reviewedAt;
        address reviewedBy;
        string reviewNotesHash;
        address submittedBy;      // Smart Account address
    }

    // ────────────────────── State ──────────────────────

    RAPPRegistry public registry;
    ListingManager public listingManager;

    mapping(uint256 => Quote) private quotes;
    uint256 public quoteCounter;

    /// listingId => vendorShareId => quoteId (one quote per vendor per listing)
    mapping(uint256 => mapping(string => uint256)) private vendorQuoteLookup;

    /// listingId => quoteIds
    mapping(uint256 => uint256[]) private listingQuotes;

    /// vendorShareId => quoteIds
    mapping(string => uint256[]) private vendorQuotes;

    /// quoteNumber => quoteId
    mapping(string => uint256) private quoteNumberLookup;

    // ────────────────────── Events ──────────────────────

    event QuoteSubmitted(
        uint256 indexed quoteId,
        string quoteNumber,
        uint256 indexed listingId,
        string vendorShareId,
        uint256 quotedPrice,
        uint256 timestamp
    );

    event QuoteUpdated(
        uint256 indexed quoteId,
        uint256 newPrice,
        uint256 newDeliveryDays,
        uint256 timestamp
    );

    event QuoteWithdrawn(uint256 indexed quoteId, uint256 timestamp);

    event QuoteReviewed(
        uint256 indexed quoteId,
        QuoteStatus newStatus,
        uint256 timestamp
    );

    // ────────────────────── Constructor ──────────────────────

    constructor(address _registryAddress, address _listingManagerAddress) Ownable(msg.sender) {
        registry = RAPPRegistry(_registryAddress);
        listingManager = ListingManager(_listingManagerAddress);
    }

    // ────────────────────── Modifiers ──────────────────────

    modifier quoteExists(uint256 _quoteId) {
        require(quotes[_quoteId].id > 0, "Quote does not exist");
        _;
    }

    // ────────────────────── Write Functions ──────────────────────

    /**
     * @dev Submit a new quote for a listing
     * @param _quoteNumber     Human-readable quote number (QUO-XXXXXXXXXX)
     * @param _listingId       The listing being quoted on
     * @param _vendorShareId   The vendor's share ID
     * @param _quotedPrice     Quoted price
     * @param _proposalHash    Hash of proposal details
     * @param _deliveryDays    Estimated delivery in days
     * @param _expiresAt       When the quote expires (0 = no expiry)
     */
    function submitQuote(
        string calldata _quoteNumber,
        uint256 _listingId,
        string calldata _vendorShareId,
        uint256 _quotedPrice,
        string calldata _proposalHash,
        uint256 _deliveryDays,
        uint256 _expiresAt
    ) external returns (uint256) {
        // Validate vendor is registered
        require(registry.isRegistered(_vendorShareId), "Vendor not registered");

        // Validate listing exists and is active
        require(listingManager.isListingActive(_listingId), "Listing is not active");

        // Validate vendor is authorized for this listing
        require(
            listingManager.isVendorAuthorized(_listingId, _vendorShareId),
            "Vendor not authorized for this listing"
        );

        // Validate no existing quote from this vendor
        require(
            vendorQuoteLookup[_listingId][_vendorShareId] == 0,
            "Vendor already submitted a quote for this listing"
        );

        require(bytes(_quoteNumber).length > 0, "Quote number cannot be empty");
        require(quoteNumberLookup[_quoteNumber] == 0, "Quote number already exists");
        require(_quotedPrice > 0, "Quoted price must be greater than 0");
        require(_deliveryDays > 0, "Delivery days must be greater than 0");

        quoteCounter++;
        uint256 quoteId = quoteCounter;

        quotes[quoteId] = Quote({
            id: quoteId,
            quoteNumber: _quoteNumber,
            listingId: _listingId,
            vendorShareId: _vendorShareId,
            quotedPrice: _quotedPrice,
            proposalHash: _proposalHash,
            deliveryDays: _deliveryDays,
            status: QuoteStatus.SUBMITTED,
            submittedAt: block.timestamp,
            expiresAt: _expiresAt,
            reviewedAt: 0,
            reviewedBy: address(0),
            reviewNotesHash: "",
            submittedBy: msg.sender
        });

        vendorQuoteLookup[_listingId][_vendorShareId] = quoteId;
        listingQuotes[_listingId].push(quoteId);
        vendorQuotes[_vendorShareId].push(quoteId);
        quoteNumberLookup[_quoteNumber] = quoteId;

        emit QuoteSubmitted(quoteId, _quoteNumber, _listingId, _vendorShareId, _quotedPrice, block.timestamp);
        return quoteId;
    }

    /**
     * @dev Update a submitted quote (only while status is SUBMITTED)
     */
    function updateQuote(
        uint256 _quoteId,
        uint256 _newPrice,
        string calldata _newProposalHash,
        uint256 _newDeliveryDays
    )
        external
        quoteExists(_quoteId)
    {
        Quote storage q = quotes[_quoteId];
        require(q.submittedBy == msg.sender || msg.sender == owner(), "Not quote owner");
        require(q.status == QuoteStatus.SUBMITTED, "Quote cannot be modified");
        require(_newPrice > 0, "Price must be greater than 0");
        require(_newDeliveryDays > 0, "Delivery days must be greater than 0");

        q.quotedPrice = _newPrice;
        if (bytes(_newProposalHash).length > 0) {
            q.proposalHash = _newProposalHash;
        }
        q.deliveryDays = _newDeliveryDays;

        emit QuoteUpdated(_quoteId, _newPrice, _newDeliveryDays, block.timestamp);
    }

    /**
     * @dev Withdraw a submitted or under-review quote
     */
    function withdrawQuote(uint256 _quoteId)
        external
        quoteExists(_quoteId)
    {
        Quote storage q = quotes[_quoteId];
        require(q.submittedBy == msg.sender || msg.sender == owner(), "Not quote owner");
        require(
            q.status == QuoteStatus.SUBMITTED || q.status == QuoteStatus.UNDER_REVIEW,
            "Quote cannot be withdrawn"
        );

        q.status = QuoteStatus.WITHDRAWN;

        emit QuoteWithdrawn(_quoteId, block.timestamp);
    }

    /**
     * @dev Company reviews a quote (accept, reject, or mark as under review)
     */
    function reviewQuote(
        uint256 _quoteId,
        QuoteStatus _newStatus,
        string calldata _reviewNotesHash
    )
        external
        quoteExists(_quoteId)
    {
        Quote storage q = quotes[_quoteId];
        require(
            _newStatus == QuoteStatus.UNDER_REVIEW ||
            _newStatus == QuoteStatus.ACCEPTED ||
            _newStatus == QuoteStatus.REJECTED,
            "Invalid review status"
        );
        require(
            q.status == QuoteStatus.SUBMITTED || q.status == QuoteStatus.UNDER_REVIEW,
            "Quote is not reviewable"
        );

        q.status = _newStatus;
        q.reviewedAt = block.timestamp;
        q.reviewedBy = msg.sender;
        q.reviewNotesHash = _reviewNotesHash;

        emit QuoteReviewed(_quoteId, _newStatus, block.timestamp);
    }

    // ────────────────────── View Functions ──────────────────────

    /**
     * @dev Get quote details
     */
    function getQuote(uint256 _quoteId)
        external
        view
        quoteExists(_quoteId)
        returns (
            uint256 id,
            string memory quoteNumber,
            uint256 listingId,
            string memory vendorShareId,
            uint256 quotedPrice,
            string memory proposalHash,
            uint256 deliveryDays,
            QuoteStatus status,
            uint256 submittedAt,
            uint256 expiresAt,
            uint256 reviewedAt,
            address reviewedBy,
            string memory reviewNotesHash
        )
    {
        Quote storage q = quotes[_quoteId];
        return (
            q.id, q.quoteNumber, q.listingId, q.vendorShareId,
            q.quotedPrice, q.proposalHash, q.deliveryDays, q.status,
            q.submittedAt, q.expiresAt, q.reviewedAt, q.reviewedBy,
            q.reviewNotesHash
        );
    }

    /**
     * @dev Get all quote IDs for a listing
     */
    function getQuotesByListing(uint256 _listingId)
        external
        view
        returns (uint256[] memory)
    {
        return listingQuotes[_listingId];
    }

    /**
     * @dev Get all quote IDs for a vendor
     */
    function getQuotesByVendor(string calldata _vendorShareId)
        external
        view
        returns (uint256[] memory)
    {
        return vendorQuotes[_vendorShareId];
    }

    /**
     * @dev Check if a vendor has already quoted on a listing
     */
    function hasVendorQuoted(uint256 _listingId, string calldata _vendorShareId)
        external
        view
        returns (bool)
    {
        return vendorQuoteLookup[_listingId][_vendorShareId] > 0;
    }

    /**
     * @dev Get the quote ID for a vendor on a specific listing (0 if none)
     */
    function getVendorQuoteId(uint256 _listingId, string calldata _vendorShareId)
        external
        view
        returns (uint256)
    {
        return vendorQuoteLookup[_listingId][_vendorShareId];
    }

    /**
     * @dev Get quote ID by quote number (0 if not found)
     */
    function getQuoteByNumber(string calldata _quoteNumber)
        external
        view
        returns (uint256)
    {
        return quoteNumberLookup[_quoteNumber];
    }
}
