// Roulette Game
const rouletteGame = {
    currentBet: 10,
    selectedBet: null,
    isSpinning: false,
    numbers: [
        { num: 0, color: 'green' },
        { num: 32, color: 'red' }, { num: 15, color: 'black' }, { num: 19, color: 'red' },
        { num: 4, color: 'black' }, { num: 21, color: 'red' }, { num: 2, color: 'black' },
        { num: 25, color: 'red' }, { num: 17, color: 'black' }, { num: 34, color: 'red' },
        { num: 6, color: 'black' }, { num: 27, color: 'red' }, { num: 13, color: 'black' },
        { num: 36, color: 'red' }, { num: 11, color: 'black' }, { num: 30, color: 'red' },
        { num: 8, color: 'black' }, { num: 23, color: 'red' }, { num: 10, color: 'black' },
        { num: 5, color: 'red' }, { num: 24, color: 'black' }, { num: 16, color: 'red' },
        { num: 33, color: 'black' }, { num: 1, color: 'red' }, { num: 20, color: 'black' },
        { num: 14, color: 'red' }, { num: 31, color: 'black' }, { num: 9, color: 'red' },
        { num: 22, color: 'black' }, { num: 18, color: 'red' }, { num: 29, color: 'black' },
        { num: 7, color: 'red' }, { num: 28, color: 'black' }, { num: 12, color: 'red' },
        { num: 35, color: 'black' }, { num: 3, color: 'red' }, { num: 26, color: 'black' }
    ],
    
    autoPlay: false,
    autoPlayInterval: null,
    
    init() {
        this.updateBetDisplay();
        this.setupBetButtons();
        this.setupBetOptions();
        this.setupSpinButton();
        this.setupAutoPlayToggle();
        this.startAutoPlay();
    },
    
    setupAutoPlayToggle() {
        const toggle = document.getElementById('auto-play-toggle-roulette');
        if (toggle) {
            toggle.addEventListener('click', () => {
                if (this.autoPlay) {
                    this.stopAutoPlay();
                    toggle.textContent = 'Auto-Play: OFF';
                    toggle.classList.remove('active');
                } else {
                    this.startAutoPlay();
                    toggle.textContent = 'Auto-Play: ON';
                    toggle.classList.add('active');
                }
            });
            toggle.classList.add('active');
        }
    },
    
    startAutoPlay() {
        this.autoPlay = true;
        this.autoPlayLoop();
    },
    
    stopAutoPlay() {
        this.autoPlay = false;
        if (this.autoPlayInterval) {
            clearTimeout(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    },
    
    async autoPlayLoop() {
        if (!this.autoPlay || gameManager.currentGame !== 'roulette') {
            this.stopAutoPlay();
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (gameManager.currentGame !== 'roulette') {
            this.stopAutoPlay();
            return;
        }
        
        // Auto-select a random bet if none selected
        if (!this.selectedBet) {
            const betOptions = document.querySelectorAll('#roulette-game .bet-option');
            if (betOptions.length > 0) {
                const randomOption = betOptions[Math.floor(Math.random() * betOptions.length)];
                randomOption.click();
            }
        }
        
        // Spin if we have a bet selected and balance
        if (this.selectedBet && this.currentBet <= gameManager.getBalance() && !this.isSpinning) {
            await this.spin();
            // Clear selection after spin completes
            await new Promise(resolve => setTimeout(resolve, 1000));
            const betOptions = document.querySelectorAll('#roulette-game .bet-option');
            betOptions.forEach(opt => opt.classList.remove('selected'));
            this.selectedBet = null;
        }
        
        if (this.autoPlay && gameManager.currentGame === 'roulette' && gameManager.getBalance() >= this.currentBet) {
            this.autoPlayInterval = setTimeout(() => this.autoPlayLoop(), 3000);
        } else {
            this.stopAutoPlay();
        }
    },
    
    setupBetButtons() {
        const betButtons = document.querySelectorAll('#roulette-game .bet-btn');
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
    
    setupBetOptions() {
        const betOptions = document.querySelectorAll('#roulette-game .bet-option');
        betOptions.forEach(option => {
            option.addEventListener('click', () => {
                if (!this.isSpinning) {
                    betOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedBet = option.dataset.bet;
            }
            });
        });
    },
    
    setupSpinButton() {
        const spinButton = document.getElementById('spin-roulette-btn');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spin());
        }
    },
    
    setActiveBetButton() {
        const betButtons = document.querySelectorAll('#roulette-game .bet-btn');
        betButtons.forEach(btn => {
            if (parseInt(btn.dataset.bet) === this.currentBet) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    updateBetDisplay() {
        const betDisplay = document.getElementById('current-bet-roulette');
        if (betDisplay) {
            betDisplay.textContent = this.currentBet;
        }
    },
    
    getRandomNumber() {
        return this.numbers[Math.floor(Math.random() * this.numbers.length)];
    },
    
    calculateWin(winningNumber) {
        if (!this.selectedBet) return 0;
        
        const num = winningNumber.num;
        const color = winningNumber.color;
        
        if (this.selectedBet === 'red' && color === 'red') {
            return this.currentBet * 2;
        } else if (this.selectedBet === 'black' && color === 'black') {
            return this.currentBet * 2;
        } else if (this.selectedBet === '0' && num === 0) {
            return this.currentBet * 36;
        } else if (this.selectedBet === '1-18' && num >= 1 && num <= 18) {
            return this.currentBet * 2;
        } else if (this.selectedBet === '19-36' && num >= 19 && num <= 36) {
            return this.currentBet * 2;
        }
        
        return 0;
    },
    
    async spin() {
        // Manual spin can always work
        if (this.isSpinning) return;
        
        if (!this.selectedBet) {
            this.showMessage('Please select a bet option!', 'error');
            return;
        }
        
        if (this.currentBet > gameManager.getBalance()) {
            this.showMessage('Insufficient balance!', 'error');
            return;
        }
        
        // Manual spin works even with auto-play
        this.isSpinning = true;
        const spinButton = document.getElementById('spin-roulette-btn');
        if (spinButton) {
            spinButton.disabled = true;
        }
        
        // Deduct bet
        gameManager.deductBalance(this.currentBet);
        
        // Clear previous messages
        const messageEl = document.getElementById('roulette-message');
        const resultEl = document.getElementById('roulette-result');
        if (messageEl) messageEl.textContent = '';
        if (resultEl) resultEl.textContent = '';
        
        // Animate wheel
        const wheel = document.getElementById('roulette-wheel');
        const ball = document.getElementById('roulette-ball');
        
        if (wheel && ball) {
            const spinDuration = 3000;
            const spinAngle = 360 * 5 + Math.random() * 360;
            
            wheel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
            wheel.style.transform = `rotate(${spinAngle}deg)`;
            
            // Generate winning number
            const winningNumber = this.getRandomNumber();
            
            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, spinDuration));
            
            // Calculate win
            const winAmount = this.calculateWin(winningNumber);
            
            if (winAmount > 0) {
                gameManager.addBalance(winAmount);
                this.showMessage(`🎉 You win! ${winningNumber.num} ${winningNumber.color}!`, 'win');
                if (resultEl) {
                    resultEl.textContent = `+$${winAmount.toLocaleString()}`;
                    resultEl.style.animation = 'pulse 0.5s ease-in-out';
                    setTimeout(() => {
                        resultEl.style.animation = '';
                    }, 500);
                }
            } else {
                this.showMessage(`Lose! Ball landed on ${winningNumber.num} ${winningNumber.color}`, 'error');
            }
            
            // Reset wheel
            wheel.style.transition = '';
            wheel.style.transform = 'rotate(0deg)';
            
            // Clear selection
            const betOptions = document.querySelectorAll('#roulette-game .bet-option');
            betOptions.forEach(opt => opt.classList.remove('selected'));
            this.selectedBet = null;
        }
        
        if (spinButton) {
            spinButton.disabled = false;
        }
        
        this.isSpinning = false;
    },
    
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('roulette-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.color = type === 'error' ? '#e74c3c' : type === 'win' ? '#f1c40f' : 'white';
        }
    }
};
