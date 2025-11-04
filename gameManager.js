// Global Game Manager
const gameManager = {
    balance: 1000,
    currentGame: 'world',
    
    init() {
        this.updateBalance();
        this.setupWorld();
    },
    
    setupWorld() {
        // Setup game locations (both click and proximity-based)
        this.setupGameLocationHandlers();
    },
    
    setupGameLocationHandlers() {
        // Use event delegation for better performance and reliability
        const worldContainer = document.querySelector('.world-container');
        const gameLocationsContainer = document.querySelector('.game-locations');
        
        if (worldContainer) {
            // Remove existing handler if any
            if (this.gameLocationClickHandler) {
                worldContainer.removeEventListener('click', this.gameLocationClickHandler);
            }
            
            // Add new delegated click handler
            this.gameLocationClickHandler = (e) => {
                // Check if click is on a game location
                const gameLocation = e.target.closest('.game-location');
                if (gameLocation) {
                    e.stopPropagation();
                    e.preventDefault();
                    const game = gameLocation.dataset.game;
                    if (game) {
                        this.switchToGame(game);
                    }
                }
            };
            
            worldContainer.addEventListener('click', this.gameLocationClickHandler);
        }
        
        // Also support old table format for compatibility
        const gameTables = document.querySelectorAll('.game-table');
        gameTables.forEach(table => {
            table.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const game = table.dataset.game;
                if (game) {
                    this.switchToGame(game);
                }
            });
        });
    },
    
    switchToGame(gameName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected game
        const gameScreen = document.getElementById(`${gameName}-game`);
        if (gameScreen) {
            gameScreen.classList.add('active');
            this.currentGame = gameName;
            this.updateBalance();
            
            // Initialize game if it has an init function
            if (window[gameName + 'Game'] && window[gameName + 'Game'].init) {
                window[gameName + 'Game'].init();
            }
        }
    },
    
    returnToWorld() {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show world map
        const worldScreen = document.getElementById('world-map');
        if (worldScreen) {
            worldScreen.classList.add('active');
            this.currentGame = 'world';
            this.updateBalance();
            
            // Re-setup game location handlers
            setTimeout(() => {
                this.setupGameLocationHandlers();
                
                // Re-initialize character controller for world
                if (characterController) {
                    characterController.init();
                }
            }, 100);
        }
    },
    
    returnToLobby() {
        // Alias for backward compatibility
        this.returnToWorld();
    },
    
    updateBalance() {
        // Update balance in all displays
        const balanceDisplays = document.querySelectorAll('#balance, #balance-slots, #balance-blackjack, #balance-roulette, #balance-uno');
        balanceDisplays.forEach(display => {
            display.textContent = this.balance.toLocaleString();
        });
    },
    
    addBalance(amount) {
        this.balance += amount;
        this.updateBalance();
    },
    
    deductBalance(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.updateBalance();
            return true;
        }
        return false;
    },
    
    getBalance() {
        return this.balance;
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    gameManager.init();
});
