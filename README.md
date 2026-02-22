# RAPP: Reverse Auction Procurement Platform (Frontend)

> **A comprehensive Web3-enabled platform connecting enterprise companies and specialized vendors through transparent, blockchain-verified interactions and reverse auction mechanisms.**

---

## 🌟 Overview

**RAPP** is a modern, full-stack B2B Web3 application that revolutionizes how companies and vendors connect, negotiate, and transact. This repository contains the **Frontend** of the application, built with React and TypeScript.

While the backend (Laravel) and blockchain smart contracts (Solidity) are kept in a separate private repository for security and proprietary reasons, this frontend repository showcases the complete user interface, Web3 integration logic, and state management of the platform.

### What Makes RAPP Special?

- **Dual-Profile Architecture**: Users can seamlessly operate as both Companies (buyers) and Vendors (sellers) from a single unified account.
- **Gasless Web3 Experience**: Integrated with **Biconomy Smart Accounts and Paymasters**, enabling vendors and companies to interact with the blockchain without needing to hold or manage native gas tokens (ETH).
- **Reverse Procurement Auctions**: Companies post requirements; vendors compete in real-time reverse auctions to offer the best terms.
- **Immutable Audit Trails**: Every major action (Listing Creation, Quote Submission, Auction Bidding) is permanently recorded on the Sepolia Testnet, generating verifiable transaction hashes and receipts.
- **Smart Connections**: A LinkedIn-style `Share ID` system for private vendor-company connections and invitation-only bidding.

---

## 🏗️ Technical Stack (Frontend)

- **Framework**: React 18 with Vite
- **Language**: TypeScript (Strict typing for all API DTOs and Web3 interactions)
- **Styling**: Tailwind CSS (Premium glassmorphism UI, custom gradients, dynamic animations)
- **Routing**: React Router v6
- **State Management**: React Context API (Auth, Profiles)
- **HTTP Client**: Axios (with automated interceptors for access/refresh token management)
- **Web3 Integration**: Biconomy SDK, Ethers.js / Viem

---

## ✨ Key Features Showcased in this Repository

### 1. Advanced Authentication & Profile Management
- Custom Google OAuth integration flow.
- Dynamic profile switching between "Company Mode" and "Vendor Mode" without page reloads.
- Protected, role-based routing (`/dashboard/company/*` vs `/dashboard/vendor/*`).

### 2. Reverse Auction Engine UI
- **Live Bidding Dashboards**: Real-time interfaces for vendors to submit decreasing bids.
- **Company Monitoring**: Real-time evaluation of incoming bids with visual ranking.
- **Auction Lifecycle**: Automated state transitions for Upcoming, Live, and Completed auctions.
- **Cryptographic Receipts**: Downloadable, blockchain-verified receipts generated at the conclusion of every auction.

### 3. Blockchain Integration (Biconomy Gasless TXs)
This frontend integrates heavily with **Biconomy Account Abstraction (ERC-4337)**:
- **Smart Wallets**: Automatic creation of deterministic Smart Wallets for users upon signup.
- **Paymasters**: Transactions are routed through a Paymaster, meaning users interact with smart contracts (registering, bidding, quoting) with zero gas fees.
- **TxHash Badges**: Custom UI components that display truncated blockchain transaction hashes, linking directly to the Sepolia block explorer.

### 4. Enterprise Connection Network
- Companies can restrict visibility of High-Value Listings exclusively to "Approved Vendors".
- Connection request workflows (Send, Pending, Approve, Reject, Revoke).

---

## 🚀 Running the Frontend Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/RAPP-Frontend.git
   cd RAPP-Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   
   # Biconomy Configuration
   VITE_BICONOMY_PAYMASTER_URL=your_paymaster_url
   VITE_BICONOMY_BUNDLER_URL=your_bundler_url
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 📁 Repository Structure

```text
src/
├── assets/         # Static global assets
├── components/     # Reusable UI architecture
│   ├── auth/       # OAuth handlers and token refresh mechanisms
│   ├── common/     # TxHash badges, Premium Buttons, Loading states
│   ├── layout/     # Dashboard shells and responsive navbars
│   └── profile/    # Onboarding wizards
├── config/         # System configurations and rigid route definitions
├── context/        # React Context (AuthContext)
├── hooks/          # Custom hooks (e.g., useBiconomy, useAuction)
├── pages/          
│   ├── company/    # Company views (Create Listing, Award Bid, Manage Auctions)
│   └── vendor/     # Vendor views (Submit Quote, Live Bidding Workspace)
├── services/       # API abstraction layer (Axios singletons, Web3 services)
├── types/          # Global TypeScript interfaces
└── utils/          # Helper formatting and logic functions
```

---

## 🔒 Note on Backend & Smart Contracts
This repository represents the **Frontend client only**. The entire platform is powered by a proprietary Laravel backend and custom Solidity smart contracts deployed on Sepolia. 

For more information regarding the full architecture and the private backend repository, please see [`PRIVATE_REPO_INFO.md`](./PRIVATE_REPO_INFO.md).

---
*Built with React & TypeScript for the Future of Decentralized Procurement.*
