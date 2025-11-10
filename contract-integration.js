// Web3 Contract Integration for Click Race Game
// Optimized for Ethereum Base Network
// This file handles blockchain interactions with the ClickRaceGame smart contract

// Base Network Configuration
const NETWORKS = {
    BASE_MAINNET: {
        chainId: '0x2105', // 8453
        chainName: 'Base',
        nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org']
    },
    BASE_SEPOLIA: {
        chainId: '0x14a34', // 84532
        chainName: 'Base Sepolia',
        nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia.basescan.org']
    },
    BASE_GOERLI: {
        chainId: '0x14a33', // 84531
        chainName: 'Base Goerli',
        nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://goerli.base.org'],
        blockExplorerUrls: ['https://goerli.basescan.org']
    }
};

// Default to Base Sepolia for testing
const TARGET_NETWORK = NETWORKS.BASE_SEPOLIA;

// Contract ABI (Application Binary Interface)
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
    }
];

// Contract address (update after deployment to Base network)
const CONTRACT_ADDRESS = '0x4453c351b1dfeff3f8379f441629a4b0e2d5c894'; // Click Race Game Contract on Base

class ContractInterface {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.account = null;
    }

    // Initialize Web3 and connect to MetaMask on Base Network
    async init() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Check if already on Base network, if not, switch
                await this.switchToBaseNetwork();
                
                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                // Create Web3 instance
                this.web3 = new Web3(window.ethereum);
                
                // Get user account
                const accounts = await this.web3.eth.getAccounts();
                this.account = accounts[0];
                
                // Initialize contract
                this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                
                console.log('Web3 initialized on Base Network');
                console.log('Account:', this.account);
                return true;
            } catch (error) {
                console.error('Error initializing Web3:', error);
                return false;
            }
        } else {
            console.error('MetaMask not detected');
            alert('Please install MetaMask to use this application');
            return false;
        }
    }

    // Switch to Base network
    async switchToBaseNetwork() {
        try {
            // Try to switch to Base network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TARGET_NETWORK.chainId }],
            });
            console.log('Switched to Base network');
        } catch (switchError) {
            // Network not added to MetaMask, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [TARGET_NETWORK],
                    });
                    console.log('Base network added to MetaMask');
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
        try {
            const result = await this.contract.methods.createGame().send({
                from: this.account
            });
            
            const gameId = result.events.GameCreated.returnValues.gameId;
            console.log('Game created with ID:', gameId);
            return gameId;
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    }

    // Vote for deposit amount
    async voteForDeposit(gameId, depositOptionIndex) {
        try {
            await this.contract.methods.voteForDeposit(gameId, depositOptionIndex).send({
                from: this.account
            });
            
            console.log('Vote cast successfully');
            return true;
        } catch (error) {
            console.error('Error voting:', error);
            throw error;
        }
    }

    // End voting period
    async endVoting(gameId) {
        try {
            await this.contract.methods.endVoting(gameId).send({
                from: this.account
            });
            
            console.log('Voting ended');
            return true;
        } catch (error) {
            console.error('Error ending voting:', error);
            throw error;
        }
    }

    // Pay deposit to join game
    async payDeposit(gameId, depositAmount) {
        try {
            const amountInWei = this.web3.utils.toWei(depositAmount.toString(), 'ether');
            
            await this.contract.methods.payDeposit(gameId).send({
                from: this.account,
                value: amountInWei
            });
            
            console.log('Deposit paid successfully');
            return true;
        } catch (error) {
            console.error('Error paying deposit:', error);
            throw error;
        }
    }

    // Register a click
    async registerClick(gameId, contestantAddress) {
        try {
            await this.contract.methods.registerClick(gameId, contestantAddress).send({
                from: this.account
            });
            
            return true;
        } catch (error) {
            console.error('Error registering click:', error);
            throw error;
        }
    }

    // End game
    async endGame(gameId) {
        try {
            await this.contract.methods.endGame(gameId).send({
                from: this.account
            });
            
            console.log('Game ended');
            return true;
        } catch (error) {
            console.error('Error ending game:', error);
            throw error;
        }
    }

    // Distribute prizes
    async distributePrizes(gameId) {
        try {
            await this.contract.methods.distributePrizes(gameId).send({
                from: this.account
            });
            
            console.log('Prizes distributed');
            return true;
        } catch (error) {
            console.error('Error distributing prizes:', error);
            throw error;
        }
    }

    // Get game details
    async getGameDetails(gameId) {
        try {
            const details = await this.contract.methods.getGameDetails(gameId).call();
            
            return {
                depositAmount: this.web3.utils.fromWei(details[0], 'ether'),
                totalPool: this.web3.utils.fromWei(details[1], 'ether'),
                contestantCount: details[2],
                votingEnded: details[3],
                gameEnded: details[4],
                prizesDistributed: details[5]
            };
        } catch (error) {
            console.error('Error getting game details:', error);
            throw error;
        }
    }

    // Get click count for a contestant
    async getClickCount(gameId, contestantAddress) {
        try {
            const count = await this.contract.methods.getClickCount(gameId, contestantAddress).call();
            return parseInt(count);
        } catch (error) {
            console.error('Error getting click count:', error);
            throw error;
        }
    }

    // Get votes for a deposit option
    async getVotes(gameId, depositOptionIndex) {
        try {
            const votes = await this.contract.methods.getVotes(gameId, depositOptionIndex).call();
            return parseInt(votes);
        } catch (error) {
            console.error('Error getting votes:', error);
            throw error;
        }
    }

    // Get game winners
    async getWinners(gameId) {
        try {
            const winners = await this.contract.methods.getWinners(gameId).call();
            return winners;
        } catch (error) {
            console.error('Error getting winners:', error);
            throw error;
        }
    }

    // Listen to contract events
    listenToEvents(gameId) {
        // Listen for vote events
        this.contract.events.VoteCast({
            filter: { gameId: gameId }
        })
        .on('data', (event) => {
            console.log('Vote cast:', event.returnValues);
        })
        .on('error', console.error);

        // Listen for deposit events
        this.contract.events.DepositPaid({
            filter: { gameId: gameId }
        })
        .on('data', (event) => {
            console.log('Deposit paid:', event.returnValues);
        })
        .on('error', console.error);

        // Listen for click events
        this.contract.events.ClickRegistered({
            filter: { gameId: gameId }
        })
        .on('data', (event) => {
            console.log('Click registered:', event.returnValues);
        })
        .on('error', console.error);

        // Listen for game end events
        this.contract.events.GameEnded({
            filter: { gameId: gameId }
        })
        .on('data', (event) => {
            console.log('Game ended:', event.returnValues);
        })
        .on('error', console.error);
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContractInterface;
}
