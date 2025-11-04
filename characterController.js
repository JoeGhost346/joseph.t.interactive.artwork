// Character Movement Controller
const characterController = {
    character: null,
    casinoRoom: null,
    position: { x: 50, y: 50 }, // Percentage based
    speed: 0.5, // Percentage per frame
    keys: { w: false, a: false, s: false, d: false },
    isMoving: false,
    direction: 'down',
    interactionCheckRunning: false,
    keydownHandler: null,
    keyupHandler: null,
    
    init() {
        this.character = document.getElementById('character');
        // Support both world-map and casino-room
        this.casinoRoom = document.querySelector('.world-container') || document.querySelector('.casino-room');
        
        if (!this.character || !this.casinoRoom) {
            // Try again after a short delay if elements aren't ready
            setTimeout(() => this.init(), 100);
            return;
        }
        
        // Set initial position (center)
        this.position = { x: 50, y: 50 };
        this.updatePosition();
        
        // Remove existing listeners to prevent duplicates
        this.removeEventListeners();
        
        // Add keyboard event listeners
        this.keydownHandler = (e) => this.handleKeyDown(e);
        this.keyupHandler = (e) => this.handleKeyUp(e);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        
        // Start movement loop
        this.startMovementLoop();
        
        // Check for location interactions
        this.startInteractionCheck();
    },
    
    removeEventListeners() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
    },
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            e.preventDefault();
            this.keys[key] = true;
            this.updateDirection();
            this.isMoving = true;
        }
    },
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            this.keys[key] = false;
            this.updateDirection();
            this.isMoving = Object.values(this.keys).some(k => k);
        }
    },
    
    updateDirection() {
        // Priority: W/S > A/D (vertical movement takes priority)
        if (this.keys.w && !this.keys.s) {
            this.direction = 'up';
        } else if (this.keys.s && !this.keys.w) {
            this.direction = 'down';
        } else if (this.keys.a && !this.keys.d) {
            this.direction = 'left';
        } else if (this.keys.d && !this.keys.a) {
            this.direction = 'right';
        }
        
        // Update character facing direction
        if (this.character) {
            this.character.setAttribute('data-direction', this.direction);
        }
    },
    
    startMovementLoop() {
        const move = () => {
            if (this.casinoRoom && (gameManager.currentGame === 'world' || gameManager.currentGame === 'lobby')) {
                const oldX = this.position.x;
                const oldY = this.position.y;
                
                if (this.isMoving) {
                    // Move based on keys
                    if (this.keys.w) this.position.y = Math.max(10, this.position.y - this.speed);
                    if (this.keys.s) this.position.y = Math.min(90, this.position.y + this.speed);
                    if (this.keys.a) this.position.x = Math.max(5, this.position.x - this.speed);
                    if (this.keys.d) this.position.x = Math.min(95, this.position.x + this.speed);
                    
                    // Add walking animation
                    if (this.character) {
                        this.character.classList.add('moving');
                    }
                } else {
                    // Remove walking animation
                    if (this.character) {
                        this.character.classList.remove('moving');
                    }
                }
                
                // Only update if position changed
                if (oldX !== this.position.x || oldY !== this.position.y) {
                    this.updatePosition();
                }
            } else {
                // Remove walking animation when not in lobby
                if (this.character) {
                    this.character.classList.remove('moving');
                }
            }
            
            requestAnimationFrame(move);
        };
        
        move();
    },
    
    updatePosition() {
        if (this.character && this.casinoRoom) {
            this.character.style.left = `${this.position.x}%`;
            this.character.style.bottom = `${this.position.y}%`;
            // Transform is handled by CSS based on direction
        }
    },
    
    startInteractionCheck() {
        // Stop any existing interaction check
        if (this.interactionCheckRunning) {
            return;
        }
        this.interactionCheckRunning = true;
        
        const checkInteraction = () => {
            // Only run if we're in the world
            if (gameManager.currentGame !== 'world' && gameManager.currentGame !== 'lobby') {
                this.interactionCheckRunning = false;
                return;
            }
            
            if (!this.character || !this.casinoRoom) {
                requestAnimationFrame(checkInteraction);
                return;
            }
            
            // Support both game-locations and game-tables
            const gameLocations = document.querySelectorAll('.game-location, .game-table');
            if (gameLocations.length === 0) {
                requestAnimationFrame(checkInteraction);
                return;
            }
            
            let nearLocation = null;
            let minDistance = Infinity;
            
            // Get character screen position
            const charRect = this.character.getBoundingClientRect();
            if (!charRect || charRect.width === 0 || charRect.height === 0) {
                requestAnimationFrame(checkInteraction);
                return;
            }
            
            const charCenterX = charRect.left + charRect.width / 2;
            const charCenterY = charRect.top + charRect.height / 2;
            
            gameLocations.forEach(location => {
                const locationRect = location.getBoundingClientRect();
                if (!locationRect || locationRect.width === 0 || locationRect.height === 0) {
                    return;
                }
                
                const locationCenterX = locationRect.left + locationRect.width / 2;
                const locationCenterY = locationRect.top + locationRect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(charCenterX - locationCenterX, 2) + 
                    Math.pow(charCenterY - locationCenterY, 2)
                );
                
                // Interaction distance (200px - increased for easier interaction)
                if (distance < 200 && distance < minDistance) {
                    minDistance = distance;
                    nearLocation = location;
                }
            });
            
            // Update location interaction states
            gameLocations.forEach(location => {
                if (location === nearLocation) {
                    location.classList.add('near-character');
                    location.setAttribute('data-interactive', 'true');
                } else {
                    location.classList.remove('near-character');
                    location.setAttribute('data-interactive', 'false');
                }
            });
            
            // Show interaction prompt
            const interactionPrompt = document.getElementById('interaction-prompt');
            if (nearLocation) {
                if (!interactionPrompt) {
                    this.createInteractionPrompt();
                }
                this.updateInteractionPrompt(nearLocation);
            } else {
                if (interactionPrompt) {
                    interactionPrompt.style.display = 'none';
                }
            }
            
            requestAnimationFrame(checkInteraction);
        };
        
        checkInteraction();
    },
    
    createInteractionPrompt() {
        const prompt = document.createElement('div');
        prompt.id = 'interaction-prompt';
        prompt.className = 'interaction-prompt';
        prompt.innerHTML = 'Press <span class="key">E</span> to play';
        if (this.casinoRoom) {
            this.casinoRoom.appendChild(prompt);
        }
    },
    
    updateInteractionPrompt(location) {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            const gameName = location.dataset.game;
            const gameNames = {
                'slots': 'Slot Machine',
                'blackjack': 'Blackjack',
                'roulette': 'Roulette',
                'uno': 'Uno'
            };
            prompt.innerHTML = `Press <span class="key">E</span> to play ${gameNames[gameName]}`;
            prompt.style.display = 'block';
            
            // Position prompt near location
            const locationRect = location.getBoundingClientRect();
            const roomRect = this.casinoRoom.getBoundingClientRect();
            prompt.style.left = `${locationRect.left - roomRect.left + locationRect.width / 2}px`;
            prompt.style.top = `${locationRect.top - roomRect.top - 50}px`;
            prompt.style.transform = 'translateX(-50%)';
        }
    },
    
    checkTableInteraction() {
        const interactiveLocation = document.querySelector('.game-location[data-interactive="true"], .game-table[data-interactive="true"]');
        if (interactiveLocation) {
            const game = interactiveLocation.dataset.game;
            gameManager.switchToGame(game);
        }
    },
    
    resetPosition() {
        this.position = { x: 50, y: 50 };
        this.updatePosition();
    }
};

// Add E key listener for interaction
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e' && (gameManager.currentGame === 'world' || gameManager.currentGame === 'lobby')) {
        characterController.checkTableInteraction();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize character controller after a short delay to ensure DOM is ready
    setTimeout(() => {
        characterController.init();
    }, 100);
});
