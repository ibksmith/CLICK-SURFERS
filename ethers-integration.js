// Ethers.js Integration for Click Race Game on Base Network
// Optimized for Vercel deployment and Base Network interaction

import { ethers } from 'ethers';

// Base Network Configuration
const BASE_NETWORKS = {
    BASE_MAINNET: {
        chainId: 8453,
        name: 'Base',
        rpcUrl: 'https://mainnet.base.org',
        explorer: 'https://basescan.org'
    },
    BASE_SEPOLIA: {
        chainId: 84532,
        name: 'Base Sepolia',
        rpcUrl: 'https://sepolia.base.org',
        explorer: 'https://sepolia.basescan.org'
    }
};

// Default to Base Sepolia for testing
const CURRENT_NETWORK = BASE_NETWORKS.BASE_SEPOLIA;

// Contract Configuration
const CONTRACT_ADDRESS = '0x4453c351b1dfeff3f8379f441629a4b0e2d5c894';

// Contract ABI
const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "createGame",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}, {"type": "uint256"}],
        "name": "voteForDeposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}],
        "name": "endVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}],
        "name": "payDeposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}, {"type": "address"}],
        "name": "registerClick",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}],
        "name": "endGame",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}],
        "name": "distributePrizes",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}],
        "name": "getGameDetails",
        "outputs": [
            {"type": "uint256"},
            {"type": "uint256"},
            {"type": "uint256"},
            {"type": "bool"},
            {"type": "bool"},
            {"type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}, {"type": "address"}],
        "name": "getClickCount",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}, {"type": "uint256"}],
        "name": "getVotes",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256"}],
        "name": "getWinners",
        "outputs": [{"type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "gameId", "type": "uint256"},
            {"indexed": false, "name": "creator", "type": "address"}
        ],
        "name": "GameCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "gameId", "type": "uint256"},
            {"indexed": true, "name": "voter", "type": "address"},
            {"indexed": false, "name": "depositOption", "type": "uint256"}
        ],
        "name": "VoteCast",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "gameId", "type": "uint256"},
            {"indexed": true, "name": "contestant", "type": "address"},
            {"indexed": false, "name": "amount", "type": "uint256"}
        ],
        "name": "DepositPaid",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "gameId", "type": "uint256"},
            {"indexed": true, "name": "contestant", "type": "address"},
            {"indexed": false, "name": "clickCount", "type": "uint256"}
        ],
        "name": "ClickRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "gameId", "type": "uint256"},
            {"indexed": false, "name": "winners", "type": "address[]"}
        ],
        "name": "GameEnded",
        "type": "event"
    }
];

class EthersContractInterface {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.readOnlyContract = null;
        this.account = null;
    }

    // Initialize provider (read-only, no wallet needed)
    async initReadOnly() {
        try {
            // Create a read-only provider using Base RPC
            this.provider = new ethers.JsonRpcProvider(CURRENT_NETWORK.rpcUrl);
            
            // Create read-only contract instance
            this.readOnlyContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                this.provider
            );
            
            console.log('Read-only provider initialized for Base Network');
            return true;
        } catch (error) {
            console.error('Error initializing read-only provider:', error);
            return false;
        }
    }

    // Initialize with wallet (for transactions)
    async initWithWallet() {
        if (typeof window.ethereum === 'undefined') {
            console.error('MetaMask or Web3 wallet not detected');
            alert('Please install MetaMask or a Web3 wallet to use this application');
            return false;
        }

        try {
            // Switch to Base network first
            await this.switchToBaseNetwork();

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider from browser wallet
            this.provider = new ethers.BrowserProvider(window.ethereum);
            
            // Get signer
            this.signer = await this.provider.getSigner();
            this.account = await this.signer.getAddress();

            // Create contract instance with signer
            this.contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                this.signer
            );

            // Also keep read-only contract
            this.readOnlyContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                this.provider
            );

            console.log('Wallet connected on Base Network');
            console.log('Account:', this.account);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    console.log('Wallet disconnected');
                    this.account = null;
                } else {
                    this.account = accounts[0];
                    console.log('Account changed to:', this.account);
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            return true;
        } catch (error) {
            console.error('Error initializing wallet:', error);
            return false;
        }
    }

    // Switch to Base network
    async switchToBaseNetwork() {
        try {
            const chainIdHex = `0x${CURRENT_NETWORK.chainId.toString(16)}`;
            
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            
            console.log('Switched to Base network');
        } catch (switchError) {
            // Network not added, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
                            chainName: CURRENT_NETWORK.name,
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: [CURRENT_NETWORK.rpcUrl],
                            blockExplorerUrls: [CURRENT_NETWORK.explorer]
                        }],
                    });
                    console.log('Base network added to wallet');
                } catch (addError) {
                    console.error('Error adding Base network:', addError);
                    throw addError;
                }
            } else {
                console.error('Error switching to Base network:', switchError);
                throw switchError;
            }
        }
    }

    // Create a new game
    async createGame() {
        if (!this.contract) {
            throw new Error('Wallet not connected. Call initWithWallet() first.');
        }

        try {
            const tx = await this.contract.createGame();
            console.log('Transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Parse GameCreated event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed?.name === 'GameCreated';
                } catch {
                    return false;
                }
            });

            if (event) {
                const parsed = this.contract.interface.parseLog(event);
                const gameId = parsed.args.gameId;
                console.log('Game created with ID:', gameId.toString());
                return gameId.toString();
            }

            throw new Error('GameCreated event not found');
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    }

    // Vote for deposit amount
    async voteForDeposit(gameId, depositOptionIndex) {
        if (!this.contract) {
            throw new Error('Wallet not connected. Call initWithWallet() first.');
        }

        try {
            const tx = await this.contract.voteForDeposit(gameId, depositOptionIndex);
            await tx.wait();
            console.log('Vote cast successfully');
            return true;
        } catch (error) {
            console.error('Error voting:', error);
            throw error;
        }
    }

    // End voting period
    async endVoting(gameId) {
        if (!this.contract) {
            throw new Error('Wallet not connected. Call initWithWallet() first.');
        }

        try {
            const tx = await this.contract.endVoting(gameId);
            await tx.wait();
            console.log('Voting ended');
            return true;
        } catch (error) {
            console.error('Error ending voting:', error);
            throw error;
        }
    }

    // Pay deposit to join game
    async payDeposit(gameId, depositAmount) {
        if (!this.contract) {
            throw new Error('Wallet not connected. Call initWithWallet() first.');
        }

        try {
            const amountInWei = ethers.parseEther(depositAmount.toString());
            
            const tx = await this.contract.payDeposit(gameId, {
                value: amountInWei
            });
            
            await tx.wait();
            console.log('Deposit paid successfully');
            return true;
        } catch (error) {
            console.error('Error paying deposit:', error);
            throw error;
        }
    }

    // Register a click
    async registerClick(gameId, contestantAddress) {
        if (!this.contract) {
            throw new Error('Wallet not connected. Call initWithWallet() first.');
        }

        try {
            const tx = await this.contract.registerClick(gameId, contestantAddress);
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error registering click:', error);
            throw error;
        }
    }

    // End game
    async endGame(gameId) {
        if (!this.contract) {
            throw new Error('Wallet not connected. Call initWithWallet() first.');
        }

        try {
            const tx = await this.contract.endGame(gameId);
            await tx.wait();
            console.log('Game ended');
            return true;
        } catch (error) {
            console.error('Error ending game:', error);
            throw error;
        }
    }

    // Distribute prizes
    async distributePrizes(gameId) {
        if (!this.contract) {
            throw new Error('Wallet not connected. Call initWithWallet() first.');
        }

        try {
            const tx = await this.contract.distributePrizes(gameId);
            await tx.wait();
            console.log('Prizes distributed');
            return true;
        } catch (error) {
            console.error('Error distributing prizes:', error);
            throw error;
        }
    }

    // Get game details (read-only)
    async getGameDetails(gameId) {
        const contract = this.readOnlyContract || this.contract;
        if (!contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const details = await contract.getGameDetails(gameId);
            
            return {
                depositAmount: ethers.formatEther(details[0]),
                totalPool: ethers.formatEther(details[1]),
                contestantCount: details[2].toString(),
                votingEnded: details[3],
                gameEnded: details[4],
                prizesDistributed: details[5]
            };
        } catch (error) {
            console.error('Error getting game details:', error);
            throw error;
        }
    }

    // Get click count (read-only)
    async getClickCount(gameId, contestantAddress) {
        const contract = this.readOnlyContract || this.contract;
        if (!contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const count = await contract.getClickCount(gameId, contestantAddress);
            return count.toString();
        } catch (error) {
            console.error('Error getting click count:', error);
            throw error;
        }
    }

    // Get votes (read-only)
    async getVotes(gameId, depositOptionIndex) {
        const contract = this.readOnlyContract || this.contract;
        if (!contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const votes = await contract.getVotes(gameId, depositOptionIndex);
            return votes.toString();
        } catch (error) {
            console.error('Error getting votes:', error);
            throw error;
        }
    }

    // Get winners (read-only)
    async getWinners(gameId) {
        const contract = this.readOnlyContract || this.contract;
        if (!contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const winners = await contract.getWinners(gameId);
            return winners;
        } catch (error) {
            console.error('Error getting winners:', error);
            throw error;
        }
    }

    // Listen to contract events
    listenToEvents(gameId, callbacks = {}) {
        const contract = this.contract || this.readOnlyContract;
        if (!contract) {
            throw new Error('Contract not initialized');
        }

        // Listen for GameCreated
        if (callbacks.onGameCreated) {
            contract.on('GameCreated', (gId, creator, event) => {
                if (gId.toString() === gameId.toString()) {
                    callbacks.onGameCreated({ gameId: gId.toString(), creator, event });
                }
            });
        }

        // Listen for VoteCast
        if (callbacks.onVoteCast) {
            contract.on('VoteCast', (gId, voter, depositOption, event) => {
                if (gId.toString() === gameId.toString()) {
                    callbacks.onVoteCast({ 
                        gameId: gId.toString(), 
                        voter, 
                        depositOption: depositOption.toString(),
                        event 
                    });
                }
            });
        }

        // Listen for DepositPaid
        if (callbacks.onDepositPaid) {
            contract.on('DepositPaid', (gId, contestant, amount, event) => {
                if (gId.toString() === gameId.toString()) {
                    callbacks.onDepositPaid({ 
                        gameId: gId.toString(), 
                        contestant, 
                        amount: ethers.formatEther(amount),
                        event 
                    });
                }
            });
        }

        // Listen for ClickRegistered
        if (callbacks.onClickRegistered) {
            contract.on('ClickRegistered', (gId, contestant, clickCount, event) => {
                if (gId.toString() === gameId.toString()) {
                    callbacks.onClickRegistered({ 
                        gameId: gId.toString(), 
                        contestant, 
                        clickCount: clickCount.toString(),
                        event 
                    });
                }
            });
        }

        // Listen for GameEnded
        if (callbacks.onGameEnded) {
            contract.on('GameEnded', (gId, winners, event) => {
                if (gId.toString() === gameId.toString()) {
                    callbacks.onGameEnded({ 
                        gameId: gId.toString(), 
                        winners,
                        event 
                    });
                }
            });
        }
    }

    // Remove all event listeners
    removeAllListeners() {
        const contract = this.contract || this.readOnlyContract;
        if (contract) {
            contract.removeAllListeners();
        }
    }

    // Format address for display
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    // Get current network info
    getCurrentNetwork() {
        return CURRENT_NETWORK;
    }

    // Check if connected to correct network
    async isCorrectNetwork() {
        if (!this.provider) return false;
        
        try {
            const network = await this.provider.getNetwork();
            return Number(network.chainId) === CURRENT_NETWORK.chainId;
        } catch (error) {
            console.error('Error checking network:', error);
            return false;
        }
    }
}

// Export for use in main app
export default EthersContractInterface;

// Also create global instance for direct script usage
if (typeof window !== 'undefined') {
    window.EthersContractInterface = EthersContractInterface;
}
