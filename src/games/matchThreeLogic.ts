export type GemGrid = number[][];

const GRID_SIZE = 7;
const GEM_TYPES = 5;

export function findGemMatches(grid: GemGrid): Set<number> {
  const matches = new Set<number>();
  const rows = grid.length;
  const columns = grid[0]?.length ?? 0;

  for (let row = 0; row < rows; row += 1) {
    let column = 0;
    while (column < columns) {
      const gem = grid[row][column];
      let end = column + 1;
      while (end < columns && grid[row][end] === gem) end += 1;
      if (gem >= 0 && end - column >= 3) {
        for (let current = column; current < end; current += 1) {
          matches.add(row * columns + current);
        }
      }
      column = end;
    }
  }

  for (let column = 0; column < columns; column += 1) {
    let row = 0;
    while (row < rows) {
      const gem = grid[row][column];
      let end = row + 1;
      while (end < rows && grid[end][column] === gem) end += 1;
      if (gem >= 0 && end - row >= 3) {
        for (let current = row; current < end; current += 1) {
          matches.add(current * columns + column);
        }
      }
      row = end;
    }
  }

  return matches;
}

export function hasPossibleGemMove(grid: GemGrid): boolean {
  const rows = grid.length;
  const columns = grid[0]?.length ?? 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      for (const [nextRow, nextColumn] of [[row, column + 1], [row + 1, column]]) {
        if (nextRow >= rows || nextColumn >= columns) continue;
        [grid[row][column], grid[nextRow][nextColumn]] = [grid[nextRow][nextColumn], grid[row][column]];
        const valid = findGemMatches(grid).size > 0;
        [grid[row][column], grid[nextRow][nextColumn]] = [grid[nextRow][nextColumn], grid[row][column]];
        if (valid) return true;
      }
    }
  }
  return false;
}

function createFallbackGemBoard(): GemGrid {
  const grid = Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, column) => (row * 2 + column) % GEM_TYPES),
  );
  grid[0][2] = 0;
  grid[1][1] = 0;
  return grid;
}

export function createGemBoard(random = Math.random): GemGrid {
  const grid = Array.from({ length: GRID_SIZE }, () => Array<number>(GRID_SIZE).fill(-1));

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const candidates = Array.from({ length: GEM_TYPES }, (_, index) => index);
      for (let index = candidates.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(random() * (index + 1));
        [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
      }
      const gem = candidates.find((candidate) => !(
        (column >= 2 && grid[row][column - 1] === candidate && grid[row][column - 2] === candidate) ||
        (row >= 2 && grid[row - 1][column] === candidate && grid[row - 2][column] === candidate)
      ));
      grid[row][column] = gem ?? 0;
    }
  }

  return hasPossibleGemMove(grid) ? grid : createFallbackGemBoard();
}

export function resolveGemCascades(
  source: GemGrid,
  random = Math.random,
): { board: GemGrid; cleared: number; cascades: number } {
  const board = source.map((row) => [...row]);
  let cleared = 0;
  let cascades = 0;

  while (cascades < GRID_SIZE * GRID_SIZE) {
    const matches = findGemMatches(board);
    if (matches.size === 0) break;

    cleared += matches.size;
    cascades += 1;
    matches.forEach((index) => {
      board[Math.floor(index / GRID_SIZE)][index % GRID_SIZE] = -1;
    });

    for (let column = 0; column < GRID_SIZE; column += 1) {
      const remaining = board.map((row) => row[column]).filter((gem) => gem >= 0);
      const fill = Array.from({ length: GRID_SIZE - remaining.length }, () =>
        Math.floor(random() * GEM_TYPES),
      );
      [...fill, ...remaining].forEach((gem, row) => {
        board[row][column] = gem;
      });
    }
  }

  return { board, cleared, cascades };
}


/**
 * Keep a resolved board playable. A random refill can leave no legal swaps,
 * even when the initial board was generated correctly.
 */
export function ensurePlayableGemBoard(
  board: GemGrid,
  random = Math.random,
): GemGrid {
  return hasPossibleGemMove(board) ? board : createGemBoard(random);
}
