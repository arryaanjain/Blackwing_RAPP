# 🔧 Environment Variables Quick Setup Guide

## 1. BLOCKCHAIN_NODE_URL

### Option A: Infura (Recommended)
1. Go to [infura.io](https://infura.io) → Sign up → Create project
2. Select "Web3 API" → Name: "RAPP Production"
3. Copy your Project ID from dashboard
4. **Your value**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Option B: Alchemy
1. Go to [alchemy.com](https://alchemy.com) → Sign up → Create app
2. Chain: Ethereum, Network: Sepolia testnet
3. Copy API key from dashboard  
4. **Your value**: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### Option C: Free RPC (Less reliable)
- **Your value**: `https://sepolia.drpc.org`

---

## 2. BLOCKCHAIN_ADMIN_PRIVATE_KEY

### Using MetaMask (Easiest):
1. Install MetaMask browser extension
2. Create NEW wallet (don't import existing)
3. Switch to Sepolia network
4. Go to Account details → Export Private Key
5. **Your value**: The exported private key (starts with 0x)

### Using Command Line:
```bash
# Generate secure random private key
echo "0x$(openssl rand -hex 32)"
```

**⚠️ SECURITY**: Never share this key or commit it to version control!

---

## 3. Get Sepolia Test ETH

1. Copy your wallet **public address** (not private key)
2. Visit faucets (you may need to use multiple):
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Faucet](https://sepoliafaucet.com/)
   - [Infura Faucet](https://www.infura.io/faucet/sepolia)
3. Request 0.5 ETH (enough for testing)
4. Wait 1-2 minutes for confirmation

---

## 4. BLOCKCHAIN_CONTRACT_ADDRESS

**This will be generated after deployment!**

After you deploy the contract using `./deploy-sepolia.sh`, you'll get the contract address.

---

## 📝 Step-by-Step Deployment Process

### 1. Update backend/.env
```bash
# Edit your backend/.env file with the values from above:
BLOCKCHAIN_NODE_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_ADMIN_PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
BLOCKCHAIN_CONTRACT_ADDRESS=will_be_set_after_deployment
```

### 2. Deploy Contract
```bash
cd blockchain
./deploy-sepolia.sh
```

### 3. Update Contract Address
After successful deployment, copy the contract address and update your `.env`:
```bash
BLOCKCHAIN_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

### 4. Test Configuration
```bash
cd ../backend
php artisan blockchain:validate-config
```

---

## 🚨 Troubleshooting

### "Insufficient funds" error
- Get more Sepolia ETH from faucets
- Check wallet balance in MetaMask

### "Invalid RPC URL" error  
- Double-check your Infura/Alchemy project ID
- Ensure the URL format is correct

### "Private key invalid" error
- Ensure private key starts with 0x
- Ensure it's 66 characters long (0x + 64 hex chars)
- Make sure you exported the private key correctly

### "Network not found" error
- Check that hardhat.config.js includes Sepolia network
- Ensure environment variables are loaded correctly

---

## 💡 Pro Tips

1. **Test with small amounts first** - Only request minimum Sepolia ETH needed
2. **Keep backups** - Save your private key securely (but never in code)
3. **Monitor transactions** - Check [Sepolia Etherscan](https://sepolia.etherscan.io) for confirmations
4. **Use different wallets** - Separate wallets for different environments
5. **Rate limits** - Free RPC providers have rate limits, consider paid plans for production

---

## 🔗 Useful Links

- [Sepolia Etherscan](https://sepolia.etherscan.io) - Transaction explorer
- [Infura Dashboard](https://infura.io/dashboard) - Manage RPC endpoints
- [Alchemy Dashboard](https://dashboard.alchemy.com/) - Alternative RPC provider
- [MetaMask](https://metamask.io/) - Wallet for managing private keys
- [Sepolia Faucet List](https://faucetlink.to/sepolia) - Multiple faucet options