# 🏁 Click Race: Hover Boarders Mini App Game

A decentralized click race game on **Ethereum Base Network** where 10 contestants compete on hover boards by clicking as fast as they can. The game includes voting for deposit amounts, pooled deposits, and prize distribution to the top 5 winners.

## 🌐 Built for Base Network

This game is optimized for [Base](https://base.org), Coinbase's Ethereum L2 network, offering:
- ⚡ Fast transactions (2-second block times)
- 💰 Low gas fees (~$0.01 per transaction)
- 🔒 Ethereum-level security
- 🌉 Easy bridging from Ethereum mainnet

## 🎮 Game Features

### Game Flow
1. **Phase 1: Voting (20 seconds)**
   - Contestants vote on deposit amount ($0.5 - $5)
   - The value with most votes wins
   - Each player can only vote once

2. **Phase 2: Payment**
   - Contestants pay the winning deposit amount
   - Click "Pay Now" to join the game
   - Maximum 10 contestants per game
   - All deposits pooled into smart contract

3. **Phase 3: Click Race**
   - 10 contestants with hover boards compete
   - Click your hover board as fast as possible
   - Real-time progress tracking
   - Animated hover board effects

4. **Phase 4: Results & Prize Distribution**
   - Top 5 winners share the prize pool:
     - 🥇 1st Place: 35%
     - 🥈 2nd Place: 25%
     - 🥉 3rd Place: 15%
     - 4th Place: 10%
     - 5th Place: 5%
   - Platform Fee: 10%

## 📁 Project Structure

```
click-race-mini-app/
├── index.html              # Main HTML file
├── styles.css              # Styling and animations
├── app.js                  # Game logic and state management
├── contract-integration.js # Web3 blockchain integration
├── ClickRaceGame.sol       # Solidity smart contract
└── README.md              # This file
```

## 🚀 Quick Start

### Option 1: Run Locally (No Blockchain)

1. Simply open `index.html` in a web browser
2. The game will run in demo mode with simulated blockchain interactions

### Option 2: Full Blockchain Integration on Base Network

#### Prerequisites
- Node.js and npm installed
- MetaMask browser extension
- ETH on Base Sepolia testnet (get from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

#### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   
   Copy the environment template:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your private key:
   ```bash
   PRIVATE_KEY=your_private_key_here_without_0x
   BASESCAN_API_KEY=your_basescan_api_key  # Optional, for verification
   ```
   
   **⚠️ IMPORTANT:** Never commit your `.env` file!

3. **Get Test ETH on Base Sepolia**
   
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Connect your wallet
   - Request test ETH (you'll need some for deployment and gameplay)

4. **Deploy Smart Contract to Base Sepolia**
   
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```
   
   For Base Mainnet (production):
   ```bash
   npx hardhat run scripts/deploy.js --network base
   ```
   
   Save the contract address from the output!

5. **Update Contract Address**
   
   Edit `contract-integration.js` and update:
   ```javascript
   const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
   ```
   
   Optionally, change the target network (default is Base Sepolia):
   ```javascript
   const TARGET_NETWORK = NETWORKS.BASE_MAINNET; // or BASE_SEPOLIA
   ```

6. **Add Web3 Script to HTML**
   
   Add to `index.html` before closing `</body>`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
   <script src="contract-integration.js"></script>
   ```

7. **Serve the Application**
   ```bash
   npm start
   # Or manually:
   npx http-server -p 8000
   ```

8. **Connect MetaMask to Base**
   - MetaMask will automatically prompt to add Base network
   - Or manually add Base Sepolia:
     - Network Name: Base Sepolia
     - RPC URL: https://sepolia.base.org
     - Chain ID: 84532
     - Currency: ETH
     - Block Explorer: https://sepolia.basescan.org

9. **Start Playing!**
   - Open http://localhost:8000
   - Click "Connect Wallet"
   - MetaMask will switch to Base network automatically
   - Start a new game and have fun!

## 🌉 Base Network Information

### Base Mainnet
- **Chain ID:** 8453
- **RPC URL:** https://mainnet.base.org
- **Explorer:** https://basescan.org
- **Bridge:** https://bridge.base.org

### Base Sepolia Testnet (Recommended for Testing)
- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Explorer:** https://sepolia.basescan.org
- **Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Why Base?
- ⚡ **Fast:** 2-second block times
- 💸 **Cheap:** ~1 gwei gas price (~$0.01 per transaction)
- 🔒 **Secure:** Secured by Ethereum
- 🌍 **Accessible:** Easy onramp via Coinbase
- 🛠️ **Developer Friendly:** Full EVM compatibility

## 🎯 How to Play

1. **Connect Wallet**: Click the "Connect Wallet" button in the top-right
2. **Vote**: Select your preferred deposit amount ($0.5-$5) within 20 seconds
3. **Pay Deposit**: After voting ends, click "Pay Now" to join with the winning amount
4. **Play**: Click your hover board as fast as you can!
5. **Win Prizes**: Top 5 players share the prize pool

## 🛠️ Smart Contract Functions

### Main Functions
- `createGame()` - Platform creates a new game
- `voteForDeposit(gameId, depositOptionIndex)` - Vote for deposit amount
- `endVoting(gameId)` - End the voting period
- `payDeposit(gameId)` - Pay deposit to join game
- `registerClick(gameId, contestant)` - Register a click
- `endGame(gameId)` - End the game and determine winners
- `distributePrizes(gameId)` - Distribute prizes to winners

### View Functions
- `getGameDetails(gameId)` - Get game information
- `getClickCount(gameId, contestant)` - Get click count
- `getVotes(gameId, depositOptionIndex)` - Get vote count
- `getWinners(gameId)` - Get top 5 winners

## 🎨 Customization

### Modify Deposit Options
Edit the `depositOptions` array in `ClickRaceGame.sol`:
```solidity
uint256[] public depositOptions = [
    0.0005 ether,  // $0.5
    // Add or modify amounts
];
```

### Change Prize Distribution
Modify percentages in `distributePrizes()` function:
```solidity
percentages[0] = 35; // 1st place
percentages[1] = 25; // 2nd place
// etc.
```

### Adjust Voting Time
Change `VOTING_DURATION` in contract:
```solidity
uint256 constant VOTING_DURATION = 20; // seconds
```

## 🔒 Security Features

- Maximum 10 contestants per game
- One vote per address
- One deposit per address per game
- Automatic prize calculation and distribution
- Platform fee secured in contract
- No withdrawal until game ends and prizes distributed

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🐛 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed
- Check you're on the correct network
- Refresh the page and try again

### Transaction Failures
- Ensure sufficient ETH for gas fees
- Check you haven't already voted/deposited
- Verify game is in correct phase

### Game Not Starting
- Ensure voting period has ended
- Check that deposits have been paid
- Wait for all contestants to join

## 📄 License

MIT License - feel free to use and modify

## 🤝 Contributing

Contributions welcome! Please submit issues and pull requests.

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Have fun clicking and may the fastest hover boarder win! 🛹🏆**
