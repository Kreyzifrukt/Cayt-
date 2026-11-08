# NEON ARCADE gameplay audit

## Scope and verification standard

This audit covers all 31 game modules, the shared completion/reward flow, local save normalization, audio feedback, and responsive controls.

A source review is not a substitute for exercising the games in a browser. CI now runs mount checks and a dedicated Playwright interaction suite covering all 31 games. A second suite completes full win/loss paths in selected games, including five logic/puzzle games, three board games, and deterministic word/card scenarios. Number Hunt is completed end to end with its persisted reward record checked. This does not amount to a complete victory/loss/draw playthrough of every game or replace physical-device and audio verification.

## Game inventory

| Game | Source-level review | Automated browser verification |
|---|---|---|
| Snake | Collision, food placement, terminal state reviewed; full-board completion fixed | Covered by mount and gameplay interaction tests in Playwright CI |
| 2048 | Merge, spawn and no-move logic extracted into tested helpers; continued play after reaching 2048 restored | Covered by mount and gameplay interaction tests in Playwright CI |
| Memory | Pair matching and shuffle reviewed; uses Fisher–Yates and blocks rapid third-card selections | Covered by mount and gameplay interaction tests in Playwright CI |
| XO | Win/draw detection and CPU move selection reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Reflex | Reaction timer and false-start flow reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Lights Out | Board generation and cross-toggle logic reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Tap Blitz | Timer, keyboard and target changes reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Word Scramble | Selection, attempt reset and scoring reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Minesweeper | Safe first click, flood reveal, flags and terminal input reviewed; flag limit and post-game input fixed | Covered by mount and gameplay interaction tests in Playwright CI |
| Tetris | Standard 10×20 field, seven tetrominoes, rotation, wall kicks, collision and row clearing reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Breakout | Paddle/ball bounds and brick coordinates reviewed; boundary reflection clamped and paddle reach corrected | Covered by mount and gameplay interaction tests in Playwright CI |
| Neon Pong | Ball collision, score and CPU movement reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Simon Says | Sequence playback and input timing reviewed; flash spacing and timer cleanup fixed | Covered by mount and gameplay interaction tests in Playwright CI |
| Hangman | Duplicate-letter counting and terminal state reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Connect Four | Column legality, win detection and CPU immediate win/block reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Whack-a-Mole | Timer and target selection reviewed; repeated same-target exploit fixed | Covered by mount and gameplay interaction tests in Playwright CI |
| Math Sprint | Timer, answer parsing and score updates reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Color Clash | Ink/word selection, timer and one-time completion reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Pattern Recall | Sequence is shown in ordered flashes; all reveal timers clear on reset/unmount | Covered by mount and gameplay interaction tests in Playwright CI |
| Higher or Lower | Comparison rules reviewed; equal cards no longer count as higher/lower | Covered by mount and gameplay interaction tests in Playwright CI |
| Typing Rush | Input prefix validation and timer completion reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Number Hunt | Completion path reviewed; terminal state and replay UI fixed | Covered by mount and gameplay interaction tests in Playwright CI |
| Mini Sudoku | Puzzle/solution consistency reviewed; incomplete grids can no longer be submitted | Covered by mount and gameplay interaction tests in Playwright CI |
| 15-Puzzle | Legal-move shuffle and solved-state detection reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Sokoban | Wall/box/goal logic reviewed; current level confirmed solvable by state search | Covered by mount and gameplay interaction tests in Playwright CI |
| Reversi | Legal flips, pass handling and end detection reviewed; consecutive CPU turns after a player pass fixed | Covered by mount and gameplay interaction tests in Playwright CI |
| Mastermind | Duplicate-color feedback and attempt limit reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Blackjack | Ace valuation, dealer stand threshold and natural blackjack comparison reviewed | Covered by mount and gameplay interaction tests in Playwright CI |
| Frogger | Lane movement, lives and crossing completion reviewed; moving-car collisions fixed | Covered by mount and gameplay interaction tests in Playwright CI |
| Gem Match | Adjacent swap, match scan, refill, cascades and move accounting reviewed; dead boards after refills are reshuffled | Covered by mount and gameplay interaction tests in Playwright CI |
| Maze Runner | Wall boundaries, key/exit conditions and reachability reviewed; exit is reachable | Covered by mount and gameplay interaction tests in Playwright CI |

## Automated browser smoke coverage

- Playwright mounts all 31 game components through the Vite development server and runs at least one actual browser interaction for each game. Uncaught browser runtime errors fail the tests.
- A separate completion suite solves Lights Out, Word Scramble, Mini Sudoku, Maze Runner and Sokoban from their rendered state; plays XO, Connect Four and Reversi to terminal positions; and verifies full win/loss paths for Hangman, Higher or Lower and Mastermind.
- Number Hunt is played through all 25 ordered targets; the final XP, coins, wins and history entry are verified in local storage.
- Memory is cleared through all eight matching pairs; Simon Says and Pattern Recall are completed through their final rounds using deterministic sequences and the browser clock. Reflex, Tap Blitz, Whack-a-Mole, Math Sprint and Color Clash are driven through their timed terminal states.
- Mobile emulation uses a 390×844 viewport with touch input for Frogger and Sokoban; Frogger also checks horizontal overflow.
- The suite verifies selected full completion paths, not every possible win/loss/draw/restart scenario across all 31 games. Physical-device input and audible output remain unverified.

## Shared systems

- Completion callback: the application ignores duplicate completions after the active run has been closed.
- Rewards: XP, coins, daily quest progress, best scores, per-game statistics and recent history are updated together.
- Draw accounting: XO, Connect Four, Reversi and Blackjack now report draws separately from losses. The save migration preserves draw totals and per-session outcomes; win-rate calculations exclude draws from the decisive-game denominator.
- Save compatibility: the new effects-volume setting is normalized and bounded to 0–1; older saves receive the default.
- Audio: Kenney Interface Sounds (CC0 1.0; source: https://kenney.nl/assets/interface-sounds) and qubodup's Two Simple Game Music Loops menu track (CC0 1.0; source: https://opengameart.org/content/two-simple-game-music-loops) are loaded by the browser on demand from pinned public commits. Effects and music have separate saved volume controls. Effects use bounded voice pools so rapid repeated actions can overlap without unbounded audio elements. Music volume is retained before the media element is created; autoplay retries on subsequent user gestures until playback succeeds, without clearing the saved preference. Audio manager unit tests cover overlap, pool bounds, volume clamping, retry after rejected playback, and stopping music. The browser needs network access for these remote assets.
- Accessibility and mobile: keyboard/touch controls still require real-device verification across all games.

## Fixed in this branch

- Reversi no longer gets stuck when the player must pass; the CPU continues until the player can move or the game ends.
- Frogger now detects cars moving into a stationary frog.
- Blackjack natural 21 checks the dealer's natural 21 before awarding a win, and the dealer's second card stays hidden until the hand ends.
- Tetris now uses a standard 10×20 playfield with all seven tetrominoes, clockwise rotation, basic wall kicks, and keyboard/touch rotation controls.
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

## Follow-up fixes from the second source review

- Simon Says locks player input during the inter-round pause and ignores input after the expected sequence is complete.
- 2048 keeps the session active after the 2048 milestone and records the result only when the board reaches a terminal no-moves state; the player can explicitly continue.
- Snake, Tetris, Breakout and Pong keep simulation state in refs and perform completion/reward side effects outside React state updater callbacks. This avoids duplicate scoring when React replays updater functions and prevents overlapping timer and keyboard ticks from processing the same state.
- Pong stops its interval after a match ends. Breakout and Pong clamp the ball to their board boundaries.
- The 15-Puzzle shuffle guarantees the initial board is not already solved.
- Mini Sudoku locks its inputs after checking the solution.
- Save import normalizes counters to non-negative integers, limits daily progress to three runs, rejects invalid calendar dates, and restores a default profile name when the imported name is blank.
- The shared completion handler normalizes scores and prevents a draw from also being counted as a win. Backup object URLs are revoked after the browser has had time to begin the download.
- Audio setup now catches synchronous browser failures as well as rejected playback promises.
- Tap Blitz rejects input at or after its wall-clock deadline, even before the display timer catches up; Reflex uses the same strict 300 ms target shown in its instructions.

## Dependency security and maintenance

- Updated Vite to 6.4.5, including the patched v6 release for GHSA-8g5g-mxqh-grgj.
- Updated Vitest to 5.1.0. The previous 2.x line included affected releases for GHSA-8gvc-j273-4wm5, and versions before the patched 4.1.12 / 5.0.3 releases were affected by GHSA-qxg6-89mg-rqv8.
- Added weekly Dependabot checks for npm dependencies and GitHub Actions.
- A committed npm lockfile is still missing. CI currently resolves compatible versions during npm install, so dependency resolution is not yet fully reproducible. A lockfile must be generated and committed before switching CI to npm ci.

## Remaining work before audit sign-off

1. Expand targeted unit tests for pure rules and reward edge cases across all games.
2. Complete physical desktop/mobile checks for keyboard focus, pointer/touch behavior, scrolling, touch targets and accidental page gestures; current mobile coverage is browser emulation for Frogger and Sokoban.
3. Expand deterministic end-to-end coverage for victory, loss, draw, restart, repeated sessions and reward accounting across the remaining games; the current completion suite covers representative full paths, not all 31.
4. Check mobile viewport sizes, touch targets, scrolling, and accidental page gestures.
5. Recheck Tetris on physical display sizes after the corrected 10×20 playfield, seven-piece set and controls have passed browser automation.
6. Manually listen to the selected CC0 music loop and effects on desktop and mobile, then verify volume changes, mute, pause, reload, and browser autoplay handling.
7. Recheck the full dependency audit before any public deployment.
