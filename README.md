# NEON ARCADE

A responsive, local-first arcade hub built with React, TypeScript and Vite. **31 playable games** share one player profile, XP progression, coins, achievements, daily quests, personal records and favorites.

## Games

### Original arcade
- **Neon Snake** — grid-based snake with keyboard controls, collision detection and increasing speed.
- **2048** — merge tiles with keyboard controls, score tracking and win/game-over states.
- **Memory Matrix** — match eight pairs and earn a score based on move efficiency.
- **XO Arena** — tic-tac-toe against a lightweight computer opponent.
- **Reflex Rush** — reaction-time challenge with randomized signal timing.
- **Lights Out** — switch off a 5×5 board with cross-shaped moves.
- **Tap Blitz** — hit the active target in a timed round.
- **Word Scramble** — solve a sequence of mixed-up words.

### New games
- **Minesweeper** — 8×8 minefield with recursive safe-cell reveal and flagging.
- **Tetris** — falling-shape stacking and row clearing.
- **Breakout** — paddle-and-ball brick breaker.
- **Neon Pong** — paddle duel against a tracking CPU.
- **Simon Says** — repeat an expanding light sequence.
- **Hangman** — solve a hidden word with a limited number of mistakes.
- **Connect Four** — connect four discs against a CPU opponent.
- **Whack-a-Mole** — timed target tracking.
- **Math Sprint** — solve rapid arithmetic questions.
- **Color Clash** — identify the displayed ink color rather than the word.
- **Pattern Recall** — memorize and repeat expanding grid patterns.
- **Higher or Lower** — predict the next card value.
- **Typing Rush** — timed typing challenge.
- **Number Hunt** — find numbers in ascending order.
- **Mini Sudoku** — compact 4×4 logic puzzle.

### Retro classics
- **15-Puzzle** — a sliding puzzle shuffled only through legal moves.
- **Sokoban** — push crates onto storage points without trapping them.
- **Reversi** — an 8×8 disc-capture duel against a positional CPU.
- **Mastermind** — crack a four-color code using exact/misplaced feedback.
- **Blackjack** — a single-player 21 round with ace valuation and dealer rules.
- **Frogger** — cross moving traffic lanes with limited lives.
- **Gem Match** — swap adjacent gems and reach a score target.
- **Maze Runner** — find the key and navigate a compact maze to the exit.

## Player features
- XP, levels, coins, unlockable color palettes, personal bests and favorites
- Seven achievement milestones and a daily three-game quest
- Search, genre filters and favorites-only view
- Editable player name, dark/light appearance, sound preference and earnable cosmetic accent palettes
- Fullscreen game view
- JSON save export/import and local profile reset
- Backward-compatible local save migration and input validation

## Development

Requires Node.js 22.12+ (or Node.js 24+). This matches the current Vitest 5 toolchain.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run test:e2e
```

All progress is stored in localStorage under `neon-arcade-save`. Clearing browser site data resets the local profile. Online leaderboards and cloud synchronization are intentionally not represented as available: they require a hosted backend, user accounts and server-side score validation.


## Language and game instructions

- The interface supports English and Ukrainian. Ukrainian is the default for new profiles.
- The selected language is stored in the local player save and survives reloads and backup export/import.
- Every game has an instruction panel above its playfield with the objective, rules and controls in the selected language.
- Existing saves are migrated automatically and keep their progress.
