// Game state
let balance = 1000;
let currentBet = 10;
let isSpinning = false;

// Symbols for the slot machine
const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎'];

// Payout multipliers based on symbol rarity
const payouts = {
    '💎💎💎': 100,
    '⭐⭐⭐': 50,
    '🔔🔔🔔': 25,
    '🍇🍇🍇': 10,
    '🍊🍊🍊': 5,
    '🍋🍋🍋': 3,
    '🍒🍒🍒': 2
};

// DOM elements
const balanceDisplay = document.getElementById('balance');
const currentBetDisplay = document.getElementById('current-bet');
const spinButton = document.getElementById('spin-btn');
const winMessage = document.getElementById('win-message');
const payoutAmount = document.getElementById('payout-amount');
const betButtons = document.querySelectorAll('.bet-btn');
const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];

// Initialize game
function init() {
    updateBalance();
    updateBetDisplay();
    setActiveBetButton();
    
    // Set up bet buttons
    betButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const bet = parseInt(btn.dataset.bet);
            if (bet <= balance) {
                currentBet = bet;
                updateBetDisplay();
                setActiveBetButton();
            } else {
                showMessage('Insufficient balance!', 'error');
            }
        });
    });
    
    // Set up spin button
    spinButton.addEventListener('click', spin);
    
    // Initialize reels with random symbols
    reels.forEach(reel => {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        setReelSymbol(reel, randomSymbol);
    });
}

// Set active bet button
function setActiveBetButton() {
    betButtons.forEach(btn => {
        if (parseInt(btn.dataset.bet) === currentBet) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Update balance display
function updateBalance() {
    balanceDisplay.textContent = balance.toLocaleString();
}

// Update bet display
function updateBetDisplay() {
    currentBetDisplay.textContent = currentBet;
}

// Set reel symbol (for display)
function setReelSymbol(reel, symbol) {
    const symbolElement = reel.querySelector('.symbol');
    if (symbolElement) {
        symbolElement.textContent = symbol;
    }
}

// Spin animation
function animateReel(reel, duration, finalSymbol) {
    return new Promise((resolve) => {
        reel.classList.add('spinning');
        
        // Create spinning effect with random symbols
        const spinInterval = setInterval(() => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            setReelSymbol(reel, randomSymbol);
        }, 50);
        
        setTimeout(() => {
            clearInterval(spinInterval);
            setReelSymbol(reel, finalSymbol);
            reel.classList.remove('spinning');
            resolve();
        }, duration);
    });
}

// Get random symbol with weighted probabilities
function getRandomSymbol() {
    const weights = [0.25, 0.20, 0.15, 0.12, 0.10, 0.08, 0.10]; // Higher weight for common symbols
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < symbols.length; i++) {
        sum += weights[i];
        if (random <= sum) {
            return symbols[i];
        }
    }
    return symbols[0];
}

// Calculate win
function calculateWin(result) {
    const combination = result.join('');
    
    // Check for three of a kind
    if (result[0] === result[1] && result[1] === result[2]) {
        if (payouts[combination]) {
            return payouts[combination];
        }
    }
    
    return 0;
}

// Show message
function showMessage(message, type = 'info') {
    winMessage.textContent = message;
    winMessage.style.color = type === 'error' ? '#e74c3c' : type === 'win' ? '#f1c40f' : 'white';
    
    setTimeout(() => {
        if (winMessage.textContent === message) {
            winMessage.textContent = '';
        }
    }, 3000);
}

// Show payout
function showPayout(amount) {
    if (amount > 0) {
        payoutAmount.textContent = `+$${amount.toLocaleString()}`;
        payoutAmount.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            payoutAmount.style.animation = '';
        }, 500);
    } else {
        payoutAmount.textContent = '';
    }
}

// Main spin function
async function spin() {
    if (isSpinning) return;
    
    if (currentBet > balance) {
        showMessage('Insufficient balance!', 'error');
        return;
    }
    
    if (currentBet <= 0) {
        showMessage('Please place a bet!', 'error');
        return;
    }
    
    isSpinning = true;
    spinButton.disabled = true;
    
    // Deduct bet
    balance -= currentBet;
    updateBalance();
    
    // Clear previous messages
    winMessage.textContent = '';
    payoutAmount.textContent = '';
    
    // Generate results
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Spin each reel with different durations for cascading effect
    const spinDurations = [1000, 1200, 1400];
    const spinPromises = reels.map((reel, index) => 
        animateReel(reel, spinDurations[index], results[index])
    );
    
    await Promise.all(spinPromises);
    
    // Calculate win
    const multiplier = calculateWin(results);
    const winAmount = multiplier > 0 ? currentBet * multiplier : 0;
    
    if (winAmount > 0) {
        balance += winAmount;
        showMessage('🎉 YOU WIN! 🎉', 'win');
        showPayout(winAmount);
    } else {
        showMessage('No match. Try again!', 'info');
    }
    
    updateBalance();
    
    // Check if game over
    if (balance <= 0) {
        showMessage('Game Over! Refresh to play again.', 'error');
        spinButton.disabled = true;
    } else {
        spinButton.disabled = false;
    }
    
    isSpinning = false;
}

// Add pulse animation for payouts
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
init();
