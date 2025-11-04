# 🎰 Casino Adventure - Interactive 2D Gambling Game

A fully interactive 2D casino game featuring a character sprite in a casino environment with multiple gambling games. Built with HTML, CSS, and JavaScript.

## Features

- **Casino Lobby**: Beautiful casino room with character sprite and game tables
- **Character Movement**: Use WASD keys to move your character around the casino
- **Character Sprite**: Animated character that rotates and walks based on movement
- **Proximity Interaction**: Move near tables and press E to play (or click directly)
- **Visual Feedback**: Tables glow and pulse when you're nearby
- **Multiple Games**: 
  - 🎰 **Slot Machine**: Classic 3-reel slots with animated spinning
  - 🃏 **Blackjack**: Full blackjack game with dealer AI
  - 🎲 **Roulette**: Interactive roulette wheel with betting options
- **Shared Balance**: One balance across all games
- **Smooth Animations**: Character walking animations, spinning reels, card flips, and more
- **Responsive Design**: Works on desktop and mobile devices

## How to Play

1. Open `index.html` in your web browser
2. You'll start in the casino lobby with a character sprite
3. **Movement Controls**:
   - **W** - Move up
   - **A** - Move left
   - **S** - Move down
   - **D** - Move right
4. **Interacting with Games**:
   - Move your character near a game table (within 150px)
   - The table will glow when you're close
   - Press **E** to enter the game
   - Or click on the table directly
5. **Playing Games**:
   - **Slot Machine**: Select bet, click SPIN
   - **Blackjack**: Place bet, click Deal, then Hit or Stand
   - **Roulette**: Select bet type, click SPIN
6. Use the "Back to Lobby" button to return to the casino
7. Your balance is shared across all games

## Game Rules

### Starting Balance
- Start with $1000

### Slot Machine
- Match three identical symbols to win
- Payout multipliers:
  - 💎💎💎 = 100x
  - ⭐⭐⭐ = 50x
  - 🔔🔔🔔 = 25x
  - 🍇🍇🍇 = 10x
  - 🍊🍊🍊 = 5x
  - 🍋🍋🍋 = 3x
  - 🍒🍒🍒 = 2x

### Blackjack
- Get closer to 21 than the dealer without going over
- Face cards = 10, Ace = 11 or 1
- Dealer must hit on 16 or below
- Win = 2x your bet
- Blackjack pays 2x

### Roulette
- Bet on red/black (2x payout)
- Bet on 0 (36x payout)
- Bet on 1-18 or 19-36 (2x payout)
- Ball lands on winning number/color

## File Structure

```
.
├── index.html              # Main HTML structure with casino lobby and games
├── styles.css              # All styling, animations, and casino theme
├── gameManager.js          # Manages navigation and shared balance
├── characterController.js  # Character movement and interaction system
├── slots.js                # Slot machine game logic
├── blackjack.js            # Blackjack game logic
├── roulette.js             # Roulette game logic
└── README.md                # This file
```

## Technologies Used

- HTML5
- CSS3 (with animations, gradients, and transforms)
- Vanilla JavaScript (ES6+)

## Running the Game

Simply open `index.html` in any modern web browser. No build process or dependencies required!

## Features in Detail

### Casino Lobby
- Animated casino floor with carpet pattern
- Ambient lighting effects
- Character sprite with idle animation
- Interactive game tables with hover effects
- Shared balance display

### Character Movement
- Use WASD keys to move your character
- Character rotates to face movement direction
- Walking animation when moving
- Smooth movement with collision boundaries
- Character resets position when returning to lobby

### Game Navigation
- Move your character near a game table (within 150px)
- Tables glow and pulse when you're close
- Press **E** key to interact with nearby table
- Or click directly on tables to enter games
- "Back to Lobby" button in each game
- Seamless transitions between games
- Balance persists across all games

### Animations
- Character walking animation (when moving)
- Character rotation based on movement direction
- Table pulsing when character is nearby
- Slot machine spinning
- Card flip animations
- Roulette wheel spinning
- Win/loss message animations
- Button hover effects
- Interaction prompts with pulsing animation

## Future Enhancements

Potential features that could be added:
- Sound effects and music
- More games (Poker, Craps, Baccarat)
- Character movement/animation between tables
- Progressive jackpots
- High score tracking
- Leaderboard system
- Multiplayer support
- Achievements and badges

## License

This project is open source and available for educational purposes.

---

**Note**: This is a game for entertainment purposes only. No real money is involved.

Enjoy your time at the casino! 🎰🎲🃏