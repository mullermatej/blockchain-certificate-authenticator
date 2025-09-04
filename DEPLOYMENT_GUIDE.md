# 🚀 Production Deployment Guide

## Overview

This guide covers deploying your Blockchain Certificate Authenticator to production environments.

## 📋 Pre-Deployment Checklist

### Environment Configuration:

-   [ ] Production `.env` file configured
-   [ ] Mainnet contract deployed (if going to production)
-   [ ] RPC provider configured (Alchemy/Infura)
-   [ ] Domain name and SSL certificate ready
-   [ ] Database backup strategy (if applicable)

### Security Review:

-   [ ] API rate limiting implemented
-   [ ] CORS origins properly configured
-   [ ] Input validation on all endpoints
-   [ ] Error messages don't leak sensitive info
-   [ ] Environment variables secured

## 🌐 Frontend Deployment (Vercel/Netlify)

### Using Vercel:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Build and deploy
cd frontend
npm run build
vercel --prod
```

### Environment Variables for Production Frontend:

```env
VITE_CHAIN_ID=137  # Polygon Mainnet (or 80002 for Amoy testnet)
VITE_RPC_URL=https://polygon-rpc.com
VITE_CONTRACT_ADDRESS=0xYourProductionContractAddress
VITE_BACKEND_URL=https://your-backend-domain.com
```

### Build Optimization:

```bash
# In frontend directory
npm run build
npm run preview  # Test production build locally
```

## 🖥️ Backend Deployment (Railway/Heroku/DigitalOcean)

### Using Railway:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway deploy
```

### Production Environment Variables:

```env
NODE_ENV=production
PORT=3001
CHAIN_ID=137  # Polygon Mainnet
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY
CONTRACT_ADDRESS=0xYourProductionContractAddress
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment:

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📋 Smart Contract Production Deployment

### Mainnet Deployment Considerations:

1. **Security Audit:** Have contract audited before mainnet
2. **Gas Optimization:** Optimize for lower gas costs
3. **Upgradability:** Consider proxy pattern for upgrades
4. **Ownership:** Secure private keys for contract owner

### Deployment to Polygon Mainnet:

```javascript
// Updated deployment script for mainnet
const MAINNET_RPC = 'https://polygon-rpc.com';
const provider = new ethers.JsonRpcProvider(MAINNET_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Deploy with proper gas settings
const contract = await ContractFactory.deploy({
	gasLimit: 3000000,
	gasPrice: ethers.parseUnits('30', 'gwei'),
});
```

## 🔒 Security Hardening

### Backend Security:

```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Add helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

### Environment Security:

-   Use vault services (AWS Secrets Manager, etc.)
-   Rotate API keys regularly
-   Monitor for suspicious activity
-   Implement logging and alerting

## 📊 Monitoring & Analytics

### Health Monitoring:

```javascript
// Enhanced health check
app.get('/health', async (req, res) => {
	const checks = {
		database: await checkDatabase(),
		blockchain: await checkBlockchain(),
		memory: process.memoryUsage(),
		uptime: process.uptime(),
	};

	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		checks,
	});
});
```

### Performance Monitoring:

-   Set up APM (New Relic, DataDog)
-   Monitor response times
-   Track error rates
-   Monitor blockchain interaction costs

## 🚦 Staging Environment

### Staging Setup:

```bash
# Use testnet for staging
CHAIN_ID=80002  # Polygon Amoy testnet
RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS=0xYourTestnetContractAddress
```

### Testing Pipeline:

1. Deploy to staging automatically on PR
2. Run automated tests
3. Manual QA testing
4. Performance testing
5. Security scanning

## 📈 Scaling Considerations

### Load Balancing:

-   Use reverse proxy (nginx)
-   Multiple backend instances
-   CDN for frontend assets

### Caching:

```javascript
// Cache blockchain responses
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

app.get('/api/verify', async (req, res) => {
	const cacheKey = `verify_${hash}`;
	let result = cache.get(cacheKey);

	if (!result) {
		result = await contract.verify(hash);
		cache.set(cacheKey, result);
	}

	res.json({ result });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example:

```yaml
name: Deploy to Production
on:
    push:
        branches: [main]
jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - name: Setup Node.js
              uses: actions/setup-node@v2
              with:
                  node-version: '18'
            - name: Install dependencies
              run: npm ci
            - name: Run tests
              run: npm test
            - name: Deploy to production
              run: npm run deploy
```

## 📞 Support & Maintenance

### Monitoring Alerts:

-   API response time > 5 seconds
-   Error rate > 5%
-   Blockchain connection failures
-   High memory usage

### Backup Strategy:

-   Database backups (if applicable)
-   Environment configuration backups
-   Contract deployment scripts
-   Private key backup (secure vault)

### Update Strategy:

-   Rolling deployments
-   Database migration scripts
-   Contract upgrade procedures
-   Rollback plans

---

## 🎯 Production Readiness Checklist

### Technical:

-   [ ] All tests passing
-   [ ] Performance benchmarks met
-   [ ] Security scan completed
-   [ ] Monitoring setup
-   [ ] Backup procedures tested

### Business:

-   [ ] User documentation completed
-   [ ] Support procedures defined
-   [ ] Legal compliance reviewed
-   [ ] Terms of service/privacy policy
-   [ ] Launch plan executed

**Ready for production! 🚀**
