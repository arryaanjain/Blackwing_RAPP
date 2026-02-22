# About the RAPP Backend & Blockchain Infrastructure

RAPP (Reverse Auction Procurement Platform) is a comprehensive B2B enterprise platform that heavily relies on secure backend interactions and verified blockchain smart contracts.

Currently, this public repository **only contains the Frontend (React + TypeScript) codebase**.

## 🔒 Why is the Backend Private?

Due to the nature of enterprise procurement data, cryptographic signing procedures, and proprietary reverse-auction algorithms, the **Backend (Laravel) and Blockchain (Solidity smart contracts)** reside in a separate, completely private repository. 

Sharing the direct commit history of those components would expose:
1. **API Keys & Paymaster Endpoints**: Critical for Biconomy gasless transactions.
2. **Database Schemas & Migrations**: Proprietary structuring of enterprise data.
3. **Admin Private Keys**: Used for server-side smart contract interactions and signature verifications.

## 🏗️ Architectural Snapshot (How it Works)

Even without access to the code, here is an architectural snapshot of how the backend powers the frontend you see in this repository:

### 1. The Laravel RESTful API
- **Language**: PHP 8.x + Laravel 12.x
- **Responsibilities**:
  - Handles **OAuth flow** with Google and mints secure JWT tokens via Laravel Sanctum.
  - Generates deterministic **Share IDs** (e.g., `SH-ABCDEF123456`) so companies can securely share their profiles without exposing core database IDs.
  - Implements complex queuing systems to automatically compute auction rankings as reverse bids come in.
  - Acts as an **Oracle** taking off-chain data (quotes, listing parameters) and triggering safe on-chain registrations.

### 2. The Smart Contracts (Solidity + Sepolia Testnet)
- **Framework**: Hardhat + Ethers.js
- **Network**: Deployed to the Ethereum Sepolia Testnet.
- **Gasless Infrastructure**: Leverages **Biconomy Smart Accounts (ERC-4337)** to abstract away gas fees. The backend acts as the Paymaster sponsor.
- **Core Contracts**:
  - `RAPPRegistry.sol`: Registers Companies and Vendors on the blockchain with immutable verification.
  - `RAPPAuction.sol`: Handles the live bidding mechanics, storing truncated records of bids, and emitting events upon auction completion to generate verifiable cryptographic receipts.
  - `ListingManager.sol`: Controls the connections and interactions specifically bound to 'Private Listings'.

### 3. Connection & Verification Flow
When a vendor wants to apply for a private listing, the flow operates across all three systems:
1. **Frontend**: The Vendor inputs the Company's `Share ID` and hits "Request Connection".
2. **Backend**: Laravel verifies the validity of the `Share ID`, checks internal validation (GST verification endpoints), and creates a pending connection constraint.
3. **Smart Contract**: Once the Company approves the request in the Frontend UI, the Backend calls `ListingManager.sol` to record this handshake immutably. The transaction hash is returned to the Frontend and displayed as a `TxHashBadge`.

---

*If you are an auditor, partner, or potential employer needing access to the private repository and commit history for verification purposes, please contact the repository owner directly.*
