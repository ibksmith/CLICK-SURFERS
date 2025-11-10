# Vercel Deployment & Base.dev Integration Guide

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Your Repository**
   - Click "Import Git Repository"
   - Select: `ibksmith/CLICK-SURFERS`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Other** (or leave default)
   - Root Directory: `./` (leave as is)
   - Build Command: (leave empty)
   - Output Directory: `./` (leave as is)
   - Install Command: `npm install` (optional, will auto-detect)

4. **Environment Variables** (Optional for now)
   - Add later if needed for API keys
   
5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (1-2 minutes)
   - Copy your deployment URL: `https://your-app-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if you install Node.js later)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production directly
vercel --prod
```

---

## 🔗 Connect to Base.dev

### Step 1: Update Your Deployment URL

After Vercel deployment, update these files with your actual URL:

**File: `base-service-config.json`**
Replace:
```json
"url": "https://your-vercel-app.vercel.app"
```
With your actual Vercel URL:
```json
"url": "https://click-surfers.vercel.app"
```

**File: `index.html` (line 6)**
Replace:
```html
<meta name="fc:miniapp" content='{"version":"next","imageUrl":"https://your-domain.com/embed.png",...}'>
```
With your actual Vercel URL

**File: `.well-known/farcaster.json`**
Update all placeholder URLs with your Vercel deployment URL

### Step 2: Register on Base.dev

1. **Visit Base Ecosystem Directory**
   - Go to: https://base.org/ecosystem
   - Or: https://www.base.org/builders

2. **Submit Your Project**
   - Look for "Submit your project" or "Add to ecosystem"
   - Fill in the form with details from `base-service-config.json`:
     
     **Project Information:**
     - Name: `Click Surfers - Click Race Game`
     - Description: `A decentralized click race game on Base Network where 10 players compete by clicking fastest to win prizes`
     - Category: `Gaming` or `DeFi & Gaming`
     - URL: `https://your-vercel-app.vercel.app`
     - GitHub: `https://github.com/ibksmith/CLICK-SURFERS`

     **Contact:**
     - Email: `ibksmith25@gmail.com`
     - Farcaster: `ibukunoluwa.base.eth`

     **Technical Details:**
     - Network: `Base Sepolia Testnet` (for testing)
     - Contract Address: `0x4453c351b1dfeff3f8379f441629a4b0e2d5c894`
     - Technologies: `Ethers.js, Solidity, Hardhat`

3. **Alternative: Base Build**
   - Visit: https://build.base.org
   - Create an account
   - Register your MiniApp
   - Get accountAssociation credentials
   - Update `.well-known/farcaster.json` with the credentials

### Step 3: Verify on BaseScan

If not already verified, verify your contract:

```bash
# After installing Hardhat (when Node.js is available)
npx hardhat verify --network baseSepolia 0x4453c351b1dfeff3f8379f441629a4b0e2d5c894
```

Or verify manually:
1. Go to: https://sepolia.basescan.org/address/0x4453c351b1dfeff3f8379f441629a4b0e2d5c894
2. Click "Contract" → "Verify and Publish"
3. Upload contract source code from `contracts/ClickRaceGame.sol`
4. Compiler version: `0.8.19`
5. Optimization: `Yes` with 200 runs

---

## 📋 Base Network Integration Checklist

### ✅ Completed
- [x] Ethers.js integration (`ethers-integration.js`)
- [x] Web3.js integration (`contract-integration.js`)
- [x] Base Network configuration
- [x] Vercel deployment configuration (`vercel.json`)
- [x] Contract ABI and address setup
- [x] GitHub repository created
- [x] Git commits pushed

### 🔄 Next Steps
- [ ] Deploy to Vercel
- [ ] Update URLs in config files with actual deployment URL
- [ ] Register on Base.dev ecosystem
- [ ] Register as Base Build MiniApp (optional)
- [ ] Verify contract on BaseScan (if not done)
- [ ] Test wallet connection on deployed site
- [ ] Test game flow end-to-end

---

## 🧪 Testing Your Deployment

### Test Locally First (Optional)
If you install Node.js later:
```bash
npm install
npm start
# Visit http://localhost:8000
```

### Test on Vercel
1. Visit your Vercel URL
2. Click "Connect Wallet"
3. MetaMask should prompt to:
   - Connect to Base Sepolia network
   - Approve connection
4. Test voting functionality
5. Test payment functionality
6. Test race mechanics

---

## 🔧 Ethers.js Usage in Your App

The app now supports **both** Web3.js and Ethers.js:

### Using Ethers.js (New)
```javascript
// In browser console or app.js
const ethersContract = new window.EthersContractInterface();

// Initialize with wallet
await ethersContract.initWithWallet();

// Or read-only mode (no wallet needed)
await ethersContract.initReadOnly();

// Use contract methods
const gameId = await ethersContract.createGame();
await ethersContract.voteForDeposit(gameId, 2);
const details = await ethersContract.getGameDetails(gameId);
```

### Using Web3.js (Existing)
```javascript
// Existing Web3 integration still works
const web3Contract = new ContractInterface();
await web3Contract.init();
```

---

## 🌐 Base Network Details

**Current Network: Base Sepolia Testnet**
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

**For Production: Base Mainnet**
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- Explorer: https://basescan.org

Update `CURRENT_NETWORK` in `ethers-integration.js` when ready for mainnet.

---

## 📞 Support & Resources

- **Base Docs**: https://docs.base.org
- **Base Discord**: https://base.org/discord
- **Vercel Docs**: https://vercel.com/docs
- **Ethers.js Docs**: https://docs.ethers.org/v6/

---

## 🎉 Your App is Ready!

Your Click Surfers game is now:
- ✅ Integrated with Base Network via Ethers.js
- ✅ Configured for Vercel deployment
- ✅ Ready for Base.dev ecosystem registration
- ✅ Git repository created and pushed
- ✅ Production-ready configuration

**Next immediate action**: Deploy to Vercel!
