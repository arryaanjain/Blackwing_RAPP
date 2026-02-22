// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RAPPRegistry.sol";

/**
 * @title RAPPAuction
 * @dev On-chain records for reverse auction lifecycle.
 *      Maps to AuctionController / BidController in the Laravel backend.
 *
 *      The actual real-time bidding logic runs off-chain for speed.
 *      This contract stores immutable proof records of:
 *        - Auction creation  (listing escalated to auction)
 *        - Each valid bid     (price + vendor + timestamp)
 *        - Auction end        (winner + final price)
 *        - Receipt generation (hash of full tx trail)
 */
contract RAPPAuction is Ownable {
    // ────────────────────── Enums ──────────────────────

    enum AuctionStatus {
        CREATED,
        RUNNING,
        COMPLETED,
        CANCELLED
    }

    // ────────────────────── Structs ──────────────────────

    struct AuctionRecord {
        uint256 id;
        uint256 listingId;           // references ListingManager
        string  buyerShareId;        // company that created the auction
        uint256 startTime;
        uint256 endTime;
        AuctionStatus status;
        uint256 participantCount;
        uint256 bidCount;
        string  winnerShareId;       // vendor who won (set on end)
        uint256 winningBid;          // final lowest bid (set on end)
        bytes32 receiptHash;         // SHA256 of all tx hashes (set on end)
        uint256 createdAt;
    }

    struct BidRecord {
        uint256 id;
        uint256 auctionId;
        string  vendorShareId;
        uint256 bidAmount;           // in smallest currency unit
        uint256 timestamp;
        uint256 rank;                // rank at time of bid
    }

    // ────────────────────── State ──────────────────────

    RAPPRegistry public registry;

    mapping(uint256 => AuctionRecord) private auctions;
    uint256 public auctionCounter;

    mapping(uint256 => BidRecord) private bids;
    uint256 public bidCounter;

    /// auctionId => bidIds (chronological order)
    mapping(uint256 => uint256[]) private auctionBids;

    /// auctionId => vendorShareId => bidIds
    mapping(uint256 => mapping(string => uint256[])) private vendorBids;

    /// listingId => auctionId (latest auction for a listing)
    mapping(uint256 => uint256) private listingAuction;

    // ────────────────────── Events ──────────────────────

    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed listingId,
        string  buyerShareId,
        uint256 participantCount,
        uint256 startTime,
        uint256 endTime
    );

    event BidRecorded(
        uint256 indexed bidId,
        uint256 indexed auctionId,
        string  vendorShareId,
        uint256 bidAmount,
        uint256 rank,
        uint256 timestamp
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        string  winnerShareId,
        uint256 winningBid,
        uint256 totalBids,
        uint256 timestamp
    );

    event ReceiptGenerated(
        uint256 indexed auctionId,
        bytes32 receiptHash,
        uint256 timestamp
    );

    // ────────────────────── Constructor ──────────────────────

    constructor(address _registryAddress) Ownable(msg.sender) {
        registry = RAPPRegistry(_registryAddress);
    }

    // ────────────────────── Modifiers ──────────────────────

    modifier auctionExists(uint256 _auctionId) {
        require(auctions[_auctionId].id > 0, "Auction does not exist");
        _;
    }

    // ────────────────────── Write Functions ──────────────────────

    /**
     * @dev Record auction creation on-chain
     * @param _listingId       The listing being escalated to auction
     * @param _buyerShareId    The company's share ID
     * @param _participantCount Number of vendors enrolled
     * @param _startTime       Auction start timestamp
     * @param _endTime         Auction end timestamp
     */
    function createAuction(
        uint256 _listingId,
        string calldata _buyerShareId,
        uint256 _participantCount,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner returns (uint256) {
        require(registry.isRegistered(_buyerShareId), "Buyer not registered");
        require(_participantCount >= 2, "Need at least 2 participants");
        require(_endTime > _startTime, "End must be after start");

        auctionCounter++;
        uint256 auctionId = auctionCounter;

        auctions[auctionId] = AuctionRecord({
            id: auctionId,
            listingId: _listingId,
            buyerShareId: _buyerShareId,
            startTime: _startTime,
            endTime: _endTime,
            status: AuctionStatus.RUNNING,
            participantCount: _participantCount,
            bidCount: 0,
            winnerShareId: "",
            winningBid: 0,
            receiptHash: bytes32(0),
            createdAt: block.timestamp
        });

        listingAuction[_listingId] = auctionId;

        emit AuctionCreated(
            auctionId, _listingId, _buyerShareId,
            _participantCount, _startTime, _endTime
        );

        return auctionId;
    }

    /**
     * @dev Record a valid bid on-chain
     * @param _auctionId      The auction
     * @param _vendorShareId  The bidding vendor's share ID
     * @param _bidAmount      Bid amount in smallest unit
     * @param _rank           Vendor's rank after this bid
     */
    function recordBid(
        uint256 _auctionId,
        string calldata _vendorShareId,
        uint256 _bidAmount,
        uint256 _rank
    )
        external
        onlyOwner
        auctionExists(_auctionId)
        returns (uint256)
    {
        AuctionRecord storage a = auctions[_auctionId];
        require(a.status == AuctionStatus.RUNNING, "Auction is not running");
        require(registry.isRegistered(_vendorShareId), "Vendor not registered");
        require(_bidAmount > 0, "Bid must be > 0");

        bidCounter++;
        uint256 bidId = bidCounter;

        bids[bidId] = BidRecord({
            id: bidId,
            auctionId: _auctionId,
            vendorShareId: _vendorShareId,
            bidAmount: _bidAmount,
            timestamp: block.timestamp,
            rank: _rank
        });

        auctionBids[_auctionId].push(bidId);
        vendorBids[_auctionId][_vendorShareId].push(bidId);
        a.bidCount++;

        emit BidRecorded(bidId, _auctionId, _vendorShareId, _bidAmount, _rank, block.timestamp);

        return bidId;
    }

    /**
     * @dev End an auction and record the winner
     * @param _auctionId       The auction
     * @param _winnerShareId   The winning vendor's share ID
     * @param _winningBid      The winning bid amount
     * @param _receiptHash     SHA256 hash of all tx hashes in chronological order
     */
    function endAuction(
        uint256 _auctionId,
        string calldata _winnerShareId,
        uint256 _winningBid,
        bytes32 _receiptHash
    )
        external
        onlyOwner
        auctionExists(_auctionId)
    {
        AuctionRecord storage a = auctions[_auctionId];
        require(a.status == AuctionStatus.RUNNING, "Auction is not running");

        a.status = AuctionStatus.COMPLETED;
        a.winnerShareId = _winnerShareId;
        a.winningBid = _winningBid;
        a.receiptHash = _receiptHash;

        emit AuctionEnded(_auctionId, _winnerShareId, _winningBid, a.bidCount, block.timestamp);
        emit ReceiptGenerated(_auctionId, _receiptHash, block.timestamp);
    }

    /**
     * @dev Cancel an auction (no winner)
     */
    function cancelAuction(uint256 _auctionId)
        external
        onlyOwner
        auctionExists(_auctionId)
    {
        AuctionRecord storage a = auctions[_auctionId];
        require(
            a.status == AuctionStatus.CREATED || a.status == AuctionStatus.RUNNING,
            "Auction cannot be cancelled"
        );

        a.status = AuctionStatus.CANCELLED;

        emit AuctionEnded(_auctionId, "", 0, a.bidCount, block.timestamp);
    }

    // ────────────────────── View Functions ──────────────────────

    /**
     * @dev Get auction details
     */
    function getAuction(uint256 _auctionId)
        external
        view
        auctionExists(_auctionId)
        returns (
            uint256 id,
            uint256 listingId,
            string memory buyerShareId,
            uint256 startTime,
            uint256 endTime,
            AuctionStatus status,
            uint256 participantCount,
            uint256 bidCount,
            string memory winnerShareId,
            uint256 winningBid,
            bytes32 receiptHash
        )
    {
        AuctionRecord storage a = auctions[_auctionId];
        return (
            a.id, a.listingId, a.buyerShareId,
            a.startTime, a.endTime, a.status,
            a.participantCount, a.bidCount,
            a.winnerShareId, a.winningBid, a.receiptHash
        );
    }

    /**
     * @dev Get a specific bid
     */
    function getBid(uint256 _bidId)
        external
        view
        returns (
            uint256 id,
            uint256 auctionId,
            string memory vendorShareId,
            uint256 bidAmount,
            uint256 timestamp,
            uint256 rank
        )
    {
        require(bids[_bidId].id > 0, "Bid does not exist");
        BidRecord storage b = bids[_bidId];
        return (b.id, b.auctionId, b.vendorShareId, b.bidAmount, b.timestamp, b.rank);
    }

    /**
     * @dev Get all bid IDs for an auction (chronological order)
     */
    function getAuctionBids(uint256 _auctionId)
        external
        view
        returns (uint256[] memory)
    {
        return auctionBids[_auctionId];
    }

    /**
     * @dev Get bid IDs for a specific vendor in an auction
     */
    function getVendorBids(uint256 _auctionId, string calldata _vendorShareId)
        external
        view
        returns (uint256[] memory)
    {
        return vendorBids[_auctionId][_vendorShareId];
    }

    /**
     * @dev Get the latest auction for a listing (0 if none)
     */
    function getListingAuction(uint256 _listingId)
        external
        view
        returns (uint256)
    {
        return listingAuction[_listingId];
    }

    /**
     * @dev Get the receipt hash for an auction
     */
    function getReceiptHash(uint256 _auctionId)
        external
        view
        auctionExists(_auctionId)
        returns (bytes32)
    {
        return auctions[_auctionId].receiptHash;
    }
}
