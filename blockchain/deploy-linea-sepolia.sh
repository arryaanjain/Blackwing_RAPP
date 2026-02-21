#!/bin/bash

# Deploy Registration Contract to Linea Sepolia
# This script deploys only the RegistrationContract to Linea Sepolia testnet

echo "🚀 Starting Registration Contract Deployment to Linea Sepolia..."
echo "=================================================="

# Change to blockchain directory
cd "$(dirname "$0")/.."

# Check if .env file exists
if [ ! -f "../backend/.env" ]; then
    echo "❌ Error: .env file not found in backend directory"
    exit 1
fi

# Load environment variables
source ../backend/.env

# Validate required environment variables
if [ -z "$BLOCKCHAIN_NODE_URL" ]; then
    echo "❌ Error: BLOCKCHAIN_NODE_URL not set in .env"
    exit 1
fi

if [ -z "$BLOCKCHAIN_ADMIN_PRIVATE_KEY" ]; then
    echo "❌ Error: BLOCKCHAIN_ADMIN_PRIVATE_KEY not set in .env"
    exit 1
fi

echo "✅ Environment variables validated"
echo "🌐 Network: Linea Sepolia (Chain ID: 59141)"
echo "🔗 RPC URL: $BLOCKCHAIN_NODE_URL"
echo ""

# Compile contracts
echo "📦 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed"
    exit 1
fi

echo "✅ Contracts compiled successfully"
echo ""

# Deploy contract
echo "🚀 Deploying RegistrationContract to Linea Sepolia..."
npx hardhat run scripts/deploy-registration.js --network lineaSepolia

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Registration Contract deployed successfully!"
    echo "=================================================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Copy the contract address from the output above"
    echo "2. Update BLOCKCHAIN_CONTRACT_ADDRESS in your .env file"
    echo "3. Update frontend configuration with the new contract address"
    echo "4. Test the contract functions"
    echo ""
    echo "💡 Tip: You can verify the contract on Linea Explorer:"
    echo "   https://sepolia.lineascan.build/"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi