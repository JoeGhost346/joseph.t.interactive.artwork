// Blackjack Game
const blackjackGame = {
    currentBet: 10,
    deck: [],
    playerCards: [],
    dealerCards: [],
    playerScore: 0,
    dealerScore: 0,
    gameState: 'betting', // betting, playing, dealer, finished
    
    init() {
        this.resetGame();
        this.setupBetButtons();
        this.setupGameButtons();
    },
    
    resetGame() {
        this.playerCards = [];
        this.dealerCards = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.gameState = 'betting';
        this.updateDisplay();
        this.updateButtons();
    },
    
    setupBetButtons() {
        const betButtons = document.querySelectorAll('#blackjack-game .bet-btn');
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
    
    setupGameButtons() {
        const dealBtn = document.getElementById('deal-btn');
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        
        if (dealBtn) {
            dealBtn.addEventListener('click', () => this.deal());
        }
        if (hitBtn) {
            hitBtn.addEventListener('click', () => this.hit());
        }
        if (standBtn) {
            standBtn.addEventListener('click', () => this.stand());
        }
    },
    
    setActiveBetButton() {
        const betButtons = document.querySelectorAll('#blackjack-game .bet-btn');
        betButtons.forEach(btn => {
            if (parseInt(btn.dataset.bet) === this.currentBet) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    updateBetDisplay() {
        const betDisplay = document.getElementById('current-bet-bj');
        if (betDisplay) {
            betDisplay.textContent = this.currentBet;
        }
    },
    
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
            }
        }
        
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        return deck;
    },
    
    deal() {
        if (this.gameState !== 'betting') return;
        if (this.currentBet > gameManager.getBalance()) {
            this.showMessage('Insufficient balance!', 'error');
            return;
        }
        
        gameManager.deductBalance(this.currentBet);
        this.deck = this.createDeck();
        this.playerCards = [this.drawCard(), this.drawCard()];
        this.dealerCards = [this.drawCard(), this.drawCard()];
        this.gameState = 'playing';
        this.calculateScores();
        this.updateDisplay();
        this.updateButtons();
        this.showMessage('');
    },
    
    drawCard() {
        return this.deck.pop();
    },
    
    calculateScores() {
        this.playerScore = this.calculateHandValue(this.playerCards);
        this.dealerScore = this.calculateHandValue(this.dealerCards);
    },
    
    calculateHandValue(cards) {
        let value = 0;
        let aces = 0;
        
        for (let card of cards) {
            if (card.value === 'A') {
                aces++;
                value += 11;
            } else if (['J', 'Q', 'K'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }
        
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    },
    
    hit() {
        if (this.gameState !== 'playing') return;
        
        this.playerCards.push(this.drawCard());
        this.calculateScores();
        
        if (this.playerScore > 21) {
            this.gameState = 'finished';
            this.showMessage('Bust! You lose.', 'error');
            this.updateButtons();
        } else {
            this.updateDisplay();
        }
    },
    
    async stand() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'dealer';
        this.updateButtons();
        this.updateDisplay();
        
        // Dealer draws until 17 or higher
        while (this.dealerScore < 17) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.dealerCards.push(this.drawCard());
            this.calculateScores();
            this.updateDisplay();
        }
        
        this.gameState = 'finished';
        this.checkWinner();
        this.updateButtons();
    },
    
    checkWinner() {
        if (this.playerScore > 21) {
            this.showMessage('Bust! You lose.', 'error');
        } else if (this.dealerScore > 21) {
            const winAmount = this.currentBet * 2;
            gameManager.addBalance(winAmount);
            this.showMessage(`Dealer busts! You win $${winAmount}!`, 'win');
        } else if (this.playerScore > this.dealerScore) {
            const winAmount = this.currentBet * 2;
            gameManager.addBalance(winAmount);
            this.showMessage(`You win $${winAmount}!`, 'win');
        } else if (this.playerScore < this.dealerScore) {
            this.showMessage(`Dealer wins with ${this.dealerScore}.`, 'error');
        } else {
            gameManager.addBalance(this.currentBet);
            this.showMessage('Push! Bet returned.', 'info');
        }
    },
    
    updateDisplay() {
        this.updatePlayerCards();
        this.updateDealerCards();
        this.updateScores();
    },
    
    updatePlayerCards() {
        const playerCards = document.getElementById('player-cards');
        if (playerCards) {
            playerCards.innerHTML = this.playerCards.map(card => 
                this.createCardElement(card)
            ).join('');
        }
    },
    
    updateDealerCards() {
        const dealerCards = document.getElementById('dealer-cards');
        if (dealerCards) {
            if (this.gameState === 'betting' || this.gameState === 'playing') {
                // Show first card, hide second
                dealerCards.innerHTML = this.dealerCards.map((card, index) => 
                    index === 0 ? this.createCardElement(card) : '<div class="card" style="background: #34495e;">?</div>'
                ).join('');
            } else {
                dealerCards.innerHTML = this.dealerCards.map(card => 
                    this.createCardElement(card)
                ).join('');
            }
        }
    },
    
    createCardElement(card) {
        return `<div class="card ${card.color}">
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${card.suit}</div>
            <div class="card-value" style="transform: rotate(180deg);">${card.value}</div>
        </div>`;
    },
    
    updateScores() {
        const playerScore = document.getElementById('player-score');
        const dealerScore = document.getElementById('dealer-score');
        
        if (playerScore) {
            playerScore.textContent = `Score: ${this.playerScore}`;
        }
        
        if (dealerScore) {
            if (this.gameState === 'betting' || this.gameState === 'playing') {
                dealerScore.textContent = 'Score: ?';
            } else {
                dealerScore.textContent = `Score: ${this.dealerScore}`;
            }
        }
    },
    
    updateButtons() {
        const dealBtn = document.getElementById('deal-btn');
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        
        if (dealBtn) {
            dealBtn.disabled = this.gameState !== 'betting';
        }
        if (hitBtn) {
            hitBtn.disabled = this.gameState !== 'playing';
        }
        if (standBtn) {
            standBtn.disabled = this.gameState !== 'playing';
        }
    },
    
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('bj-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.color = type === 'error' ? '#e74c3c' : type === 'win' ? '#f1c40f' : 'white';
        }
    }
};
