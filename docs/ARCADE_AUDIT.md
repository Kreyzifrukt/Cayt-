# NEON ARCADE gameplay audit

## Scope and verification standard

This audit covers all 31 game modules, the shared completion/reward flow, local save normalization, audio feedback, and responsive controls.

A source review is not a substitute for playing the games in a browser. The current CI workflow verifies TypeScript, Vitest, and the production build; it does not simulate pointer/touch input, keyboard focus, timing under real rendering, or a complete game session. Browser/device verification therefore remains a separate required pass before calling the audit complete.

## Game inventory

| Game | Source-level review | Interactive browser test |
|---|---|---|
| Snake | Collision, food placement, terminal state reviewed; full-board completion fixed | Pending |
| 2048 | Merge, spawn and no-move paths reviewed; continued play after reaching 2048 restored | Pending |
| Memory | Pair matching and shuffle reviewed; replaced biased random sort with Fisher–Yates | Pending |
| XO | Win/draw detection and CPU move selection reviewed | Pending |
| Reflex | Reaction timer and false-start flow reviewed | Pending |
| Lights Out | Board generation and cross-toggle logic reviewed | Pending |
| Tap Blitz | Timer, keyboard and target changes reviewed | Pending |
| Word Scramble | Selection, attempt reset and scoring reviewed | Pending |
| Minesweeper | Safe first click, flood reveal, flags and terminal input reviewed; flag limit and post-game input fixed | Pending |
| Tetris | Collision and row clearing reviewed; rotation and full tetromino set remain gameplay limitations | Pending |
| Breakout | Paddle/ball bounds and brick coordinates reviewed; boundary reflection clamped and paddle reach corrected | Pending |
| Neon Pong | Ball collision, score and CPU movement reviewed | Pending |
| Simon Says | Sequence playback and input timing reviewed; flash spacing and timer cleanup fixed | Pending |
| Hangman | Duplicate-letter counting and terminal state reviewed | Pending |
| Connect Four | Column legality, win detection and CPU immediate win/block reviewed | Pending |
| Whack-a-Mole | Timer and target selection reviewed; repeated same-target exploit fixed | Pending |
| Math Sprint | Timer, answer parsing and score updates reviewed | Pending |
| Color Clash | Ink/word selection, timer and one-time completion reviewed | Pending |
| Pattern Recall | Sequence progression and timeout lifecycle reviewed; pending timeout cleanup fixed | Pending |
| Higher or Lower | Comparison rules reviewed; equal cards no longer count as higher/lower | Pending |
| Typing Rush | Input prefix validation and timer completion reviewed | Pending |
| Number Hunt | Completion path reviewed; terminal state and replay UI fixed | Pending |
| Mini Sudoku | Puzzle/solution consistency reviewed; incomplete grids can no longer be submitted | Pending |
| 15-Puzzle | Legal-move shuffle and solved-state detection reviewed | Pending |
| Sokoban | Wall/box/goal logic reviewed; current level confirmed solvable by state search | Pending |
| Reversi | Legal flips, pass handling and end detection reviewed; consecutive CPU turns after a player pass fixed | Pending |
| Mastermind | Duplicate-color feedback and attempt limit reviewed | Pending |
| Blackjack | Ace valuation, dealer stand threshold and natural blackjack comparison reviewed | Pending |
| Frogger | Lane movement, lives and crossing completion reviewed; moving-car collisions fixed | Pending |
| Gem Match | Adjacent swap, match scan, refill and move accounting reviewed; cascades and initial-board validation remain limitations | Pending |
| Maze Runner | Wall boundaries, key/exit conditions and reachability reviewed; exit is reachable | Pending |

## Shared systems

- Completion callback: the application ignores duplicate completions after the active run has been closed.
- Rewards: XP, coins, daily quest progress, best scores, per-game statistics and recent history are updated together.
- Draw accounting: the current shared result model stores a win/loss boolean, so draws in XO, Connect Four, Reversi and Blackjack are currently recorded as non-wins. This is an accuracy issue to resolve in a separate result-model migration.
- Save compatibility: the new effects-volume setting is normalized and bounded to 0–1; older saves receive the default.
- Audio: Kenney Interface Sounds (CC0 1.0) and qubodup's Two Simple Game Music Loops menu track (CC0 1.0) are loaded by the browser on demand from pinned public commits. Effects and music have separate saved volume controls; playback failure, network failure and autoplay restrictions are handled silently. The browser needs network access for these remote assets.
- Accessibility and mobile: keyboard/touch controls still require real-device verification across all games.

## Fixed in this branch

- Reversi no longer gets stuck when the player must pass; the CPU continues until the player can move or the game ends.
- Frogger now detects cars moving into a stationary frog.
- Blackjack natural 21 checks the dealer's natural 21 before awarding a win, and the dealer's second card stays hidden until the hand ends.
- Tetris now has all seven standard tetrominoes, clockwise rotation, basic wall kicks, and keyboard/touch rotation controls.
- Typing Rush rejects pasted text so the timed typing challenge cannot be completed by pasting the prompt.
- Breakout's ball can reach every brick column; horizontal and ceiling bounces clamp to the board edge instead of skipping cells or moving outside the playfield.
- Simon Says uses separated flashes and clears pending timers on reset/unmount.
- Whack-a-Mole, Math Sprint, Color Clash and Typing Rush now use wall-clock deadlines; score/text updates no longer restart their round timers.
- Whack-a-Mole cannot randomly keep the same target after a hit.
- Number Hunt now presents a clear completion state and replay action.
- Mini Sudoku blocks submission of an incomplete grid.
- Minesweeper prevents flagging revealed cells, caps flags at the mine count, and ignores board input after completion.
- Pattern Recall clears its reveal timer when reset or unmounted.
- Memory uses an unbiased Fisher–Yates shuffle.
- Snake ends cleanly if the player fills the entire board.
- Higher or Lower treats an equal card as a tie rather than awarding either prediction.
- 2048 now allows continued play after reaching the target tile, and only awards the first milestone once; the run can still end when no legal moves remain.
- Gem Match now generates a board without pre-existing matches and resolves chained matches after a valid swap.
- Shared click and result sounds use browser audio playback with a persistent effects-volume preference.
- XP changes receive a small, restrained animation.

## Remaining work before audit sign-off

1. Add targeted unit tests for pure rules and reward edge cases across all games.
2. Run full keyboard, pointer and touch playthroughs for all 31 games.
3. Verify victory, loss, draw, restart, repeated sessions, and reward accounting for each game.
4. Check mobile viewport sizes, touch targets, scrolling, and accidental page gestures.
5. Review remaining design limits after the Tetris rotation and seven-piece set are exercised in a browser.
6. Manually listen to the selected CC0 music loop and effects on desktop and mobile, then verify volume changes, mute, pause, reload, and browser autoplay handling.
7. Recheck the full dependency audit before any public deployment.
