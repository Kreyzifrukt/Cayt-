export const MINESWEEPER_BOARD_SIZE = 8;

function getNeighbors(index: number): number[] {
  const row = Math.floor(index / MINESWEEPER_BOARD_SIZE);
  const column = index % MINESWEEPER_BOARD_SIZE;
  const neighbors: number[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue;

      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (
        nextRow >= 0 &&
        nextRow < MINESWEEPER_BOARD_SIZE &&
        nextColumn >= 0 &&
        nextColumn < MINESWEEPER_BOARD_SIZE
      ) {
        neighbors.push(nextRow * MINESWEEPER_BOARD_SIZE + nextColumn);
      }
    }
  }

  return neighbors;
}

export function revealSafeCells(
  start: number,
  alreadyOpen: ReadonlySet<number>,
  flags: ReadonlySet<number>,
  mines: ReadonlySet<number>,
): Set<number> {
  const revealed = new Set(alreadyOpen);
  const adjacentMineCount = (index: number) =>
    getNeighbors(index).filter(neighbor => mines.has(neighbor)).length;

  const flood = (index: number) => {
    if (revealed.has(index) || flags.has(index) || mines.has(index)) return;

    revealed.add(index);
    if (adjacentMineCount(index) === 0) {
      getNeighbors(index).forEach(flood);
    }
  };

  flood(start);
  return revealed;
}
