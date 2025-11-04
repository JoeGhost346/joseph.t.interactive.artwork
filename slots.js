// Slot Machine Game
const slotsGame = {
    currentBet: 10,
    isSpinning: false,
    symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎'],
    payouts: {
        '💎💎💎': 100,
        '⭐⭐⭐': 50,
        '🔔🔔🔔': 25,
        '🍇🍇🍇': 10,
        '🍊🍊🍊': 5,
        '🍋🍋🍋': 3,
        '🍒🍒🍒': 2
    },
    
    init() {
        this.updateBetDisplay();
        this.setupBetButtons();
        this.setupSpinButton();
        this.initializeReels();
    },
    
    setupBetButtons() {
        const betButtons = document.querySelectorAll('#slots-game .bet-btn');
        betButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const bet = parseInt(btn.dataset.bet);
                if (bet <= gameManager.getBalance()) {
                    this.currentBet = bet;
                    this.updateBetDisplay();
                    this.setActiveBetButton();
                } else {
                    this.showMessage('Insufficient balance!', 'error');
                }
            });
        });
    },
    
    setupSpinButton() {
        const spinButton = document.getElementById('spin-btn');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spin());
        }
    },
    
    setActiveBetButton() {
        const betButtons = document.querySelectorAll('#slots-game .bet-btn');
        betButtons.forEach(btn => {
            if (parseInt(btn.dataset.bet) === this.currentBet) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    updateBetDisplay() {
        const betDisplay = document.getElementById('current-bet');
        if (betDisplay) {
            betDisplay.textContent = this.currentBet;
        }
    },
    
    initializeReels() {
        const reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        
        reels.forEach(reel => {
            if (reel) {
                const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                this.setReelSymbol(reel, randomSymbol);
            }
        });
    },
    
    setReelSymbol(reel, symbol) {
        const symbolElement = reel?.querySelector('.symbol');
        if (symbolElement) {
            symbolElement.textContent = symbol;
        }
    },
    
    animateReel(reel, duration, finalSymbol) {
        return new Promise((resolve) => {
            reel.classList.add('spinning');
            
            const spinInterval = setInterval(() => {
                const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                this.setReelSymbol(reel, randomSymbol);
            }, 50);
            
            setTimeout(() => {
                clearInterval(spinInterval);
                this.setReelSymbol(reel, finalSymbol);
                reel.classList.remove('spinning');
                resolve();
            }, duration);
        });
    },
    
    getRandomSymbol() {
        const weights = [0.25, 0.20, 0.15, 0.12, 0.10, 0.08, 0.10];
        const random = Math.random();
        let sum = 0;
        
        for (let i = 0; i < this.symbols.length; i++) {
            sum += weights[i];
            if (random <= sum) {
                return this.symbols[i];
            }
        }
        return this.symbols[0];
    },
    
    calculateWin(result) {
        const combination = result.join('');
        
        if (result[0] === result[1] && result[1] === result[2]) {
            if (this.payouts[combination]) {
                return this.payouts[combination];
            }
        }
        
        return 0;
    },
    
    showMessage(message, type = 'info') {
        const winMessage = document.getElementById('win-message');
        if (winMessage) {
            winMessage.textContent = message;
            winMessage.style.color = type === 'error' ? '#e74c3c' : type === 'win' ? '#f1c40f' : 'white';
            
            setTimeout(() => {
                if (winMessage.textContent === message) {
                    winMessage.textContent = '';
                }
            }, 3000);
        }
    },
    
    showPayout(amount) {
        const payoutAmount = document.getElementById('payout-amount');
        if (payoutAmount) {
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
    },
    
    async spin() {
        if (this.isSpinning) return;
        
        if (this.currentBet > gameManager.getBalance()) {
            this.showMessage('Insufficient balance!', 'error');
            return;
        }
        
        if (this.currentBet <= 0) {
            this.showMessage('Please place a bet!', 'error');
            return;
        }
        
        this.isSpinning = true;
        const spinButton = document.getElementById('spin-btn');
        if (spinButton) {
            spinButton.disabled = true;
        }
        
        // Deduct bet
        gameManager.deductBalance(this.currentBet);
        
        // Clear previous messages
        const winMessage = document.getElementById('win-message');
        const payoutAmount = document.getElementById('payout-amount');
        if (winMessage) winMessage.textContent = '';
        if (payoutAmount) payoutAmount.textContent = '';
        
        // Generate results
        const results = [
            this.getRandomSymbol(),
            this.getRandomSymbol(),
            this.getRandomSymbol()
        ];
        
        // Spin reels
        const reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        
        const spinDurations = [1000, 1200, 1400];
        const spinPromises = reels.map((reel, index) => 
            this.animateReel(reel, spinDurations[index], results[index])
        );
        
        await Promise.all(spinPromises);
        
        // Calculate win
        const multiplier = this.calculateWin(results);
        const winAmount = multiplier > 0 ? this.currentBet * multiplier : 0;
        
        if (winAmount > 0) {
            gameManager.addBalance(winAmount);
            this.showMessage('🎉 YOU WIN! 🎉', 'win');
            this.showPayout(winAmount);
        } else {
            this.showMessage('No match. Try again!', 'info');
        }
        
        // Check if game over
        if (gameManager.getBalance() <= 0) {
            this.showMessage('Game Over! Return to lobby.', 'error');
            if (spinButton) spinButton.disabled = true;
        } else {
            if (spinButton) spinButton.disabled = false;
        }
        
        this.isSpinning = false;
    }
};

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(style);
