# NEON ARCADE gameplay audit

## Scope and verification standard

This audit covers all 31 game modules, the shared completion/reward flow, local save normalization, audio feedback, and responsive controls.

A source review is not a substitute for playing the games in a browser. The current CI workflow verifies TypeScript, Vitest, and the production build; it does not simulate pointer/touch input, keyboard focus, timing under real rendering, or a complete game session. Browser/device verification therefore remains a separate required pass before calling the audit complete.

## Game inventory

| Game | Source-level review | Automated browser mount smoke test |
|---|---|---|
| Snake | Collision, food placement, terminal state reviewed; full-board completion fixed | Covered by CI mount smoke test |
| 2048 | Merge, spawn and no-move logic extracted into tested helpers; continued play after reaching 2048 restored | Covered by CI mount smoke test |
| Memory | Pair matching and shuffle reviewed; uses Fisher–Yates and blocks rapid third-card selections | Covered by CI mount smoke test |
| XO | Win/draw detection and CPU move selection reviewed | Covered by CI mount smoke test |
| Reflex | Reaction timer and false-start flow reviewed | Covered by CI mount smoke test |
| Lights Out | Board generation and cross-toggle logic reviewed | Covered by CI mount smoke test |
| Tap Blitz | Timer, keyboard and target changes reviewed | Covered by CI mount smoke test |
| Word Scramble | Selection, attempt reset and scoring reviewed | Covered by CI mount smoke test |
| Minesweeper | Safe first click, flood reveal, flags and terminal input reviewed; flag limit and post-game input fixed | Covered by CI mount smoke test |
| Tetris | Seven standard tetrominoes, rotation, wall kicks, collision and row clearing reviewed | Covered by CI mount smoke test |
| Breakout | Paddle/ball bounds and brick coordinates reviewed; boundary reflection clamped and paddle reach corrected | Covered by CI mount smoke test |
| Neon Pong | Ball collision, score and CPU movement reviewed | Covered by CI mount smoke test |
| Simon Says | Sequence playback and input timing reviewed; flash spacing and timer cleanup fixed | Covered by CI mount smoke test |
| Hangman | Duplicate-letter counting and terminal state reviewed | Covered by CI mount smoke test |
| Connect Four | Column legality, win detection and CPU immediate win/block reviewed | Covered by CI mount smoke test |
| Whack-a-Mole | Timer and target selection reviewed; repeated same-target exploit fixed | Covered by CI mount smoke test |
| Math Sprint | Timer, answer parsing and score updates reviewed | Covered by CI mount smoke test |
| Color Clash | Ink/word selection, timer and one-time completion reviewed | Covered by CI mount smoke test |
| Pattern Recall | Sequence is shown in ordered flashes; all reveal timers clear on reset/unmount | Covered by CI mount smoke test |
| Higher or Lower | Comparison rules reviewed; equal cards no longer count as higher/lower | Covered by CI mount smoke test |
| Typing Rush | Input prefix validation and timer completion reviewed | Covered by CI mount smoke test |
| Number Hunt | Completion path reviewed; terminal state and replay UI fixed | Covered by CI mount smoke test |
| Mini Sudoku | Puzzle/solution consistency reviewed; incomplete grids can no longer be submitted | Covered by CI mount smoke test |
| 15-Puzzle | Legal-move shuffle and solved-state detection reviewed | Covered by CI mount smoke test |
| Sokoban | Wall/box/goal logic reviewed; current level confirmed solvable by state search | Covered by CI mount smoke test |
| Reversi | Legal flips, pass handling and end detection reviewed; consecutive CPU turns after a player pass fixed | Covered by CI mount smoke test |
| Mastermind | Duplicate-color feedback and attempt limit reviewed | Covered by CI mount smoke test |
| Blackjack | Ace valuation, dealer stand threshold and natural blackjack comparison reviewed | Covered by CI mount smoke test |
| Frogger | Lane movement, lives and crossing completion reviewed; moving-car collisions fixed | Covered by CI mount smoke test |
| Gem Match | Adjacent swap, match scan, refill, cascades and move accounting reviewed; dead boards after refills are reshuffled | Covered by CI mount smoke test |
| Maze Runner | Wall boundaries, key/exit conditions and reachability reviewed; exit is reachable | Covered by CI mount smoke test |

## Automated browser smoke coverage

- Playwright mounts all 31 game components through the real Vite development server and fails on uncaught browser runtime errors.
- A mobile viewport smoke test opens Tetris at 390×844 and checks for horizontal page overflow.
- These checks verify rendering and basic responsive layout only. They do not replace complete gameplay, keyboard/touch interaction, scoring, or audio playthroughs on real devices.

## Shared systems

- Completion callback: the application ignores duplicate completions after the active run has been closed.
- Rewards: XP, coins, daily quest progress, best scores, per-game statistics and recent history are updated together.
- Draw accounting: XO, Connect Four, Reversi and Blackjack now report draws separately from losses. The save migration preserves draw totals and per-session outcomes; win-rate calculations exclude draws from the decisive-game denominator.
- Save compatibility: the new effects-volume setting is normalized and bounded to 0–1; older saves receive the default.
- Audio: Kenney Interface Sounds (CC0 1.0; source: https://kenney.nl/assets/interface-sounds) and qubodup's Two Simple Game Music Loops menu track (CC0 1.0; source: https://opengameart.org/content/two-simple-game-music-loops) are loaded by the browser on demand from pinned public commits. Effects and music have separate saved volume controls; playback failure, network failure and autoplay restrictions are handled silently. Autoplay retries after the first user gesture without clearing the saved preference. The browser needs network access for these remote assets.
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
- Pattern Recall shows each target cell sequentially so the required input order is learnable, and clears all reveal timers when reset or unmounted.
- Memory uses an unbiased Fisher–Yates shuffle and ignores a third rapid card selection before the mismatch lock effect runs.
- Snake ends cleanly if the player fills the entire board.
- Higher or Lower treats an equal card as a tie rather than awarding either prediction.
- Draw outcomes are persisted separately from losses for XO, Connect Four, Reversi and Blackjack.
- XO's CPU now takes an immediate win when available and blocks the player's immediate winning move.
- Imported global win/draw totals are clamped to the number of recorded games; contradictory session outcomes cannot be both a win and a draw.
- 2048 now allows continued play after reaching the target tile, only awards the first milestone once, and ends when no legal moves remain. Merge, direction and no-move rules have dedicated unit tests.
- Gem Match generates boards without pre-existing matches, guarantees a legal swap after every refill, and resolves chained matches.
- Blackjack uses Fisher–Yates deck shuffling and has unit coverage for deck uniqueness and ace valuation.
- Shared click and result sounds use browser audio playback with a persistent effects-volume preference.
- XP changes receive a small, restrained animation.

## Dependency security and maintenance

- Updated Vite to 6.4.5, including the patched v6 release for GHSA-8g5g-mxqh-grgj.
- Updated Vitest to 5.1.0. The previous 2.x line included affected releases for GHSA-8gvc-j273-4wm5, and versions before the patched 4.1.12 / 5.0.3 releases were affected by GHSA-qxg6-89mg-rqv8.
- Added weekly Dependabot checks for npm dependencies and GitHub Actions.
- A committed npm lockfile is still missing. CI currently resolves compatible versions during npm install, so dependency resolution is not yet fully reproducible. A lockfile must be generated and committed before switching CI to npm ci.

## Remaining work before audit sign-off

1. Expand targeted unit tests for pure rules and reward edge cases across all games.
2. Complete manual keyboard, pointer and touch playthroughs for all 31 games; the automated smoke test only verifies mounting and one mobile viewport.
3. Verify victory, loss, draw, restart, repeated sessions, and reward accounting for each game.
4. Check mobile viewport sizes, touch targets, scrolling, and accidental page gestures.
5. Review remaining design limits after the Tetris rotation and seven-piece set are exercised in a browser.
6. Manually listen to the selected CC0 music loop and effects on desktop and mobile, then verify volume changes, mute, pause, reload, and browser autoplay handling.
7. Recheck the full dependency audit before any public deployment.
