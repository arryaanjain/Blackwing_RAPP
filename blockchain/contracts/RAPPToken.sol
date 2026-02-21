// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RAPPToken
 * @dev ERC-20 token representing RAPP platform points / credits.
 *      Maps to WalletController in the Laravel backend.
 *
 *      - Owner mints tokens after Razorpay payment verification
 *      - Authorized contracts (ListingManager, QuoteManager) can deduct tokens
 *      - Users can transfer or burn their tokens
 *
 *      1 RAPP token = 1 platform point (no decimals for simplicity)
 */
contract RAPPToken is ERC20, ERC20Burnable, Ownable {
    // ────────────────────── State ──────────────────────

    /// Cost in tokens to perform certain actions
    uint256 public costListing;
    uint256 public costQuote;

    /// Addresses authorized to deduct tokens on behalf of users
    mapping(address => bool) public authorizedDeductors;

    // ────────────────────── Events ──────────────────────

    event PointsMinted(address indexed to, uint256 amount, string reason);
    event PointsDeducted(address indexed from, uint256 amount, string reason);
    event CostsUpdated(uint256 costListing, uint256 costQuote);
    event DeductorAuthorized(address indexed deductor);
    event DeductorRevoked(address indexed deductor);

    // ────────────────────── Constructor ──────────────────────

    /**
     * @param _costListing  Initial cost (in tokens) to create a listing
     * @param _costQuote    Initial cost (in tokens) to submit a quote
     */
    constructor(
        uint256 _costListing,
        uint256 _costQuote
    ) ERC20("RAPP Token", "RAPP") Ownable(msg.sender) {
        costListing = _costListing;
        costQuote = _costQuote;
    }

    /**
     * @dev Override decimals to 0 since 1 token = 1 point
     */
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    // ────────────────────── Owner Functions ──────────────────────

    /**
     * @dev Mint new tokens (called after Razorpay payment verification)
     * @param _to     Address to mint tokens to
     * @param _amount Number of tokens to mint
     * @param _reason Description (e.g. "Purchased 10 points via Razorpay")
     */
    function mint(address _to, uint256 _amount, string calldata _reason)
        external
        onlyOwner
    {
        require(_to != address(0), "Cannot mint to zero address");
        require(_amount > 0, "Amount must be greater than 0");

        _mint(_to, _amount);

        emit PointsMinted(_to, _amount, _reason);
    }

    /**
     * @dev Update the cost structure
     */
    function setCosts(uint256 _costListing, uint256 _costQuote)
        external
        onlyOwner
    {
        costListing = _costListing;
        costQuote = _costQuote;

        emit CostsUpdated(_costListing, _costQuote);
    }

    /**
     * @dev Authorize a contract/address to deduct tokens
     */
    function authorizeDeductor(address _deductor) external onlyOwner {
        require(_deductor != address(0), "Cannot authorize zero address");
        authorizedDeductors[_deductor] = true;

        emit DeductorAuthorized(_deductor);
    }

    /**
     * @dev Revoke deduction authorization
     */
    function revokeDeductor(address _deductor) external onlyOwner {
        authorizedDeductors[_deductor] = false;

        emit DeductorRevoked(_deductor);
    }

    // ────────────────────── Deduction Functions ──────────────────────

    /**
     * @dev Deduct tokens for creating a listing
     *      Called by ListingManager or backend via owner
     */
    function deductForListing(address _user, string calldata _reason) external {
        require(
            authorizedDeductors[msg.sender] || msg.sender == owner(),
            "Not authorized to deduct"
        );
        require(balanceOf(_user) >= costListing, "Insufficient RAPP tokens for listing");

        _burn(_user, costListing);

        emit PointsDeducted(_user, costListing, _reason);
    }

    /**
     * @dev Deduct tokens for submitting a quote
     *      Called by QuoteManager or backend via owner
     */
    function deductForQuote(address _user, string calldata _reason) external {
        require(
            authorizedDeductors[msg.sender] || msg.sender == owner(),
            "Not authorized to deduct"
        );
        require(balanceOf(_user) >= costQuote, "Insufficient RAPP tokens for quote");

        _burn(_user, costQuote);

        emit PointsDeducted(_user, costQuote, _reason);
    }

    /**
     * @dev Generic deduction for custom amounts
     */
    function deduct(address _user, uint256 _amount, string calldata _reason) external {
        require(
            authorizedDeductors[msg.sender] || msg.sender == owner(),
            "Not authorized to deduct"
        );
        require(balanceOf(_user) >= _amount, "Insufficient RAPP tokens");

        _burn(_user, _amount);

        emit PointsDeducted(_user, _amount, _reason);
    }

    // ────────────────────── View Functions ──────────────────────

    /**
     * @dev Get the point costs structure
     */
    function getPointCosts()
        external
        view
        returns (uint256 listing, uint256 quote)
    {
        return (costListing, costQuote);
    }

    /**
     * @dev Check if an address is an authorized deductor
     */
    function isAuthorizedDeductor(address _deductor) external view returns (bool) {
        return authorizedDeductors[_deductor];
    }
}
