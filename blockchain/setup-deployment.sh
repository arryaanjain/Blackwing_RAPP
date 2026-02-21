#!/bin/bash

# RAPP Blockchain Deployment Setup Script
# This script helps you deploy RAPP smart contracts to different networks

set -e  # Exit on any error

echo "🚀 RAPP Blockchain Deployment Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "hardhat.config.js" ]; then
    echo "❌ Error: Please run this script from the blockchain directory"
    echo "   cd blockchain && ./setup-deployment.sh"
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "../backend/.env" ]; then
    echo "❌ Error: Backend .env file not found"
    echo "   Please copy .env.example to .env and configure it first"
    exit 1
fi

# Load environment variables
source ../backend/.env

echo ""
echo "🔍 Current Configuration:"
echo "Network URL: ${BLOCKCHAIN_NODE_URL:-Not set}"
echo "Contract Address: ${BLOCKCHAIN_CONTRACT_ADDRESS:-Not set}"
echo "Private Key: ${BLOCKCHAIN_ADMIN_PRIVATE_KEY:+*****Hidden*****}"

echo ""
echo "📋 Available Networks:"
echo "1. localhost     - Local Hardhat node (for development)"
echo "2. sepolia       - Sepolia testnet (recommended for testing)"
echo "3. goerli        - Goerli testnet (legacy, use sepolia instead)"
echo "4. mumbai        - Polygon Mumbai testnet (low cost)"
echo "5. polygon       - Polygon mainnet (low cost production)"
echo "6. mainnet       - Ethereum mainnet (high cost production)"

echo ""
read -p "🤔 Which network do you want to deploy to? (1-6): " network_choice

case $network_choice in
    1)
        NETWORK="localhost"
        echo "🏠 Deploying to local network..."
        ;;
    2)
        NETWORK="sepolia"
        echo "🧪 Deploying to Sepolia testnet..."
        ;;
    3)
        NETWORK="goerli"
        echo "🧪 Deploying to Goerli testnet..."
        ;;
    4)
        NETWORK="mumbai"
        echo "🧪 Deploying to Polygon Mumbai testnet..."
        ;;
    5)
        NETWORK="polygon"
        echo "🔴 Deploying to Polygon mainnet (REAL MONEY!)..."
        ;;
    6)
        NETWORK="mainnet"
        echo "🔴 Deploying to Ethereum mainnet (EXPENSIVE!)..."
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Confirm deployment for production networks
if [ "$NETWORK" = "mainnet" ] || [ "$NETWORK" = "polygon" ]; then
    echo ""
    echo "⚠️  WARNING: You are about to deploy to a PRODUCTION network!"
    echo "   This will cost real money and cannot be undone."
    read -p "   Are you absolutely sure? (type 'yes' to continue): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check if node modules are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile

# Run deployment
echo "🚀 Deploying to $NETWORK..."
npx hardhat run scripts/deploy-production.js --network $NETWORK

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Update your backend .env file with the new contract address"
echo "2. Restart your backend server"
echo "3. Test the integration"

if [ "$NETWORK" != "localhost" ]; then
    echo "4. Verify the contract on the block explorer"
    echo "5. Fund your admin wallet with tokens for transactions"
fi

echo ""
echo "🎉 Happy deploying!"