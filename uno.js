// Uno Game
const unoGame = {
    deck: [],
    playerHand: [],
    opponentHand: [],
    discardPile: [],
    drawPile: [],
    currentColor: null,
    currentValue: null,
    playerTurn: true,
    gameState: 'playing', // playing, waiting, gameOver
    
    colors: ['red', 'blue', 'green', 'yellow'],
    values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'],
    specialCards: ['wild', 'wild4'],
    
    autoPlay: false,
    autoPlayInterval: null,
    
    init() {
        this.setupGame();
        this.setupButtons();
        this.updateDisplay();
        this.startAutoPlay();
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
        if (!this.autoPlay || gameManager.currentGame !== 'uno') {
            this.stopAutoPlay();
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (gameManager.currentGame !== 'uno') {
            this.stopAutoPlay();
            return;
        }
        
        // Check if color selector is showing (for wild cards)
        const colorSelector = document.getElementById('color-selector');
        if (colorSelector && colorSelector.style.display !== 'none') {
            // Auto-select a random color for wild cards
            const colorBtns = document.querySelectorAll('.color-btn');
            if (colorBtns.length > 0) {
                const randomColor = colorBtns[Math.floor(Math.random() * colorBtns.length)];
                randomColor.click();
            }
            return;
        }
        
        if (this.gameState === 'playing' && this.playerTurn) {
            // Find first playable card
            let playableIndex = -1;
            for (let i = 0; i < this.playerHand.length; i++) {
                if (this.canPlayCard(this.playerHand[i])) {
                    playableIndex = i;
                    break;
                }
            }
            
            if (playableIndex >= 0) {
                // Play the card
                this.playCard(playableIndex);
            } else {
                // Draw a card
                this.drawCard();
            }
        }
        
        if (this.autoPlay && gameManager.currentGame === 'uno' && this.gameState !== 'gameOver') {
            this.autoPlayInterval = setTimeout(() => this.autoPlayLoop(), 2500);
        } else {
            this.stopAutoPlay();
        }
    },
    
    setupGame() {
        // Create deck
        this.deck = [];
        
        // Number cards (0-9) for each color
        this.colors.forEach(color => {
            // One 0 card per color
            this.deck.push({ color, value: '0', type: 'number' });
            
            // Two of each 1-9 per color
            for (let i = 1; i <= 9; i++) {
                this.deck.push({ color, value: i.toString(), type: 'number' });
                this.deck.push({ color, value: i.toString(), type: 'number' });
            }
            
            // Action cards (2 of each per color)
            this.deck.push({ color, value: 'skip', type: 'action' });
            this.deck.push({ color, value: 'skip', type: 'action' });
            this.deck.push({ color, value: 'reverse', type: 'action' });
            this.deck.push({ color, value: 'reverse', type: 'action' });
            this.deck.push({ color, value: 'draw2', type: 'action' });
            this.deck.push({ color, value: 'draw2', type: 'action' });
        });
        
        // Wild cards (4 of each)
        for (let i = 0; i < 4; i++) {
            this.deck.push({ color: 'wild', value: 'wild', type: 'wild' });
            this.deck.push({ color: 'wild', value: 'wild4', type: 'wild' });
        }
        
        // Shuffle deck
        this.shuffleDeck();
        
        // Deal 7 cards to each player
        this.playerHand = [];
        this.opponentHand = [];
        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.deck.pop());
            this.opponentHand.push(this.deck.pop());
        }
        
        // Draw first card to discard pile
        let firstCard = this.deck.pop();
        while (firstCard.type === 'wild') {
            this.deck.unshift(firstCard);
            firstCard = this.deck.pop();
        }
        this.discardPile.push(firstCard);
        this.currentColor = firstCard.color;
        this.currentValue = firstCard.value;
        
        // Rest is draw pile
        this.drawPile = [...this.deck];
        this.deck = [];
        
        this.playerTurn = true;
        this.gameState = 'playing';
    },
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    },
    
    setupButtons() {
        const drawBtn = document.getElementById('draw-card-btn');
        if (drawBtn) {
            drawBtn.addEventListener('click', () => this.drawCard());
        }
        
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                this.selectWildColor(color);
            });
        });
    },
    
    canPlayCard(card) {
        if (!this.currentColor || !this.currentValue) return false;
        
        // Wild cards can always be played
        if (card.type === 'wild') return true;
        
        // Match color or value
        return card.color === this.currentColor || card.value === this.currentValue;
    },
    
    playCard(cardIndex) {
        if (!this.playerTurn || this.gameState !== 'playing') return;
        
        const card = this.playerHand[cardIndex];
        if (!card) return;
        
        if (!this.canPlayCard(card)) {
            this.showMessage('Cannot play this card!', 'error');
            return;
        }
        
        // Remove card from hand
        this.playerHand.splice(cardIndex, 1);
        
        // Handle wild cards
        if (card.type === 'wild') {
            if (card.value === 'wild4') {
                // Draw 4 for opponent
                for (let i = 0; i < 4; i++) {
                    if (this.drawPile.length > 0) {
                        this.opponentHand.push(this.drawPile.pop());
                    }
                }
            }
            // Show color selector
            this.showColorSelector();
            return;
        }
        
        // Play card
        this.discardPile.push(card);
        this.currentColor = card.color;
        this.currentValue = card.value;
        
        // Handle action cards
        this.handleActionCard(card);
        
        // Check win
        if (this.playerHand.length === 0) {
            this.endGame('You win!', 'win');
            gameManager.addBalance(50);
            return;
        }
        
        // Switch turn
        this.playerTurn = false;
        this.updateDisplay();
        
        // Opponent's turn
        setTimeout(() => this.opponentTurn(), 1000);
    },
    
    selectWildColor(color) {
        const lastCard = this.discardPile[this.discardPile.length - 1];
        lastCard.color = color;
        this.currentColor = color;
        
        this.hideColorSelector();
        this.playerTurn = false;
        this.updateDisplay();
        
        // Opponent's turn
        setTimeout(() => this.opponentTurn(), 1000);
    },
    
    handleActionCard(card) {
        if (card.value === 'skip') {
            this.showMessage('Opponent skipped!', 'info');
        } else if (card.value === 'reverse') {
            // In 2-player, reverse acts like skip
            this.showMessage('Turn reversed (acts as skip)!', 'info');
        } else if (card.value === 'draw2') {
            // Opponent draws 2
            for (let i = 0; i < 2; i++) {
                if (this.drawPile.length > 0) {
                    this.opponentHand.push(this.drawPile.pop());
                }
            }
            this.showMessage('Opponent draws 2 cards!', 'info');
        }
    },
    
    drawCard() {
        if (!this.playerTurn || this.gameState !== 'playing') return;
        
        if (this.drawPile.length === 0) {
            // Reshuffle discard pile (except last card)
            const lastCard = this.discardPile.pop();
            this.drawPile = [...this.discardPile];
            this.shuffleDeck();
            this.discardPile = [lastCard];
        }
        
        const card = this.drawPile.pop();
        this.playerHand.push(card);
        
        this.playerTurn = false;
        this.updateDisplay();
        this.showMessage('Card drawn. Opponent\'s turn.', 'info');
        
        // Opponent's turn
        setTimeout(() => this.opponentTurn(), 1000);
    },
    
    opponentTurn() {
        if (this.gameState !== 'playing') return;
        
        // Find playable card
        let playableIndex = -1;
        for (let i = 0; i < this.opponentHand.length; i++) {
            if (this.canPlayCard(this.opponentHand[i])) {
                playableIndex = i;
                break;
            }
        }
        
        if (playableIndex >= 0) {
            // Play card
            const card = this.opponentHand.splice(playableIndex, 1)[0];
            this.discardPile.push(card);
            
            // Handle wild cards
            if (card.type === 'wild') {
                // Random color
                const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                card.color = randomColor;
                if (card.value === 'wild4') {
                    // Draw 4 for player
                    for (let i = 0; i < 4; i++) {
                        if (this.drawPile.length > 0) {
                            this.playerHand.push(this.drawPile.pop());
                        }
                    }
                }
            }
            
            this.currentColor = card.color;
            this.currentValue = card.value;
            
            // Handle action cards
            this.handleActionCard(card);
            
            // Check win
            if (this.opponentHand.length === 0) {
                this.endGame('Opponent wins!', 'error');
                return;
            }
            
            this.showMessage(`Opponent played ${this.getCardDisplay(card)}`, 'info');
        } else {
            // Draw card
            if (this.drawPile.length === 0) {
                const lastCard = this.discardPile.pop();
                this.drawPile = [...this.discardPile];
                this.shuffleDeck();
                this.discardPile = [lastCard];
            }
            
            const card = this.drawPile.pop();
            this.opponentHand.push(card);
            this.showMessage('Opponent drew a card', 'info');
        }
        
        this.playerTurn = true;
        this.updateDisplay();
    },
    
    getCardDisplay(card) {
        if (card.type === 'wild') {
            return card.value === 'wild4' ? 'Wild Draw 4' : 'Wild';
        }
        const colorName = card.color.charAt(0).toUpperCase() + card.color.slice(1);
        if (card.type === 'action') {
            return `${colorName} ${card.value}`;
        }
        return `${colorName} ${card.value}`;
    },
    
    getCardEmoji(card) {
        const colorEmojis = {
            'red': '🔴',
            'blue': '🔵',
            'green': '🟢',
            'yellow': '🟡',
            'wild': '⚫'
        };
        
        if (card.type === 'wild') {
            return card.value === 'wild4' ? '🃏' : '🃏';
        }
        
        return colorEmojis[card.color] || '🂠';
    },
    
    updateDisplay() {
        this.updatePlayerHand();
        this.updateOpponentHand();
        this.updateDiscardPile();
        this.updateDrawPile();
        this.updateControls();
    },
    
    updatePlayerHand() {
        const playerHand = document.getElementById('player-hand');
        const playerCount = document.getElementById('player-count');
        
        if (playerHand) {
            playerHand.innerHTML = this.playerHand.map((card, index) => {
                const canPlay = this.canPlayCard(card);
                return `<div class="uno-card ${canPlay && this.playerTurn ? 'playable' : ''} ${card.color}" 
                            onclick="unoGame.playCard(${index})" 
                            data-card-index="${index}">
                        <div class="card-emoji">${this.getCardEmoji(card)}</div>
                        <div class="card-value">${card.value}</div>
                    </div>`;
            }).join('');
        }
        
        if (playerCount) {
            playerCount.textContent = this.playerHand.length;
        }
    },
    
    updateOpponentHand() {
        const opponentHand = document.getElementById('opponent-hand');
        const opponentCount = document.getElementById('opponent-count');
        
        if (opponentHand) {
            opponentHand.innerHTML = `<div class="opponent-cards">
                ${'🂠'.repeat(Math.min(this.opponentHand.length, 7))}
            </div>`;
        }
        
        if (opponentCount) {
            opponentCount.textContent = this.opponentHand.length;
        }
    },
    
    updateDiscardPile() {
        const discardPile = document.getElementById('discard-pile');
        const currentColor = document.getElementById('current-color');
        
        if (discardPile && this.discardPile.length > 0) {
            const topCard = this.discardPile[this.discardPile.length - 1];
            discardPile.innerHTML = `<div class="uno-card ${topCard.color}">
                <div class="card-emoji">${this.getCardEmoji(topCard)}</div>
                <div class="card-value">${topCard.value}</div>
            </div>`;
        }
        
        if (currentColor && this.currentColor) {
            const colorEmojis = {
                'red': '🔴',
                'blue': '🔵',
                'green': '🟢',
                'yellow': '🟡'
            };
            currentColor.innerHTML = `Current Color: ${colorEmojis[this.currentColor] || ''}`;
        }
    },
    
    updateDrawPile() {
        const drawPile = document.getElementById('draw-pile');
        if (drawPile) {
            const count = this.drawPile.length;
            drawPile.innerHTML = `<div class="card-back">🂠</div><div class="pile-count">${count}</div>`;
        }
    },
    
    updateControls() {
        const drawBtn = document.getElementById('draw-card-btn');
        if (drawBtn) {
            drawBtn.disabled = !this.playerTurn || this.gameState !== 'playing';
        }
    },
    
    showColorSelector() {
        const colorSelector = document.getElementById('color-selector');
        if (colorSelector) {
            colorSelector.style.display = 'block';
        }
    },
    
    hideColorSelector() {
        const colorSelector = document.getElementById('color-selector');
        if (colorSelector) {
            colorSelector.style.display = 'none';
        }
    },
    
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('uno-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.color = type === 'error' ? '#e74c3c' : type === 'win' ? '#f1c40f' : 'white';
        }
    },
    
    endGame(message, type) {
        this.gameState = 'gameOver';
        this.showMessage(message, type);
        this.updateControls();
    }
};

