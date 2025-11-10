// Click Race Game - Main Application Logic

// Contract Configuration
const CONTRACT_ADDRESS = '0x4453c351b1dfeff3f8379f441629a4b0e2d5c894';
const CONTRACT_ABI = []; // Import from contract-integration.js

// Dark Mode Handler
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved user preference, otherwise check system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    });
}

// Game State
const gameState = {
    currentPhase: 'voting', // voting, payment, playing, results
    gameId: 1,
    votingTimeLeft: 20,
    votingTimer: null,
    raceTimeLeft: 900, // 15 minutes in seconds
    raceTimer: null,
    raceStartTime: null,
    selectedDeposit: null,
    votes: {},
    depositAmount: 0,
    contestants: [],
    clickCounts: {},
    distances: {}, // Distance covered in miles
    speeds: {}, // Current speed in mph
    lastClickTime: {}, // Track last click time for speed calculation
    userWallet: null,
    userContestantId: null,
    totalPool: 0,
    winners: [],
    TOTAL_DISTANCE: 100, // Point Nemo to Point Terminus: 100 miles
    finishedContestants: [] // Track who finished
};

// Deposit options
const depositOptions = [0.25, 0.5, 1, 3];

// Initialize votes
depositOptions.forEach(value => {
    gameState.votes[value] = 0;
});

// DOM Elements
const elements = {
    votingSection: document.getElementById('votingSection'),
    paymentSection: document.getElementById('paymentSection'),
    gameSection: document.getElementById('gameSection'),
    resultsSection: document.getElementById('resultsSection'),
    votingTimer: document.getElementById('votingTimer'),
    raceTimer: document.getElementById('raceTimer'),
    depositTabs: document.querySelectorAll('.deposit-tab'),
    voteDisplay: document.getElementById('voteDisplay'),
    payNowBtn: document.getElementById('payNowBtn'),
    winningDeposit: document.getElementById('winningDeposit'),
    endGameBtn: document.getElementById('endGameBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    connectWalletBtn: document.getElementById('connectWalletBtn'),
    walletStatus: document.getElementById('walletStatus'),
    gameId: document.getElementById('gameId'),
    totalPool: document.getElementById('totalPool'),
    contestantCount: document.getElementById('contestantCount'),
    contestants: document.querySelectorAll('.contestant')
};

// Initialize Game
function initGame() {
    console.log('Initializing Click Race Game...');
    updateGameInfo();
    startVotingPhase();
    setupEventListeners();
    renderVoteDisplay();
}

// Update Game Info Display
function updateGameInfo() {
    elements.gameId.textContent = gameState.gameId;
    elements.totalPool.textContent = `${gameState.totalPool.toFixed(4)} ETH`;
    elements.contestantCount.textContent = `${gameState.contestants.length}/5`;
}

// Phase 1: Voting
function startVotingPhase() {
    console.log('Starting voting phase...');
    gameState.currentPhase = 'voting';
    gameState.votingTimeLeft = 20;
    
    showSection(elements.votingSection);
    
    // Start countdown timer
    gameState.votingTimer = setInterval(() => {
        gameState.votingTimeLeft--;
        elements.votingTimer.textContent = `${gameState.votingTimeLeft}s`;
        
        if (gameState.votingTimeLeft <= 0) {
            clearInterval(gameState.votingTimer);
            endVoting();
        }
    }, 1000);
}

function handleVote(value) {
    if (gameState.currentPhase !== 'voting' || gameState.selectedDeposit !== null) {
        return;
    }
    
    gameState.selectedDeposit = value;
    gameState.votes[value]++;
    
    // Update UI
    elements.depositTabs.forEach(tab => {
        if (parseFloat(tab.dataset.value) === value) {
            tab.classList.add('selected');
        }
        tab.disabled = true;
    });
    
    renderVoteDisplay();
    console.log(`Voted for $${value}`);
}

function renderVoteDisplay() {
    const totalVotes = Object.values(gameState.votes).reduce((a, b) => a + b, 0);
    
    elements.voteDisplay.innerHTML = '';
    
    depositOptions.forEach(value => {
        const votes = gameState.votes[value];
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
        
        const barHTML = `
            <div class="vote-bar">
                <div class="vote-label">$${value}</div>
                <div class="vote-progress">
                    <div class="vote-fill" style="width: ${percentage}%">
                        ${votes} vote${votes !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        `;
        
        elements.voteDisplay.innerHTML += barHTML;
    });
}

function endVoting() {
    console.log('Voting ended');
    
    // Find winning deposit amount
    let maxVotes = 0;
    let winningDeposit = depositOptions[0];
    
    Object.entries(gameState.votes).forEach(([value, votes]) => {
        if (votes > maxVotes) {
            maxVotes = votes;
            winningDeposit = parseFloat(value);
        }
    });
    
    gameState.depositAmount = winningDeposit;
    
    // Move to payment phase
    startPaymentPhase();
}

// Phase 2: Payment
function startPaymentPhase() {
    console.log('Starting payment phase...');
    gameState.currentPhase = 'payment';
    
    elements.winningDeposit.textContent = `$${gameState.depositAmount}`;
    showSection(elements.paymentSection);
}

function handlePayNow() {
    if (gameState.contestants.length >= 10) {
        alert('Game is full! Maximum 10 contestants.');
        return;
    }
    
    // Simulate payment
    const depositInEth = gameState.depositAmount / 1000; // Convert to ETH (simplified)
    gameState.totalPool += depositInEth;
    
    // Add user as contestant
    const contestantId = gameState.contestants.length;
    gameState.contestants.push({
        id: contestantId,
        name: `Player ${contestantId + 1}`,
        address: gameState.userWallet || `0x${Math.random().toString(16).substr(2, 40)}`
    });
    
    gameState.userContestantId = contestantId;
    gameState.clickCounts[contestantId] = 0;
    
    updateGameInfo();
    
    alert(`Payment successful! You are Player ${contestantId + 1}`);
    
    // Auto-start game when we have contestants (or after timeout)
    if (gameState.contestants.length >= 3) {
        setTimeout(startGamePhase, 2000);
    }
}

// Phase 3: Playing
function startGamePhase() {
    console.log('Starting 15-minute race from Point Nemo to Point Terminus...');
    gameState.currentPhase = 'playing';
    gameState.raceTimeLeft = 900; // 15 minutes
    gameState.raceStartTime = Date.now();
    
    // Initialize all contestants
    for (let i = 0; i < 5; i++) {
        if (!gameState.contestants[i]) {
            gameState.contestants.push({
                id: i,
                name: `Player ${i + 1}`,
                address: `0x${Math.random().toString(16).substr(2, 40)}`
            });
        }
        gameState.clickCounts[i] = 0;
        gameState.distances[i] = 0;
        gameState.speeds[i] = 0;
        gameState.lastClickTime[i] = Date.now();
    }
    
    updateContestantDisplay();
    showSection(elements.gameSection);
    
    // Enable clicking for user's contestant
    if (gameState.userContestantId !== null) {
        const userContestant = elements.contestants[gameState.userContestantId];
        userContestant.classList.add('active');
    }
    
    // Start race timer (15 minutes)
    startRaceTimer();
    
    // Simulate other contestants clicking
    startAIContestants();
}

function startRaceTimer() {
    // Update timer display every second
    gameState.raceTimer = setInterval(() => {
        gameState.raceTimeLeft--;
        
        const minutes = Math.floor(gameState.raceTimeLeft / 60);
        const seconds = gameState.raceTimeLeft % 60;
        elements.raceTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (gameState.raceTimeLeft <= 0) {
            clearInterval(gameState.raceTimer);
            endGame();
        }
        
        // Update speeds based on time elapsed
        updateSpeeds();
    }, 1000);
}

function updateSpeeds() {
    const elapsedMinutes = (900 - gameState.raceTimeLeft) / 60;
    
    Object.keys(gameState.distances).forEach(id => {
        // Don't update speed for finished contestants
        if (gameState.finishedContestants.includes(parseInt(id))) {
            return;
        }
        
        if (elapsedMinutes > 0) {
            gameState.speeds[id] = (gameState.distances[id] / elapsedMinutes).toFixed(1);
        }
    });
}

function handleContestantClick(contestantId) {
    if (gameState.currentPhase !== 'playing') return;
    
    // Don't allow clicks if contestant already finished
    if (gameState.distances[contestantId] >= gameState.TOTAL_DISTANCE) {
        return;
    }
    
    const now = Date.now();
    const timeSinceLastClick = (now - gameState.lastClickTime[contestantId]) / 1000;
    
    gameState.clickCounts[contestantId]++;
    gameState.lastClickTime[contestantId] = now;
    
    // Each click adds distance based on click frequency
    // More frequent clicks = more speed = more distance
    const distancePerClick = timeSinceLastClick < 0.5 ? 0.5 : 0.3; // Reward fast clicking
    gameState.distances[contestantId] += distancePerClick;
    
    // Cap distance at 100 miles (Point Terminus)
    if (gameState.distances[contestantId] > gameState.TOTAL_DISTANCE) {
        gameState.distances[contestantId] = gameState.TOTAL_DISTANCE;
        
        // Mark as finished if not already
        if (!gameState.finishedContestants.includes(contestantId)) {
            gameState.finishedContestants.push(contestantId);
            
            // Freeze final speed when contestant finishes
            const elapsedMinutes = (900 - gameState.raceTimeLeft) / 60;
            if (elapsedMinutes > 0) {
                gameState.speeds[contestantId] = (gameState.TOTAL_DISTANCE / elapsedMinutes).toFixed(1);
            }
            
            console.log(`${gameState.contestants[contestantId].name} reached Point Terminus! Clicking disabled.`);
            
            // Disable clicking for this contestant
            const contestantElem = elements.contestants[contestantId];
            contestantElem.style.pointerEvents = 'none';
            contestantElem.style.cursor = 'not-allowed';
            contestantElem.style.opacity = '0.8';
            
            // Check if all contestants finished
            if (gameState.finishedContestants.length === gameState.contestants.length) {
                console.log('All contestants finished! Stopping timer and ending race...');
                // Stop the race timer immediately
                if (gameState.raceTimer) {
                    clearInterval(gameState.raceTimer);
                }
                setTimeout(() => endGame(), 1000); // Small delay for effect
            }
        }
    }
    
    updateContestantDisplay();
}

function updateContestantDisplay() {
    elements.contestants.forEach((elem, index) => {
        const clicks = gameState.clickCounts[index] || 0;
        const distance = gameState.distances[index] || 0;
        let speed = gameState.speeds[index] || 0;
        const percentage = (distance / gameState.TOTAL_DISTANCE) * 100;
        
        // Set speed to 0 for finished contestants
        if (gameState.finishedContestants.includes(index)) {
            speed = 0;
        }
        
        const nameElem = elem.querySelector('.contestant-name');
        const distanceElem = elem.querySelector('.distance-covered');
        const speedElem = elem.querySelector('.speed');
        const clickElem = elem.querySelector('.click-count');
        const hoverBoard = elem.querySelector('.hover-board');
        
        if (gameState.contestants[index]) {
            nameElem.textContent = gameState.contestants[index].name;
        }
        
        distanceElem.textContent = `${distance.toFixed(1)} mi`;
        speedElem.textContent = `${speed} mph`;
        clickElem.textContent = `${clicks} clicks`;
        
        // Move hover board based on distance
        const maxLeft = elem.querySelector('.race-lane').offsetWidth - 80; // Account for board width
        const leftPosition = (percentage / 100) * maxLeft;
        hoverBoard.style.left = `${leftPosition}px`;
        hoverBoard.setAttribute('data-position', percentage.toFixed(1));
        
        // Add moving animation when clicking
        if (speed > 0 && !gameState.finishedContestants.includes(index)) {
            hoverBoard.classList.add('moving');
        } else {
            hoverBoard.classList.remove('moving');
        }
        
        // Check if finished
        if (distance >= gameState.TOTAL_DISTANCE) {
            hoverBoard.style.left = `${maxLeft}px`;
            elem.style.background = 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
        }
    });
}

function startAIContestants() {
    // Simulate AI contestants clicking at varying rates
    const aiInterval = setInterval(() => {
        if (gameState.currentPhase !== 'playing') {
            clearInterval(aiInterval);
            return;
        }
        
        gameState.contestants.forEach((contestant, index) => {
            if (index !== gameState.userContestantId) {
                // Random clicks for AI - different speeds for different players
                const clickChance = Math.random();
                const aiSkillLevel = 0.3 + (index * 0.05); // Each AI has different skill
                
                if (clickChance < aiSkillLevel) {
                    handleContestantClick(index);
                }
            }
        });
        
        updateContestantDisplay();
    }, 200); // Check every 200ms for more realistic clicking
}

function endGame() {
    console.log('Ending game...');
    gameState.currentPhase = 'results';
    
    // Clear race timer
    if (gameState.raceTimer) {
        clearInterval(gameState.raceTimer);
    }
    
    // Calculate winners based on finish order first, then distance
    const finishedOrder = gameState.finishedContestants
        .map(id => ({
            ...gameState.contestants[id],
            distance: gameState.distances[id],
            clicks: gameState.clickCounts[id]
        }));

    const unfinished = gameState.contestants
        .filter(c => !gameState.finishedContestants.includes(c.id))
        .map(c => ({
            ...c,
            distance: gameState.distances[c.id],
            clicks: gameState.clickCounts[c.id]
        }))
        .sort((a, b) => b.distance - a.distance);

    const rankings = [...finishedOrder, ...unfinished];
    
    gameState.winners = rankings.slice(0, 5);
    
    startResultsPhase();
}

// Phase 4: Results
function startResultsPhase() {
    console.log('Showing results...');
    
    const percentages = [35, 25, 15, 10, 5];
    const platformFee = gameState.totalPool * 0.10;
    
    gameState.winners.forEach((winner, index) => {
        const prize = (gameState.totalPool * percentages[index]) / 100;
        
        const winnerNameElem = document.getElementById(`winner${index + 1}`);
        const prizeElem = document.getElementById(`prize${index + 1}`);
        const claimBtn = document.getElementById(`claimBtn${index + 1}`);
        
        if (winnerNameElem) {
            winnerNameElem.textContent = winner.name;
        }
        if (prizeElem) {
            prizeElem.textContent = `${percentages[index]}% (${prize.toFixed(4)} ETH)`;
        }
        
        // Show claim button only for the actual winner
        if (claimBtn && winner.id === gameState.userContestantId) {
            claimBtn.style.display = 'inline-block';
            claimBtn.onclick = () => claimPrize(index + 1, prize);
        }
    });
    
    showSection(elements.resultsSection);
}

function startNewGame() {
    // Reset game state
    gameState.gameId++;
    gameState.currentPhase = 'voting';
    gameState.votingTimeLeft = 20;
    gameState.raceTimeLeft = 900;
    gameState.raceStartTime = null;
    gameState.selectedDeposit = null;
    gameState.depositAmount = 0;
    gameState.contestants = [];
    gameState.clickCounts = {};
    gameState.distances = {};
    gameState.speeds = {};
    gameState.lastClickTime = {};
    gameState.userContestantId = null;
    gameState.totalPool = 0;
    gameState.winners = [];
    gameState.finishedContestants = [];
    
    // Clear timers
    if (gameState.votingTimer) clearInterval(gameState.votingTimer);
    if (gameState.raceTimer) clearInterval(gameState.raceTimer);
    
    // Reset votes
    depositOptions.forEach(value => {
        gameState.votes[value] = 0;
    });
    
    // Reset UI
    elements.depositTabs.forEach(tab => {
        tab.classList.remove('selected');
        tab.disabled = false;
    });
    
    // Reset contestant displays
    elements.contestants.forEach(elem => {
        const hoverBoard = elem.querySelector('.hover-board');
        if (hoverBoard) {
            hoverBoard.style.left = '0';
            hoverBoard.classList.remove('moving');
        }
        elem.style.background = '';
        elem.classList.remove('active');
        elem.style.pointerEvents = '';
        elem.style.cursor = '';
        elem.style.opacity = '';
    });
    
    // Hide all claim buttons
    for (let i = 1; i <= 5; i++) {
        const claimBtn = document.getElementById(`claimBtn${i}`);
        if (claimBtn) {
            claimBtn.style.display = 'none';
        }
    }
    
    updateGameInfo();
    startVotingPhase();
}

// Claim Prize Function
function claimPrize(position, amount) {
    const claimBtn = document.getElementById(`claimBtn${position}`);
    
    if (!claimBtn) return;
    
    // Disable button
    claimBtn.disabled = true;
    claimBtn.textContent = '⏳ Claiming...';
    
    // Contract interaction
    console.log(`Claiming prize for position ${position}: ${amount.toFixed(4)} ETH`);
    console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`Game ID: ${gameState.gameId}`);
    
    // In real implementation, call smart contract here
    // Example: await contract.distributePrizes(gameState.gameId);
    
    setTimeout(() => {
        claimBtn.textContent = '✅ Claimed!';
        claimBtn.style.background = 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)';
        alert(`Prize claimed successfully! ${amount.toFixed(4)} ETH sent to your wallet.\n\nContract: ${CONTRACT_ADDRESS}`);
    }, 2000);
}

// Wallet Connection (Simulated)
function connectWallet() {
    // In a real app, this would connect to MetaMask or similar
    if (!gameState.userWallet) {
        gameState.userWallet = `0x${Math.random().toString(16).substr(2, 40)}`;
        elements.walletStatus.textContent = `${gameState.userWallet.substr(0, 6)}...${gameState.userWallet.substr(-4)}`;
        alert('Wallet connected!');
    } else {
        alert('Wallet already connected!');
    }
}

// UI Helper
function showSection(section) {
    [elements.votingSection, elements.paymentSection, elements.gameSection, elements.resultsSection].forEach(s => {
        s.classList.add('hidden');
    });
    section.classList.remove('hidden');
}

// Event Listeners
function setupEventListeners() {
    // Voting tabs
    elements.depositTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const value = parseFloat(tab.dataset.value);
            handleVote(value);
        });
    });
    
    // Pay now button
    elements.payNowBtn.addEventListener('click', handlePayNow);
    
    // End game button
    elements.endGameBtn.addEventListener('click', endGame);
    
    // New game button
    elements.newGameBtn.addEventListener('click', startNewGame);
    
    // Connect wallet button
    elements.connectWalletBtn.addEventListener('click', connectWallet);
    
    // Contestant clicks
    elements.contestants.forEach((elem, index) => {
        elem.addEventListener('click', () => {
            if (index === gameState.userContestantId) {
                handleContestantClick(index);
            }
        });
    });
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    initGame();
});

// Export for potential contract integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        initGame,
        handleVote,
        handlePayNow,
        endGame
    };
}
