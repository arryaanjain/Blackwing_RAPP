// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RAPPRegistry.sol";

/**
 * @title ConnectionManager
 * @dev Manages vendor-company connection requests and active connections.
 *      Maps to VendorCompanyConnectionController in the Laravel backend.
 *
 *      Flow: Vendor sends request → Company approves/denies → Connection created
 *      Either party (company) can revoke an active connection.
 */
contract ConnectionManager is Ownable {
    // ────────────────────── Enums ──────────────────────

    enum RequestStatus {
        PENDING,
        APPROVED,
        DENIED,
        CANCELLED
    }

    // ────────────────────── Structs ──────────────────────

    struct ConnectionRequest {
        uint256 id;
        string vendorShareId;
        string companyShareId;
        RequestStatus status;
        string messageHash;      // keccak256 of the request message
        uint256 createdAt;
        uint256 resolvedAt;
        address resolvedBy;
        string reviewNotesHash;  // keccak256 of review notes
    }

    struct Connection {
        uint256 id;
        string vendorShareId;
        string companyShareId;
        uint256 connectedAt;
        bool isActive;
        uint256 revokedAt;
        string revokeReasonHash;
        address revokedBy;
        uint256 requestId;       // source request ID
    }

    // ────────────────────── State ──────────────────────

    RAPPRegistry public registry;

    mapping(uint256 => ConnectionRequest) private requests;
    mapping(uint256 => Connection) private connections;

    uint256 public requestCounter;
    uint256 public connectionCounter;

    /// vendorShareId => companyShareId => requestId (latest)
    mapping(string => mapping(string => uint256)) private latestRequestId;

    /// vendorShareId => companyShareId => connectionId
    mapping(string => mapping(string => uint256)) private connectionLookup;

    // ────────────────────── Events ──────────────────────

    event ConnectionRequested(
        uint256 indexed requestId,
        string vendorShareId,
        string companyShareId,
        uint256 timestamp
    );

    event ConnectionApproved(
        uint256 indexed requestId,
        uint256 indexed connectionId,
        uint256 timestamp
    );

    event ConnectionDenied(
        uint256 indexed requestId,
        uint256 timestamp
    );

    event ConnectionRequestCancelled(
        uint256 indexed requestId,
        uint256 timestamp
    );

    event ConnectionRevoked(
        uint256 indexed connectionId,
        uint256 timestamp
    );

    // ────────────────────── Constructor ──────────────────────

    constructor(address _registryAddress) Ownable(msg.sender) {
        registry = RAPPRegistry(_registryAddress);
    }

    // ────────────────────── Write Functions ──────────────────────

    /**
     * @dev Vendor sends a connection request to a company
     * @param _vendorShareId  The vendor's share ID
     * @param _companyShareId The target company's share ID
     * @param _messageHash    keccak256 of the request message
     */
    function sendConnectionRequest(
        string calldata _vendorShareId,
        string calldata _companyShareId,
        string calldata _messageHash
    ) external returns (uint256) {
        require(registry.isRegistered(_vendorShareId), "Vendor not registered");
        require(registry.isRegistered(_companyShareId), "Company not registered");
        require(
            keccak256(bytes(_vendorShareId)) != keccak256(bytes(_companyShareId)),
            "Cannot connect to self"
        );

        // Check no pending request already exists
        uint256 existingReqId = latestRequestId[_vendorShareId][_companyShareId];
        if (existingReqId > 0) {
            require(
                requests[existingReqId].status != RequestStatus.PENDING,
                "Pending request already exists"
            );
        }

        // Check not already connected
        uint256 existingConnId = connectionLookup[_vendorShareId][_companyShareId];
        if (existingConnId > 0) {
            require(!connections[existingConnId].isActive, "Already connected");
        }

        requestCounter++;
        uint256 reqId = requestCounter;

        requests[reqId] = ConnectionRequest({
            id: reqId,
            vendorShareId: _vendorShareId,
            companyShareId: _companyShareId,
            status: RequestStatus.PENDING,
            messageHash: _messageHash,
            createdAt: block.timestamp,
            resolvedAt: 0,
            resolvedBy: address(0),
            reviewNotesHash: ""
        });

        latestRequestId[_vendorShareId][_companyShareId] = reqId;

        emit ConnectionRequested(reqId, _vendorShareId, _companyShareId, block.timestamp);
        return reqId;
    }

    /**
     * @dev Company approves a pending connection request
     */
    function approveRequest(uint256 _requestId, string calldata _reviewNotesHash) external {
        ConnectionRequest storage req = requests[_requestId];
        require(req.id > 0, "Request does not exist");
        require(req.status == RequestStatus.PENDING, "Request is not pending");

        req.status = RequestStatus.APPROVED;
        req.resolvedAt = block.timestamp;
        req.resolvedBy = msg.sender;
        req.reviewNotesHash = _reviewNotesHash;

        // Create the connection
        connectionCounter++;
        uint256 connId = connectionCounter;

        connections[connId] = Connection({
            id: connId,
            vendorShareId: req.vendorShareId,
            companyShareId: req.companyShareId,
            connectedAt: block.timestamp,
            isActive: true,
            revokedAt: 0,
            revokeReasonHash: "",
            revokedBy: address(0),
            requestId: _requestId
        });

        connectionLookup[req.vendorShareId][req.companyShareId] = connId;

        emit ConnectionApproved(_requestId, connId, block.timestamp);
    }

    /**
     * @dev Company denies a pending connection request
     */
    function denyRequest(uint256 _requestId, string calldata _reviewNotesHash) external {
        ConnectionRequest storage req = requests[_requestId];
        require(req.id > 0, "Request does not exist");
        require(req.status == RequestStatus.PENDING, "Request is not pending");

        req.status = RequestStatus.DENIED;
        req.resolvedAt = block.timestamp;
        req.resolvedBy = msg.sender;
        req.reviewNotesHash = _reviewNotesHash;

        emit ConnectionDenied(_requestId, block.timestamp);
    }

    /**
     * @dev Vendor cancels their own pending request
     */
    function cancelRequest(uint256 _requestId) external {
        ConnectionRequest storage req = requests[_requestId];
        require(req.id > 0, "Request does not exist");
        require(req.status == RequestStatus.PENDING, "Request is not pending");

        req.status = RequestStatus.CANCELLED;
        req.resolvedAt = block.timestamp;
        req.resolvedBy = msg.sender;

        emit ConnectionRequestCancelled(_requestId, block.timestamp);
    }

    /**
     * @dev Revoke an active connection
     */
    function revokeConnection(uint256 _connectionId, string calldata _reasonHash) external {
        Connection storage conn = connections[_connectionId];
        require(conn.id > 0, "Connection does not exist");
        require(conn.isActive, "Connection already inactive");

        conn.isActive = false;
        conn.revokedAt = block.timestamp;
        conn.revokeReasonHash = _reasonHash;
        conn.revokedBy = msg.sender;

        emit ConnectionRevoked(_connectionId, block.timestamp);
    }

    // ────────────────────── View Functions ──────────────────────

    /**
     * @dev Get a connection request by ID
     */
    function getRequest(uint256 _requestId)
        external
        view
        returns (
            uint256 id,
            string memory vendorShareId,
            string memory companyShareId,
            RequestStatus status,
            string memory messageHash,
            uint256 createdAt,
            uint256 resolvedAt,
            address resolvedBy,
            string memory reviewNotesHash
        )
    {
        ConnectionRequest storage req = requests[_requestId];
        require(req.id > 0, "Request does not exist");
        return (
            req.id, req.vendorShareId, req.companyShareId,
            req.status, req.messageHash, req.createdAt,
            req.resolvedAt, req.resolvedBy, req.reviewNotesHash
        );
    }

    /**
     * @dev Get a connection by ID
     */
    function getConnection(uint256 _connectionId)
        external
        view
        returns (
            uint256 id,
            string memory vendorShareId,
            string memory companyShareId,
            uint256 connectedAt,
            bool isActive,
            uint256 revokedAt,
            string memory revokeReasonHash,
            address revokedBy,
            uint256 requestId
        )
    {
        Connection storage conn = connections[_connectionId];
        require(conn.id > 0, "Connection does not exist");
        return (
            conn.id, conn.vendorShareId, conn.companyShareId,
            conn.connectedAt, conn.isActive, conn.revokedAt,
            conn.revokeReasonHash, conn.revokedBy, conn.requestId
        );
    }

    /**
     * @dev Check if two entities are currently connected
     */
    function isConnected(string calldata _vendorShareId, string calldata _companyShareId)
        external
        view
        returns (bool)
    {
        uint256 connId = connectionLookup[_vendorShareId][_companyShareId];
        if (connId == 0) return false;
        return connections[connId].isActive;
    }

    /**
     * @dev Get the connection ID between two entities (0 if none)
     */
    function getConnectionId(string calldata _vendorShareId, string calldata _companyShareId)
        external
        view
        returns (uint256)
    {
        return connectionLookup[_vendorShareId][_companyShareId];
    }

    /**
     * @dev Get the latest request ID between two entities (0 if none)
     */
    function getLatestRequestId(string calldata _vendorShareId, string calldata _companyShareId)
        external
        view
        returns (uint256)
    {
        return latestRequestId[_vendorShareId][_companyShareId];
    }
}
