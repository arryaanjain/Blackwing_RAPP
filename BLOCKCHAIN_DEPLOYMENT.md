# Blockchain Deployment Guide

This guide explains how to configure RAPP for different blockchain networks, from local development to production deployment.

## Overview

RAPP supports multiple blockchain networks:
- **Local Development**: Hardhat local node
- **Testnet**: Sepolia Ethereum testnet (recommended)
- **Production**: Ethereum mainnet or Polygon

## 1. Local Development (Current Setup)

```env
BLOCKCHAIN_NODE_URL=http://127.0.0.1:8545
BLOCKCHAIN_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
BLOCKCHAIN_ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Pros**: Fast, free, full control
**Cons**: Resets on restart, no persistence

## 2. Sepolia Testnet (Recommended for Testing)

### Prerequisites
1. **Get Sepolia ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Or [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - Request test ETH for your wallet

2. **Get RPC Provider** (Choose one):
   
   **Option A: Infura (Recommended)**
   - Go to [Infura.io](https://infura.io)
   - Create free account
   - Create new project
   - Get your Project ID
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
   
   **Option B: Alchemy**
   - Go to [Alchemy.com](https://alchemy.com)
   - Create free account
   - Create new app (Sepolia network)
   - Get your API key
   - RPC URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
   
   **Option C: Public RPC (Free but less reliable)**
   - RPC URL: `https://sepolia.drpc.org`

3. **Deploy Contract to Sepolia**:
   ```bash
   # In your blockchain project directory
   npx hardhat run scripts/deploy.js --network sepolia
   ```

### Configuration
```env
BLOCKCHAIN_NODE_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
BLOCKCHAIN_CONTRACT_ADDRESS=your_deployed_contract_address_on_sepolia
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_wallet_private_key_with_sepolia_eth
BLOCKCHAIN_NETWORK_ID=11155111
BLOCKCHAIN_NETWORK_NAME=sepolia
```

**Pros**: Persistent, free, realistic testing
**Cons**: Slower than local, requires faucet ETH

## 3. Ethereum Mainnet (Production)

### Prerequisites
1. **Real ETH**: You need actual ETH for gas fees
2. **Secure Private Key Management**: Use environment variables, never commit keys
3. **RPC Provider**: Infura/Alchemy production plans recommended

### Configuration
```env
BLOCKCHAIN_NODE_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
BLOCKCHAIN_CONTRACT_ADDRESS=your_deployed_contract_address_on_mainnet
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_wallet_private_key_with_real_eth
BLOCKCHAIN_NETWORK_ID=1
BLOCKCHAIN_NETWORK_NAME=mainnet
```

**Pros**: Production-ready, permanent
**Cons**: Expensive gas fees, high stakes

## 4. Polygon (Cost-Effective Alternative)

### Polygon Mumbai Testnet
```env
BLOCKCHAIN_NODE_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
BLOCKCHAIN_CONTRACT_ADDRESS=your_deployed_contract_address_on_mumbai
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_wallet_private_key_with_mumbai_matic
BLOCKCHAIN_NETWORK_ID=80001
BLOCKCHAIN_NETWORK_NAME=mumbai
```

### Polygon Mainnet
```env
BLOCKCHAIN_NODE_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
BLOCKCHAIN_CONTRACT_ADDRESS=your_deployed_contract_address_on_polygon
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_wallet_private_key_with_matic
BLOCKCHAIN_NETWORK_ID=137
BLOCKCHAIN_NETWORK_NAME=polygon
```

**Pros**: Much lower gas fees than Ethereum
**Cons**: Different ecosystem, less decentralized

## Deployment Steps for Sepolia (Recommended)

### Step 1: Get Infura Account
1. Go to [infura.io](https://infura.io)
2. Sign up for free account
3. Create new project
4. Select "Web3 API"
5. Copy your Project ID

### Step 2: Get Sepolia ETH
1. Create or use existing MetaMask wallet
2. Switch to Sepolia network in MetaMask
3. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
4. Enter your wallet address
5. Request 0.5 ETH (should be enough for testing)

### Step 3: Deploy Smart Contract
```bash
# Create hardhat.config.js if not exists
module.exports = {
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 4: Update Environment
```env
BLOCKCHAIN_NODE_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_CONTRACT_ADDRESS=0x... # Address from deployment
BLOCKCHAIN_ADMIN_PRIVATE_KEY=0x... # Your wallet private key
```

### Step 5: Test Connection
```bash
# Test in Laravel tinker
php artisan tinker

# Test blockchain connection
$provider = new \Web3\Web3('https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
$provider->eth->blockNumber(function ($err, $blockNumber) {
    echo "Current block: " . $blockNumber . "\n";
});
```

## Security Best Practices

### For Production:
1. **Never commit private keys** to version control
2. **Use environment variables** for all sensitive data
3. **Use hardware wallets** for high-value accounts
4. **Implement multi-sig** for contract ownership
5. **Audit smart contracts** before mainnet deployment

### Private Key Management:
```bash
# Generate new wallet for production
openssl rand -hex 32

# Use in .env (never commit this)
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_generated_private_key
```

## Cost Estimation

### Sepolia Testnet: FREE
- Transaction fees: 0 real cost
- RPC calls: Free tier sufficient

### Ethereum Mainnet: EXPENSIVE
- Transaction fees: $10-100+ depending on network congestion
- RPC calls: ~$50-200/month for moderate usage

### Polygon: COST-EFFECTIVE
- Transaction fees: $0.01-0.10 per transaction
- RPC calls: Same as Ethereum

## Monitoring & Maintenance

1. **Monitor RPC usage**: Most providers have usage dashboards
2. **Set up alerts**: For contract interactions and errors
3. **Regular backups**: Of contract addresses and configurations
4. **Gas price monitoring**: Use tools like ETH Gas Station

## Troubleshooting

### Common Issues:
1. **"Insufficient funds"**: Need more ETH/MATIC for gas
2. **"Invalid RPC URL"**: Check provider endpoint
3. **"Contract not found"**: Verify contract address and network
4. **"Rate limited"**: Upgrade RPC provider plan

### Debug Commands:
```bash
# Check wallet balance
cast balance YOUR_WALLET_ADDRESS --rpc-url YOUR_RPC_URL

# Check contract exists
cast code YOUR_CONTRACT_ADDRESS --rpc-url YOUR_RPC_URL

# Test RPC connection
curl -X POST YOUR_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Next Steps

1. Choose your target network (Sepolia recommended for testing)
2. Set up RPC provider account
3. Get test tokens from faucet
4. Deploy smart contracts
5. Update environment configuration
6. Test thoroughly before production deployment

For production deployment, consider professional security audit and insurance for smart contracts handling significant value.