export type SokobanLevel = {
  player: number;
  boxes: number[];
  goals: number[];
  walls: number[];
};

export const SOKOBAN_SIZE = 8;
const INTERIOR_SIZE = SOKOBAN_SIZE - 2;
const DIRECTIONS = [-SOKOBAN_SIZE, SOKOBAN_SIZE, -1, 1] as const;

export const SOKOBAN_FALLBACK_LEVEL: SokobanLevel = {
  player: 51,
  boxes: [19, 35, 45],
  goals: [11, 34, 37],
  walls: [9, 14, 49, 54],
};

function shufflePositions<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function isInterior(cell: number): boolean {
  const row = Math.floor(cell / SOKOBAN_SIZE);
  const column = cell % SOKOBAN_SIZE;
  return row >= 1 && row < SOKOBAN_SIZE - 1 &&
    column >= 1 && column < SOKOBAN_SIZE - 1;
}

function isWall(cell: number, walls: Set<number> = new Set()): boolean {
  const row = Math.floor(cell / SOKOBAN_SIZE);
  const column = cell % SOKOBAN_SIZE;
  return cell < 0 || cell >= SOKOBAN_SIZE * SOKOBAN_SIZE ||
    row === 0 || row === SOKOBAN_SIZE - 1 ||
    column === 0 || column === SOKOBAN_SIZE - 1 || walls.has(cell);
}

/**
 * Search the complete player/box state space to reject levels that merely
 * have straight push lanes but cannot be reached from the player's spawn.
 */
export function isSokobanLevelSolvable(level: SokobanLevel): boolean {
  const walls = new Set(level.walls ?? []);
  if (
    !isInterior(level.player) ||
    level.boxes.length === 0 ||
    level.boxes.length !== level.goals.length ||
    new Set(level.boxes).size !== level.boxes.length ||
    new Set(level.goals).size !== level.goals.length ||
    new Set(walls).size !== walls.size ||
    [...walls].some((cell) => !isInterior(cell)) ||
    level.boxes.some((cell) => !isInterior(cell) || walls.has(cell)) ||
    level.goals.some((cell) => !isInterior(cell) || walls.has(cell)) ||
    walls.has(level.player) ||
    level.boxes.includes(level.player)
  ) {
    return false;
  }

  const goals = new Set(level.goals);
  const normalizeBoxes = (boxes: number[]) => [...boxes].sort((a, b) => a - b);
  const encode = (player: number, boxes: number[]) =>
    `${player}|${boxes.join(",")}`;
  const initialBoxes = normalizeBoxes(level.boxes);
  const queue = [{ player: level.player, boxes: initialBoxes }];
  const visited = new Set([encode(level.player, initialBoxes)]);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const state = queue[cursor];
    if (state.boxes.every((box) => goals.has(box))) return true;

    for (const delta of DIRECTIONS) {
      const nextPlayer = state.player + delta;
      if (isWall(nextPlayer, walls)) continue;

      const boxIndex = state.boxes.indexOf(nextPlayer);
      let nextBoxes = state.boxes;
      if (boxIndex >= 0) {
        const beyond = nextPlayer + delta;
        if (isWall(beyond, walls) || state.boxes.includes(beyond)) continue;
        nextBoxes = [...state.boxes];
        nextBoxes[boxIndex] = beyond;
        nextBoxes = normalizeBoxes(nextBoxes);
      }

      const key = encode(nextPlayer, nextBoxes);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ player: nextPlayer, boxes: nextBoxes });
    }
  }

  return false;
}

function addInteriorWalls(level: SokobanLevel, random: () => number): SokobanLevel {
  const occupied = new Set([level.player, ...level.boxes, ...level.goals]);
  const candidates = Array.from({ length: INTERIOR_SIZE * INTERIOR_SIZE }, (_, index) => {
    const row = Math.floor(index / INTERIOR_SIZE) + 1;
    const column = index % INTERIOR_SIZE + 1;
    return row * SOKOBAN_SIZE + column;
  }).filter((cell) => !occupied.has(cell));
  const walls: number[] = [];
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [candidates[index], candidates[target]] = [candidates[target], candidates[index]];
  }
  for (const cell of candidates) {
    if (walls.length >= 5) break;
    const candidate = { ...level, walls: [...walls, cell] };
    if (isSokobanLevelSolvable(candidate)) walls.push(cell);
  }
  return { ...level, walls };
}

export function createSokobanLevel(random = Math.random): SokobanLevel {
  const interior = Array.from({ length: INTERIOR_SIZE * INTERIOR_SIZE }, (_, index) => {
    const row = Math.floor(index / INTERIOR_SIZE) + 1;
    const column = index % INTERIOR_SIZE + 1;
    return row * SOKOBAN_SIZE + column;
  });

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const goals = shufflePositions(interior, random).slice(0, 3);
    const reserved = new Set(goals);
    const boxes: number[] = [];
    let valid = true;

    for (const goal of goals) {
      const candidates: { start: number; path: number[]; behind: number }[] = [];
      for (const delta of DIRECTIONS) {
        for (let distance = 1; distance <= 3; distance += 1) {
          const start = goal - delta * distance;
          const behind = start - delta;
          const path = Array.from({ length: distance + 1 }, (_, step) => start + delta * step);
          if (!isInterior(behind) || !path.every(isInterior) || reserved.has(behind)) continue;
          if (path.some((cell) => cell !== goal && reserved.has(cell))) continue;
          candidates.push({ start, path, behind });
        }
      }

      const chosenIndex = shufflePositions(candidates.map((_, index) => index), random)[0];
      const chosen = chosenIndex === undefined ? undefined : candidates[chosenIndex];
      if (!chosen) {
        valid = false;
        break;
      }

      boxes.push(chosen.start);
      chosen.path.forEach((cell) => reserved.add(cell));
      reserved.add(chosen.behind);
    }

    if (!valid || boxes.length !== 3) continue;
    const playerOptions = shufflePositions(
      interior.filter((cell) => !reserved.has(cell)),
      random,
    );
    if (!playerOptions.length) continue;

    const level = { player: playerOptions[0], boxes, goals, walls: [] };
    if (isSokobanLevelSolvable(level)) {
      const decorated = addInteriorWalls(level, random);
      if (decorated.walls.length >= 3 && isSokobanLevelSolvable(decorated)) return decorated;
    }
  }

  if (!isSokobanLevelSolvable(SOKOBAN_FALLBACK_LEVEL)) {
    throw new Error("The fallback Sokoban level must remain solvable.");
  }
  return {
    player: SOKOBAN_FALLBACK_LEVEL.player,
    boxes: [...SOKOBAN_FALLBACK_LEVEL.boxes],
    goals: [...SOKOBAN_FALLBACK_LEVEL.goals],
    walls: [...SOKOBAN_FALLBACK_LEVEL.walls],
  };
}
