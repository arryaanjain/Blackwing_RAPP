# Production Deployment Checklist

## 🚀 Pre-Deployment Checklist

### Backend Environment Configuration

#### Required Environment Variables
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` - Generate new key with `php artisan key:generate`
- [ ] `APP_URL` - Set to your production domain

#### Database Configuration
- [ ] `DB_CONNECTION` - Set to production database
- [ ] `DB_HOST` - Production database host
- [ ] `DB_DATABASE` - Production database name
- [ ] `DB_USERNAME` - Production database user
- [ ] `DB_PASSWORD` - Secure database password

#### Blockchain Configuration (CRITICAL)
- [ ] `BLOCKCHAIN_NODE_URL` - Set to production RPC endpoint (Infura/Alchemy)
- [ ] `BLOCKCHAIN_CONTRACT_ADDRESS` - Set to deployed contract address
- [ ] `BLOCKCHAIN_ADMIN_PRIVATE_KEY` - Set to production wallet private key
- [ ] Remove all placeholder values (`REPLACE_WITH_*`)
- [ ] Ensure no local development values remain

#### Other Required Variables
- [ ] `FRONTEND_URL` - Set to production frontend URL
- [ ] `SANCTUM_STATEFUL_DOMAINS` - Set to production domains
- [ ] `CORS_ALLOWED_ORIGINS` - Set to production domains
- [ ] `GOOGLE_CLIENT_ID` - Production OAuth credentials
- [ ] `GOOGLE_CLIENT_SECRET` - Production OAuth credentials
- [ ] `GOOGLE_REDIRECT_URL` - Production OAuth callback URL

### Frontend Environment Configuration

#### Required Environment Variables
- [ ] `VITE_API_BASE_URL` - Set to production backend URL
- [ ] Optional: `VITE_BLOCKCHAIN_NETWORK_NAME` for UI display
- [ ] Optional: `VITE_BLOCKCHAIN_EXPLORER_URL` for transaction links

### Blockchain Deployment

#### Contract Deployment
- [ ] Deploy smart contracts to target network (Sepolia/Mainnet)
- [ ] Verify contracts on Etherscan/block explorer
- [ ] Save deployment addresses and transaction hashes
- [ ] Test contract functionality on target network

#### Wallet Setup
- [ ] Create new wallet for production (never reuse development keys)
- [ ] Fund wallet with sufficient tokens for gas fees
- [ ] Securely store private key (consider hardware wallet for mainnet)
- [ ] Test wallet connectivity with production RPC

#### Network Configuration
- [ ] Set up production RPC provider (Infura/Alchemy)
- [ ] Configure rate limits and monitoring
- [ ] Set up API key rotation if needed
- [ ] Test RPC connectivity and performance

## 🔧 Deployment Commands

### 1. Backend Deployment
```bash
# Clone repository
git clone <your-repo> production-rapp
cd production-rapp/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Set up environment
cp .env.example .env
# Edit .env with production values

# Generate application key
php artisan key:generate

# Validate configuration
php artisan blockchain:validate-config

# Run migrations
php artisan migrate --force

# Cache configuration for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start application
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Frontend Deployment
```bash
cd production-rapp/frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with production values

# Build for production
npm run build

# Serve built files (example with serve)
npm install -g serve
serve -s dist -p 3000
```

### 3. Blockchain Deployment
```bash
cd production-rapp/blockchain

# Install dependencies
npm install

# Set up environment (uses backend .env)
# Ensure BLOCKCHAIN_* variables are set in backend/.env

# Deploy to target network
npx hardhat run scripts/deploy-production.js --network sepolia
# or for mainnet: --network mainnet

# Verify contract (optional)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## ✅ Post-Deployment Verification

### Application Health Checks
- [ ] Backend health endpoint responds: `GET /api/health`
- [ ] Frontend loads without errors
- [ ] Database connectivity confirmed
- [ ] Authentication flow works end-to-end

### Blockchain Integration Tests
- [ ] Blockchain connection test: `php artisan blockchain:validate-config`
- [ ] Contract interaction test (if applicable)
- [ ] Transaction submission test (with small amount)
- [ ] Event monitoring working (if applicable)

### Security Verification
- [ ] HTTPS enabled and working
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] No sensitive data in logs
- [ ] Environment variables secure
- [ ] Database access restricted

### Performance Checks
- [ ] Application response times acceptable
- [ ] RPC provider response times acceptable
- [ ] Database query performance optimized
- [ ] Frontend assets loading efficiently

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use different keys/secrets for each environment
- Rotate keys regularly in production
- Use environment variable management tools in cloud deployments

### Blockchain Security
- Never use development private keys in production
- Use hardware wallets for high-value operations
- Implement multi-signature for critical operations
- Monitor wallet balances and transactions
- Set up alerts for unexpected blockchain activity

### Application Security
- Keep dependencies updated
- Enable Laravel security features
- Use HTTPS everywhere
- Implement proper logging and monitoring
- Regular security audits

## 🚨 Emergency Procedures

### If Blockchain Private Key is Compromised
1. Immediately transfer funds to new secure wallet
2. Update `BLOCKCHAIN_ADMIN_PRIVATE_KEY` with new key
3. Redeploy application
4. Monitor old wallet for unauthorized activity
5. Review access logs

### If Application is Compromised
1. Take application offline
2. Investigate breach
3. Rotate all secrets and keys
4. Update dependencies
5. Deploy fixed version
6. Monitor for further issues

## 📋 Environment-Specific Values

### Sepolia Testnet
```env
BLOCKCHAIN_NODE_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_NETWORK_ID=11155111
```

### Ethereum Mainnet
```env
BLOCKCHAIN_NODE_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_NETWORK_ID=1
```

### Polygon Mainnet
```env
BLOCKCHAIN_NODE_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
BLOCKCHAIN_NETWORK_ID=137
```

## 📞 Support Contacts

- RPC Provider Support: [Infura](https://infura.io/support) / [Alchemy](https://alchemy.com/support)
- Block Explorer: [Etherscan](https://etherscan.io) / [Polygonscan](https://polygonscan.com)
- Laravel Documentation: [Laravel Docs](https://laravel.com/docs)
- Emergency Contact: [Your team contact information]

---

**Remember**: Test everything in a staging environment that mirrors production before deploying to production!