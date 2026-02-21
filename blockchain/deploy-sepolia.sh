#!/bin/bash

echo "🚀 RAPP Sepolia Deployment Script"
echo "================================="

# Check if we're in the blockchain directory
if [ ! -f "hardhat.config.js" ]; then
    echo "❌ Error: Please run this script from the blockchain directory"
    echo "   cd blockchain && ./deploy-sepolia.sh"
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "../backend/.env" ]; then
    echo "❌ Error: Backend .env file not found"
    echo "   Please ensure your backend .env file is configured with:"
    echo "   - BLOCKCHAIN_NODE_URL"
    echo "   - BLOCKCHAIN_ADMIN_PRIVATE_KEY" 
    exit 1
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "✅ Make sure you have:"
echo "   - Infura/Alchemy account set up"
echo "   - BLOCKCHAIN_NODE_URL configured in backend/.env"
echo "   - BLOCKCHAIN_ADMIN_PRIVATE_KEY configured in backend/.env"
echo "   - Sepolia ETH in your wallet (at least 0.1 ETH)"
echo ""

read -p "🤔 Ready to deploy to Sepolia? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile

# Deploy to Sepolia
echo "🚀 Deploying to Sepolia testnet..."
npx hardhat run scripts/deploy.js --network sepolia

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the contract address from above"
    echo "2. Update BLOCKCHAIN_CONTRACT_ADDRESS in your backend/.env file"
    echo "3. Restart your backend server"
    echo "4. Test the connection with: cd ../backend && php artisan blockchain:validate-config"
    echo ""
    
    if [ -f "deployment.json" ]; then
        echo "📄 Deployment details saved to deployment.json:"
        cat deployment.json
    fi
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above and ensure:"
    echo "- Your RPC URL is correct"
    echo "- Your private key is valid"
    echo "- Your wallet has sufficient Sepolia ETH"
    echo "- Network connectivity is working"
fi