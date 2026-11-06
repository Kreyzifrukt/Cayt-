# NEON ARCADE

A responsive, local-first arcade hub built with React, TypeScript and Vite. Five playable mini-games share one player profile, XP progression, personal records and favorites.

## Games
- **Neon Snake** — grid-based snake with keyboard controls, collision detection and increasing speed.
- **2048** — merge tiles with keyboard controls, score tracking and win/game-over states.
- **Memory Matrix** — match eight pairs and earn a score based on move efficiency.
- **XO Arena** — tic-tac-toe against a lightweight computer opponent.
- **Reflex Rush** — reaction-time challenge with randomized signal timing.

## Features
- Dashboard, featured game and player statistics
- XP and level progression, personal bests and favorites
- Responsive desktop and mobile layouts
- Local browser persistence; no account or backend required

## Requirements
Node.js 20.19+ or 22.12+ and npm.

## Development
```bash
npm install
npm run dev
```

## Quality checks
```bash
npm run typecheck
npm run build
```

All progress is stored in localStorage under `neon-arcade-save`. Clearing browser site data resets the local profile.
