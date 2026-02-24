# RAPP - Reverse Auction Platform with Blockchain Integration

> **A comprehensive Web3-enabled platform connecting companies and vendors through transparent, blockchain-verified interactions and reverse auction mechanisms.**

---

## 🌐 Live Application

**Working Link:** [https://rapp.blackwing.tech](https://rapp.blackwing.tech)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#️-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#️-technology-stack)
- [Getting Started](#-getting-started)
- [System Components](#-system-components)
- [Blockchain Integration](#-blockchain-integration)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [Frontend Features](#-frontend-features)
- [Security & Authentication](#-security--authentication)
- [Troubleshooting](#-troubleshooting)
- [Development Workflow](#-development-workflow)

---

## 🌟 Overview

**RAPP (Reverse Auction Platform Platform)** is a modern, full-stack Web3 application that revolutionizes how companies and vendors connect and transact. The platform combines traditional web technologies with blockchain integration to provide transparent, verifiable, and secure business relationships.

### 📸 Private Backend & Blockchain Repository
Due to the proprietary nature of our core auction algorithms and admin wallet integrations, the Laravel backend and Solidity smart contracts are maintained in a separate private repository. Below is a snapshot of our 96 commits starting from February 21, 2026.

![Private Repository Snapshot](./frontend/public/private-repo-snapshot.png)


### What Makes RAPP Special?

- **Dual-Profile System**: Users can operate as both companies AND vendors
- **Reverse Auction Engine**: Real-time live bidding dashboards where vendors place descending bids
- **Custom Gasless Architecture**: We sponsor gas using our private backend admin MetaMask, so users never need to pay native Ethereum gas fees
- **In-App Token Economy**: Users recharge their internal wallets using fiat via our **Razorpay** integration
- **Smart Connections**: Vendor-company relationship management with share ID system
- **OAuth Integration**: Seamless Google authentication

---

## 🏗️ Architecture

```
RAPP/
├── backend/              # Laravel 12 API Backend
│   ├── app/
│   │   ├── Http/Controllers/     # API endpoints
│   │   ├── Models/               # Eloquent ORM models
│   │   ├── Services/             # Business logic
│   │   │   └── BlockchainService.php  # Ethereum integration
│   │   └── Middleware/           # Auth & CORS
│   ├── database/
│   │   ├── migrations/           # Database schema
│   │   └── seeders/              # Test data
│   ├── routes/
│   │   ├── api.php               # API routes
│   │   └── web.php               # OAuth routes
│   └── storage/
│       └── blockchain/artifacts/ # Compiled Solidity ABIs
│
├── frontend/             # React + TypeScript SPA
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   └── layout/DashboardLayout.tsx
│   │   ├── pages/                # Route pages
│   │   │   ├── company/          # Company-specific pages
│   │   │   └── vendor/           # Vendor-specific pages
│   │   ├── context/              # React Context (Auth)
│   │   ├── services/             # API clients
│   │   ├── hooks/                # Custom React hooks
│   │   └── config/               # Routes & API config
│   └── public/
│
├── blockchain/           # Ethereum Smart Contracts
│   ├── contracts/
│   │   ├── RegistrationContract.sol    # DEPLOYED on Sepolia
│   │   ├── ReverseAuctionPlatform.sol
│   │   └── RAPPRegistration.sol
│   ├── scripts/                  # Deployment scripts
│   ├── test/                     # Contract tests
│   └── hardhat.config.js         # Network configurations
│
├── fastapi/              # Python Microservice (Future)
└── tests/                # End-to-end Testing Suite
```

### Technology Flow

```
User Browser
    ↓
React Frontend (Port 5173 JSX/TSX)
    ↓ HTTP/REST (Axios)
Laravel Backend (Port 8000 Omni-Relayer & Paymaster)
    ↓ RPC (eth_sendRawTransaction with Admin MetaMask Signature)
Ethereum Node (Alchemy/Infura)
    ↓
Sepolia Testnet
    ↓
RegistrationContract @ 0x541E197ad31ba3Db637273f5433F2f4C2b872B1e
```

---

## ✨ Key Features

### 🔐 Authentication & Authorization

#### Google OAuth Integration
- **Provider**: Laravel Socialite with Google OAuth 2.0
- **Flow**: OAuth callback → JWT token generation → Sanctum session
- **Token Management**: Access tokens + refresh tokens for session persistence
- **Security**: CSRF protection, SameSite cookies, CORS headers

#### Dual Profile System
Users can create and manage **both** profile types simultaneously:

| Profile Type | Capabilities |
|--------------|--------------|
| **Company** | Post listings, receive quotes, approve vendors, blockchain registration |
| **Vendor** | Browse listings, submit quotes, connect with companies, blockchain registration |

**Profile Switching**: Dynamic switching between company/vendor roles without re-authentication
- Frontend detects `currentProfile.type`
- Backend validates `current_profile_type` in database
- Routes automatically redirect based on active profile

#### Laravel Sanctum
- API token authentication
- SPA authentication with cookies
- Token abilities for granular permissions
- Automatic token expiration

---

### 🤝 Connection Management System

#### Share ID System
Every company gets a unique **Share ID** (format: `SH-XXXXXXXXXXXX`):
```php
// Generated in CompanyProfileController
$shareId = 'SH-' . strtoupper(Str::random(12));
```

**Why Share IDs?**
- Public-facing identifier (safe to share)
- No exposure of internal database IDs
- Used for vendor connection requests
- Blockchain registration key

#### Connection Workflow

```
1. Vendor finds company (via share_id)
   ↓
2. Vendor sends connection request
   POST /api/connections/request { share_id, message }
   ↓
3. Company receives request notification
   GET /api/connections/requests/received
   ↓
4. Company approves/denies
   POST /api/connections/requests/{id}/approve
   ↓
5. Active connection created
   vendor_company_connections table
   ↓
6. Both parties can revoke anytime
   POST /api/connections/{id}/revoke
```

#### Connection States
- **Pending**: Request sent, awaiting company approval
- **Approved**: Active connection established
- **Denied**: Company rejected the request
- **Revoked**: Either party terminated the connection

---

### ⛓️ Blockchain Integration

#### Custom Gasless Accounts & Razorpay Integration
Unlike traditional dApps, users don't need MetaMask or ETH.
1. **Fiat Onramp**: Users top up their "In-App Wallet" balance in fiat currency through our **Razorpay gateway** integration.
2. **Admin-Sponsored Gas**: When a user performs an on-chain action (like placing a bid), the Laravel backend constructs the transaction, signs it using securely stored admin private keys, and sponsors the Ethereum Sepolia gas fee entirely.
3. **Internal Deduction**: The equivalent transaction fee is then deducted from their internal token wallet balance.

#### Smart Contract: RegistrationContract.sol

**Deployed Address**: `0x541E197ad31ba3Db637273f5433F2f4C2b872B1e`  
**Network**: Sepolia Testnet (Chain ID: 11155111)  
**Compiler**: Solidity ^0.8.19 with optimizer enabled

#### Key Functions

```solidity
// Register company or vendor on blockchain
function registerEntity(
    string memory shareId,      // Database share_id (SH-XXXXXXXXXXXX)
    string memory entityId,     // company_id or vendor_id
    string memory name,         // Company/vendor name
    EntityType entityType,      // 0 = COMPANY, 1 = VENDOR
    string memory ipfsHash      // IPFS hash (optional)
) external

// Verify if entity is registered and verified
function isEntityVerified(string memory shareId)
    external view
    returns (bool isRegistered, bool isVerified)

// Get full registration details
function getRegistration(string memory shareId)
    external view
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
```

#### Registration Process

When a company/vendor profile is created:

1. **Database Record Created** (Laravel)
   ```php
   $company = Company::create([
       'share_id' => $shareId,
       'company_id' => $companyId,
       'company_name' => $name,
       // ... other fields
   ]);
   ```

2. **Blockchain Registration** (BlockchainService.php)
   ```php
   public function registerCompany(Company $company) {
       $txHash = $this->sendTransaction(
           $this->encodeRegisterEntityParameters(
               $company->share_id,
               $company->company_id,
               $company->company_name,
               0,  // EntityType.COMPANY
               ''  // IPFS hash (optional)
           )
       );
       return $txHash;  // Stored in blockchain_tx_hash column
   }
   ```

3. **Transaction Signing** (web3p/ethereum-tx)
   ```php
   // Local signing with private key (NEVER sent to RPC!)
   $tx = new Transaction($txParams);
   $signedTx = '0x' . $tx->sign($privateKey);
   
   // Broadcast to network
   $response = Http::post($nodeUrl, [
       'method' => 'eth_sendRawTransaction',
       'params' => [$signedTx]
   ]);
   ```

4. **Database Update**
   ```php
   $company->blockchain_tx_hash = $txHash;
   $company->save();
   ```

#### Why Blockchain?

✅ **Immutable Record**: Registration data can't be altered  
✅ **Transparent Verification**: Anyone can verify company/vendor authenticity  
✅ **Decentralized Trust**: No single point of failure  
✅ **Audit Trail**: Complete history of all registrations  
✅ **Future-Proof**: Ready for Web3 integrations (NFTs, DAOs, etc.)

#### Network Support

Configured for multiple EVM-compatible chains:

| Network | Chain ID | Status | RPC Provider |
|---------|----------|--------|--------------|
| **Sepolia** | 11155111 | ✅ **DEPLOYED** | Alchemy |
| Linea Sepolia | 59141 | 🟡 Configured | Alchemy |
| Ethereum Mainnet | 1 | 🟡 Configured | Infura |
| Polygon | 137 | 🟡 Configured | Alchemy |
| Arbitrum | 42161 | 🟡 Configured | Arbitrum RPC |

---

### 📝 Listings & Reverse Auction

#### Company Workflow

1. **Create Listing**
   - POST `/api/company/listings`
   - Define requirements, budget, deadline
   - Listing broadcast to all vendors

2. **Receive Quotes**
   - Vendors submit competitive quotes
   - GET `/api/company/listings/{id}/quotes`
   - Compare vendor proposals

3. **Award Contract**
   - Select winning vendor
   - POST `/api/company/listings/{id}/award`
   - Automatic connection creation

#### Vendor Workflow

1. **Browse Listings**
   - GET `/api/vendor/listings`
   - Filter by category, budget, location
   - View company details (if connected)

2. **Submit Quote**
   - POST `/api/vendor/listings/{id}/quote`
   - Competitive pricing
   - Proposal details & timeline

3. **Manage Quotes**
   - GET `/api/vendor/quotes`
   - Edit before deadline
   - Track quote status

---

## 🛠️ Technology Stack

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **PHP** | 8.3.20 | Runtime |
| **Laravel** | 12.x | Web framework |
| **MySQL** | 8.0+ | Primary database |
| **Laravel Sanctum** | 4.2 | API authentication |
| **Laravel Socialite** | 5.23 | OAuth (Google) |
| **kornrunner/keccak** | 1.1 | Ethereum Keccak-256 hashing |
| **web3p/ethereum-tx** | 0.4.3 | Transaction signing |
| **simplito/elliptic-php** | 1.0 | Elliptic curve cryptography |
| **Composer** | 2.x | Dependency management |

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 7.1.2 | Build tool & dev server |
| **React Router** | 7.8.2 | Client-side routing |
| **Axios** | 1.12.2 | HTTP client |
| **Tailwind CSS** | 4.1.13 | Styling framework |
| **React Hook Form** | 7.62.0 | Form management |
| **Ethers.js** | 6.15.0 | Ethereum library (future use) |
| **Viem** | 2.37.5 | Lightweight Web3 library |

### Blockchain Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.19 | Smart contract language |
| **Hardhat** | 2.26.3 | Development environment |
| **Ethers.js** | 6.x | Contract interaction |
| **Alchemy** | - | RPC provider (Sepolia) |
| **Sepolia Testnet** | - | Deployment network |

---

## 🚀 Getting Started

### Prerequisites

```bash
# System Requirements
- PHP >= 8.2
- Composer >= 2.0
- Node.js >= 18.0
- MySQL >= 8.0
- Git

# Optional
- Redis (for caching)
- Docker (for containerization)
```

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/arryaanjain/RAPP.git
cd RAPP
```

#### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure .env file
# Update these variables:
DB_DATABASE=rapp
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Blockchain (Sepolia)
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_CONTRACT_ADDRESS=0x541E197ad31ba3Db637273f5433F2f4C2b872B1e
BLOCKCHAIN_NODE_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_private_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Create database
mysql -u root -p
CREATE DATABASE rapp;
EXIT;

# Run migrations with seeders
php artisan migrate:fresh --seed

# Start development server
php artisan serve
# Backend runs on http://localhost:8000
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install Node dependencies
npm install

# Configure environment
cp .env.example .env

# Update VITE_API_BASE_URL if needed
VITE_API_BASE_URL=http://localhost:8000

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

#### 4. Blockchain Setup (Optional - for redeployment)

```bash
cd ../blockchain

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
# Artifacts automatically copied to backend/storage/blockchain/artifacts

# Deploy to Sepolia (if needed)
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia 0x541E197ad31ba3Db637273f5433F2f4C2b872B1e
```

### First Run

1. **Visit Frontend**: http://localhost:5173
2. **Click "Sign in with Google"**
3. **Choose Profile Type**: Company or Vendor
4. **Complete Profile Setup**
5. **Blockchain Registration**: Automatic on profile creation
6. **View Transaction**: Check your `blockchain_tx_hash` in profile

---

## 📦 System Components

### Backend Services

#### BlockchainService.php

**Location**: `backend/app/Services/BlockchainService.php`

**Purpose**: Handle all Ethereum blockchain interactions

**Key Methods**:

```php
// Register company on blockchain
public function registerCompany(Company $company): string

// Register vendor on blockchain
public function registerVendor(Vendor $vendor): string

// Verify registration on-chain
public function verifyRegistration(string $shareId): array

// Get registration details from blockchain
public function getRegistrationDetails(string $shareId): array

// Private: Send signed transaction
private function sendTransaction(string $data, int $gasLimit = 500000): string

// Private: Encode function parameters (ABI encoding)
private function encodeRegisterEntityParameters(...): string

// Private: Calculate function signature (Keccak-256)
private function getFunctionSignature(string $functionName, array $paramTypes): string
```

**How It Works**:

1. **Function Signature Calculation**
   ```php
   // registerEntity(string,string,string,uint8,string)
   $signature = substr(Keccak::hash('registerEntity(string,string,string,uint8,string)', 256), 0, 8);
   // Result: 0x4c98527b
   ```

2. **ABI Encoding**
   ```php
   // Encode parameters according to Solidity ABI spec
   // Static types (uint8) encoded inline
   // Dynamic types (string) use offset pointers
   ```

3. **Transaction Signing**
   ```php
   // Use web3p/ethereum-tx library
   $tx = new Transaction([
       'nonce' => $nonce,
       'gasPrice' => $gasPrice,
       'gasLimit' => $gasLimit,
       'to' => $contractAddress,
       'value' => '0x0',
       'data' => $encodedData,
       'chainId' => 11155111  // Sepolia
   ]);
   
   $signedTx = '0x' . $tx->sign($privateKey);
   ```

4. **Broadcasting**
   ```php
   // Send to Alchemy RPC
   $response = Http::post($nodeUrl, [
       'method' => 'eth_sendRawTransaction',
       'params' => [$signedTx]
   ]);
   
   return $response->json()['result'];  // Transaction hash
   ```

#### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Frontend redirects to /auth/google
   ↓
3. Laravel Socialite redirects to Google OAuth
   ↓
4. User authorizes, Google redirects to /auth/google/callback
   ↓
5. Backend:
   - Creates/updates User record
   - Generates Sanctum token
   - Creates refresh token
   ↓
6. Redirect to frontend with token in URL
   ↓
7. Frontend:
   - Extracts token
   - Stores in localStorage
   - Sets axios default header
   - Fetches user data
   ↓
8. User authenticated!
```

### Frontend Architecture

#### Context Providers

**AuthContext.tsx** - Global authentication state

```typescript
interface Profile {
  id: string;
  name: string;
  type: 'company' | 'vendor';
  status: 'active' | 'inactive';
  is_complete: boolean;
  share_id?: string;
  blockchain_tx_hash?: string;
  // ... other fields
}

interface User {
  id: number;
  name: string;
  email: string;
  current_profile?: Profile;
  profiles?: Profile[];
}

const AuthContext = createContext<{
  user: User | null;
  currentProfile: Profile | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}>()
```

#### Route Protection

**ProtectedRoute.tsx**

```typescript
<ProtectedRoute 
  requireAuth={true} 
  requireProfile="company"
  requireCompleteProfile={true}
>
  <CompanyDashboard />
</ProtectedRoute>
```

**Logic**:
1. Check if user authenticated
2. Check if user has required profile type
3. Check if profile is complete
4. Redirect to appropriate page if validation fails

#### Page Components

**Company Pages** (`frontend/src/pages/company/`):
- `CompanyDashboard.tsx` - Overview, stats, recent activity
- `CompanyProfile.tsx` - Edit company information, view blockchain tx
- `CompanyListingsManager.tsx` - Manage all listings
- `CompanyCreateListing.tsx` - Create new listing
- `CompanyListingDetail.tsx` - View listing + quotes
- `ManageVendors.tsx` - View connections, approve requests

**Vendor Pages** (`frontend/src/pages/vendor/`):
- `VendorDashboard.tsx` - Overview, stats, opportunities
- `VendorProfile.tsx` - Edit vendor information, view blockchain tx
- `VendorListingsBrowser.tsx` - Browse available listings
- `VendorListingDetail.tsx` - View listing details, submit quote
- `VendorQuotesManager.tsx` - Manage all quotes
- `VendorCreateQuote.tsx` - Submit quote for listing
- `ManageCompanies.tsx` - View connections, send requests

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST /auth/google
Initiate Google OAuth flow

**Response**: Redirect to Google OAuth consent screen

#### GET /auth/google/callback
Handle OAuth callback from Google

**Response**: Redirect to frontend with token
```
http://localhost:5173/auth/callback?token=eyJ0eXAiOiJKV1QiLCJhbG...
```

#### GET /api/auth/me
Get current authenticated user data

**Headers**:
```
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "current_profile_type": "company",
  "current_profile_id": 1,
  "current_profile": {
    "id": "1",
    "name": "Acme Corp",
    "type": "company",
    "share_id": "SH-ABC123DEF456",
    "blockchain_tx_hash": "0x1234...",
    "is_complete": true
  },
  "available_profiles": [...]
}
```

#### POST /api/auth/logout
Logout current user

**Response**: 204 No Content

---

### Profile Management Endpoints

#### GET /api/profiles/check/company
Check if user has company profile

**Response**:
```json
{
  "exists": true,
  "profile": {
    "id": "1",
    "company_name": "Acme Corp",
    "share_id": "SH-ABC123DEF456",
    "company_id": "COMP-0001"
  }
}
```

#### POST /api/profiles/company
Create company profile (triggers blockchain registration)

**Request**:
```json
{
  "company_name": "Acme Corp",
  "business_type": "Technology",
  "gst_number": "27AAPFU0939F1ZV",
  "location": "Mumbai, India",
  "description": "Leading tech solutions provider",
  "contact_phone": "+91-1234567890",
  "website": "https://acmecorp.com"
}
```

**Response**:
```json
{
  "message": "Company profile created successfully",
  "profile": {
    "id": "1",
    "share_id": "SH-ABC123DEF456",
    "company_id": "COMP-0001",
    "blockchain_tx_hash": "0xabcd1234...",
    "is_complete": true
  }
}
```

#### POST /api/profiles/switch
Switch between company and vendor profiles

**Request**:
```json
{
  "profile_id": "2"
}
```

**Response**:
```json
{
  "message": "Profile switched successfully",
  "current_profile": {
    "id": "2",
    "type": "vendor",
    "name": "John's Services"
  }
}
```

---

### Connection System Endpoints

#### POST /api/connections/request
Send connection request (vendor → company)

**Request**:
```json
{
  "share_id": "SH-ABC123DEF456",
  "message": "I would like to connect with your company"
}
```

**Response**:
```json
{
  "message": "Connection request sent successfully",
  "request": {
    "id": 1,
    "vendor_id": 5,
    "company_id": 3,
    "status": "pending",
    "created_at": "2025-11-03T10:30:00Z"
  }
}
```

#### GET /api/connections/requests/received
Get incoming connection requests (company only)

**Response**:
```json
[
  {
    "id": 1,
    "vendor": {
      "id": 5,
      "vendor_name": "John's Services",
      "specialization": "IT Consulting"
    },
    "message": "I would like to connect",
    "status": "pending",
    "created_at": "2025-11-03T10:30:00Z"
  }
]
```

#### POST /api/connections/requests/{id}/approve
Approve connection request (company only)

**Response**:
```json
{
  "message": "Connection request approved",
  "connection": {
    "id": 10,
    "vendor_id": 5,
    "company_id": 3,
    "connected_at": "2025-11-03T11:00:00Z"
  }
}
```

#### GET /api/connections
Get all active connections

**Response**:
```json
[
  {
    "id": 10,
    "partner": {
      "id": 3,
      "name": "Acme Corp",
      "type": "company",
      "share_id": "SH-ABC123DEF456"
    },
    "connected_at": "2025-11-03T11:00:00Z"
  }
]
```

---

## 🗄️ Database Schema

### Core Tables

#### users
**Purpose**: Store user authentication data

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Email (unique) |
| password | VARCHAR(255) | Nullable (OAuth users) |
| google_id | VARCHAR(255) | Google OAuth ID |
| avatar | VARCHAR(255) | Profile picture URL |
| current_profile_type | ENUM | 'company' or 'vendor' |
| current_profile_id | BIGINT | ID of active profile |
| email_verified_at | TIMESTAMP | Email verification |
| created_at | TIMESTAMP | Registration date |

#### companies
**Purpose**: Store company profile data

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key → users.id |
| company_name | VARCHAR(255) | Company name |
| share_id | VARCHAR(255) | Unique share ID (SH-XXX) |
| company_id | VARCHAR(255) | Company identifier (COMP-XXX) |
| business_type | VARCHAR(255) | Industry/sector |
| gst_number | VARCHAR(255) | GST registration |
| location | VARCHAR(255) | City, Country |
| description | TEXT | Company description |
| contact_phone | VARCHAR(255) | Contact number |
| website | VARCHAR(255) | Company website |
| blockchain_tx_hash | VARCHAR(255) | Ethereum tx hash |
| is_complete | BOOLEAN | Profile completed? |
| status | ENUM | 'active', 'inactive', 'suspended' |
| created_at | TIMESTAMP | Profile creation date |

#### vendors
**Purpose**: Store vendor profile data

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key → users.id |
| vendor_name | VARCHAR(255) | Vendor/business name |
| share_id | VARCHAR(255) | Unique share ID (SH-XXX) |
| vendor_id | VARCHAR(255) | Vendor identifier (VEN-XXX) |
| specialization | VARCHAR(255) | Service category |
| gst_number | VARCHAR(255) | GST registration |
| location | VARCHAR(255) | City, Country |
| description | TEXT | Vendor description |
| contact_phone | VARCHAR(255) | Contact number |
| website | VARCHAR(255) | Vendor website |
| portfolio_url | VARCHAR(255) | Portfolio/samples |
| blockchain_tx_hash | VARCHAR(255) | Ethereum tx hash |
| is_complete | BOOLEAN | Profile completed? |
| status | ENUM | 'active', 'inactive', 'suspended' |
| created_at | TIMESTAMP | Profile creation date |

#### vendor_company_connection_requests
**Purpose**: Track connection requests

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| vendor_id | BIGINT | FK → vendors.id |
| company_id | BIGINT | FK → companies.id |
| message | TEXT | Request message |
| status | ENUM | 'pending', 'approved', 'denied' |
| approved_at | TIMESTAMP | Approval timestamp |
| denied_at | TIMESTAMP | Denial timestamp |
| created_at | TIMESTAMP | Request creation |

#### vendor_company_connections
**Purpose**: Track active connections

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| vendor_id | BIGINT | FK → vendors.id |
| company_id | BIGINT | FK → companies.id |
| connected_at | TIMESTAMP | Connection established |
| status | ENUM | 'active', 'revoked' |
| revoked_at | TIMESTAMP | Revocation timestamp |
| revoked_by | ENUM | 'vendor', 'company' |

#### refresh_tokens
**Purpose**: JWT refresh token management

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | FK → users.id |
| token | TEXT | Refresh token |
| expires_at | TIMESTAMP | Token expiration |
| created_at | TIMESTAMP | Token creation |

### Relationships

```
users (1) ──→ (0..1) companies
users (1) ──→ (0..1) vendors

vendors (1) ──→ (many) vendor_company_connection_requests
companies (1) ──→ (many) vendor_company_connection_requests

vendors (1) ──→ (many) vendor_company_connections
companies (1) ──→ (many) vendor_company_connections

users (1) ──→ (many) refresh_tokens
```

---

## 🎨 Frontend Features

### Dashboard Layout

**Component**: `DashboardLayout.tsx`

**Features**:
- **Top Navigation**: Logo, share ID badge, profile button, logout
- **Sidebar** (desktop): Navigation menu, user info, share ID display
- **Mobile Menu**: Hamburger menu with all navigation options
- **Profile Badge**: Displays `share_id` in monospace font
- **Active Route**: Highlights current page in navigation

**Share ID Display**:
```tsx
// Monospace font for technical appearance
<span className="font-mono text-xs">{shareId}</span>
```

### Profile Pages

#### CompanyProfile.tsx
**Features**:
- View company information
- Edit company details
- Display blockchain transaction hash
- Security settings (password, 2FA)
- Danger zone (account deletion)

**Blockchain Transaction Display**:
```tsx
<div>
  <h3 className="text-blue-400 text-sm font-medium mb-1">
    Wallet Address
  </h3>
  <p className="text-white font-mono text-sm break-all">
    {companyProfile?.blockchain_tx_hash || 'Not connected'}
  </p>
</div>
```

#### VendorProfile.tsx
**Features**: Same as CompanyProfile but for vendors

### Listings & Quotes

**Company Workflow**:
1. `CompanyListingsManager.tsx` - View all listings
2. `CompanyCreateListing.tsx` - Create new listing with form
3. `CompanyListingDetail.tsx` - View listing + received quotes

**Vendor Workflow**:
1. `VendorListingsBrowser.tsx` - Browse available listings
2. `VendorListingDetail.tsx` - View listing details
3. `VendorCreateQuote.tsx` - Submit competitive quote

---

## 🔒 Security & Authentication

### Security Measures

#### Backend Protection
- ✅ **Sanctum Authentication**: All API routes protected
- ✅ **CORS Configuration**: Restricted to frontend domain
- ✅ **CSRF Protection**: Token validation on state-changing requests
- ✅ **SQL Injection Prevention**: Eloquent ORM parameterized queries
- ✅ **XSS Protection**: Blade escaping, React JSX auto-escaping
- ✅ **Rate Limiting**: API throttling to prevent abuse
- ✅ **Input Validation**: Laravel Form Requests
- ✅ **Profile Authorization**: Middleware checks current_profile_type

#### Blockchain Security
- ✅ **Local Signing**: Private keys NEVER sent to RPC
- ✅ **Environment Variables**: Secrets in .env (not committed)
- ✅ **Transaction Verification**: Check transaction receipt
- ✅ **Gas Limit Protection**: Prevent excessive gas spending
- ✅ **Contract Ownership**: Only owner can update registration status

#### Frontend Security
- ✅ **Token Storage**: localStorage with expiration
- ✅ **Auto Logout**: On token expiration
- ✅ **Route Guards**: ProtectedRoute component
- ✅ **HTTPS Only**: Production deployment
- ✅ **CSP Headers**: Content Security Policy

### Authentication Flow (Detailed)

```
User Authentication:
1. User clicks "Sign in with Google"
2. Frontend redirects to backend /auth/google
3. Backend uses Laravel Socialite
4. Redirect to Google OAuth consent screen
5. User authorizes application
6. Google redirects to /auth/google/callback with code
7. Backend exchanges code for user info
8. Backend creates/updates User in database
9. Backend generates Sanctum token
10. Backend creates refresh token
11. Backend redirects to frontend with token in URL
12. Frontend extracts token from URL
13. Frontend stores token in localStorage
14. Frontend sets axios Authorization header
15. Frontend calls /api/auth/me to get user data
16. AuthContext updates with user data
17. User authenticated and redirected to dashboard

Profile Switching:
1. User clicks "Switch to Vendor"
2. Frontend calls POST /api/profiles/switch { profile_id: 2 }
3. Backend validates profile belongs to user
4. Backend updates users.current_profile_type
5. Backend updates users.current_profile_id
6. Backend returns updated user data
7. Frontend updates AuthContext
8. Frontend redirects to appropriate dashboard
9. Sidebar/navbar update based on profile type
```

### Authorization Middleware

**ProfileTypeMiddleware.php**:
```php
public function handle($request, Closure $next, $requiredType)
{
    $user = $request->user();
    
    if ($user->current_profile_type !== $requiredType) {
        return response()->json([
            'error' => 'Unauthorized',
            'message' => "This action requires a $requiredType profile"
        ], 403);
    }
    
    return $next($request);
}
```

**Usage in routes**:
```php
Route::middleware(['auth:sanctum', 'profile.type:company'])
    ->group(function () {
        Route::get('/listings', [CompanyListingController::class, 'index']);
    });
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. "Unsupported method: eth_sendTransaction"

**Problem**: Trying to use `eth_sendTransaction` with Infura/Alchemy

**Solution**: Use `eth_sendRawTransaction` with local signing
```php
// ✅ CORRECT
$signedTx = $tx->sign($privateKey);
$response = Http::post($nodeUrl, [
    'method' => 'eth_sendRawTransaction',
    'params' => ['0x' . $signedTx]
]);

// ❌ WRONG
$response = Http::post($nodeUrl, [
    'method' => 'eth_sendTransaction',  // Not supported!
    'params' => [$txParams]
]);
```

#### 2. "Transaction failed on blockchain"

**Problem**: Contract rejecting transaction execution

**Possible Causes**:
- Wrong function signature
- Incorrect ABI encoding
- Contract requirements not met (e.g., share ID already exists)
- Insufficient gas

**Debugging**:
```bash
# Check Laravel logs
tail -f backend/storage/logs/laravel.log

# Verify on Etherscan
https://sepolia.etherscan.io/tx/0xYOUR_TX_HASH

# Check contract on Etherscan
https://sepolia.etherscan.io/address/0x541E197ad31ba3Db637273f5433F2f4C2b872B1e
```

#### 3. "hex2bin(): Hexadecimal input string must have an even length"

**Problem**: Odd-length hex strings in RLP encoding

**Solution**: Use `web3p/ethereum-tx` library instead of custom encoding

```bash
composer require web3p/ethereum-tx
```

#### 4. "Company not found" when sending connection request

**Problem**: Using `company_id` instead of `share_id`

**Solution**: Always use `share_id` (format: SH-XXXXXXXXXXXX)
```json
// ✅ CORRECT
{
  "share_id": "SH-ABC123DEF456"
}

// ❌ WRONG
{
  "company_id": "COMP-0001"
}
```

#### 5. Profile switching not reflecting in UI

**Problem**: Frontend state not updated after backend change

**Solution**: Call `fetchFreshUserData()` after switching
```typescript
// ✅ CORRECT
await authService.switchProfile(profileId);
await fetchFreshUserData();  // Refresh user data

// ❌ WRONG
await authService.switchProfile(profileId);
// UI still shows old profile!
```

#### 6. "Property 'blockchain_tx_hash' does not exist"

**Problem**: TypeScript interface missing property

**Solution**: Add to Profile interface in AuthContext.tsx
```typescript
interface Profile {
  // ... other fields
  blockchain_tx_hash?: string;  // Add this
}
```

#### 7. CORS errors in browser console

**Problem**: Backend not configured for frontend domain

**Solution**: Update `config/cors.php`
```php
'allowed_origins' => [
    'http://localhost:5173',  // Vite dev server
    'https://yourdomain.com'  // Production
],
```

#### 8. "Artifacts not found" when registering

**Problem**: Hardhat compiled to wrong directory

**Solution**: Fix hardhat.config.js
```javascript
module.exports = {
  paths: {
    artifacts: "../backend/storage/blockchain/artifacts"  // ✅ Correct path
  }
};
```

Then recompile:
```bash
cd blockchain
npx hardhat clean
npx hardhat compile
```

### Health Check Endpoints

```bash
# Public health check
curl http://localhost:8000/api/health

# Authenticated health check
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/auth-health

# Connection system debug
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/debug-connection
```

### Log Files

```bash
# Laravel application logs
tail -f backend/storage/logs/laravel.log

# PHP error logs
tail -f /var/log/php8.3-fpm.log

# MySQL query logs
tail -f /var/log/mysql/query.log

# Nginx/Apache access logs
tail -f /var/log/nginx/access.log
```

---

## 🚧 Development Workflow

### Daily Development

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Watch logs
cd backend
tail -f storage/logs/laravel.log

# Terminal 4: Blockchain (if needed)
cd blockchain
npx hardhat node  # Local network
```

### Making Changes

#### 1. Database Changes

```bash
# Create migration
php artisan make:migration add_column_to_table

# Edit migration file
# database/migrations/YYYY_MM_DD_HHMMSS_add_column_to_table.php

# Run migration
php artisan migrate

# Rollback if needed
php artisan migrate:rollback

# Fresh start with seeders
php artisan migrate:fresh --seed
```

#### 2. Smart Contract Changes

```bash
# Edit contract
nano blockchain/contracts/RegistrationContract.sol

# Compile
cd blockchain
npx hardhat compile

# Test locally
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Update .env with new contract address
BLOCKCHAIN_CONTRACT_ADDRESS=0xNEW_CONTRACT_ADDRESS

# Clear Laravel cache
cd backend
php artisan config:clear
```

#### 3. Frontend Changes

```bash
# Make changes to React components
# Vite auto-reloads on save

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Backend tests
cd backend
php artisan test

# Run specific test
php artisan test --filter=ProfileTest

# With coverage
php artisan test --coverage

# Frontend tests (if configured)
cd frontend
npm test

# Blockchain tests
cd blockchain
npx hardhat test

# Test specific contract
npx hardhat test test/RegistrationContract.test.js
```

### Code Quality

```bash
# PHP code style (Laravel Pint)
cd backend
./vendor/bin/pint

# ESLint (frontend)
cd frontend
npm run lint

# TypeScript type check
npm run type-check
```

---

## 📚 Additional Documentation

- [Transaction Signing Fix](TRANSACTION_SIGNING_FIX.md) - Complete blockchain debugging journey
- [API Routes Reference](API_ROUTES_REFERENCE.md) - Detailed endpoint documentation
- [Backend README](backend/README.md) - Laravel-specific documentation
- [Frontend README](frontend/README.md) - React-specific documentation

---

## 🎯 Roadmap

### ✅ Completed Features
- [x] Google OAuth authentication
- [x] Dual profile system (company/vendor)
- [x] Profile switching
- [x] Blockchain registration (Sepolia)
- [x] Connection management
- [x] Share ID system
- [x] Listings & quotes foundation
- [x] Dashboard layouts
- [x] Profile pages
- [x] Reverse auction live bidding mechanism
- [x] Advanced quote comparison
- [x] Payment integration (Razorpay & In-App Wallets)
- [x] Gasless transactions (Admin sponsored)

### 🚧 In Progress
- [ ] Real-time notifications
- [ ] Contract management

### 📋 Planned Features
- [ ] IPFS integration for documents
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Reputation system
- [ ] Escrow smart contracts
- [ ] NFT badges for verified entities
- [ ] DAO governance

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests**: `php artisan test && npm test`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Style

- **PHP**: Follow PSR-12 coding standard
- **TypeScript/React**: Follow Airbnb style guide
- **Solidity**: Follow Solidity style guide
- **Commits**: Use conventional commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Laravel Team** - Amazing PHP framework
- **React Team** - Powerful UI library
- **Ethereum Foundation** - Blockchain infrastructure
- **Alchemy** - Reliable RPC provider
- **Hardhat** - Best Solidity development environment
- **kornrunner/keccak** - PHP Keccak-256 implementation
- **web3p/ethereum-tx** - Transaction signing library

---

## 📞 Support & Contact

**Project Maintainer**: Arryaan Jain

**Issues**: [GitHub Issues](https://github.com/arryaanjain/RAPP/issues)

**Documentation**: This README + inline code comments

**Stack Overflow**: Tag questions with `rapp-platform`

---

## 🎉 Status

**Version**: 1.0.0 (Beta)  
**Status**: ✅ **Production-Ready** (Sepolia Testnet)  
**Last Updated**: November 3, 2025

---

**Built with ❤️ for transparent, blockchain-verified vendor-company connections**

*Revolutionizing B2B interactions, one smart contract at a time.*
