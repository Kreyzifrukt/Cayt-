export const TETROMINOES: number[][] = [
  [0,0,0,0, 1,1,1,1, 0,0,0,0, 0,0,0,0], // I
  [0,1,1,0, 0,1,1,0, 0,0,0,0, 0,0,0,0], // O
  [0,1,0,0, 1,1,1,0, 0,0,0,0, 0,0,0,0], // T
  [0,0,1,0, 1,1,1,0, 0,0,0,0, 0,0,0,0], // L
  [1,0,0,0, 1,1,1,0, 0,0,0,0, 0,0,0,0], // J
  [0,1,1,0, 1,1,0,0, 0,0,0,0, 0,0,0,0], // S
  [1,1,0,0, 0,1,1,0, 0,0,0,0, 0,0,0,0], // Z
];

export function rotateTetromino(shape: number[]): number[] {
  const rotated = Array<number>(16).fill(0);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      rotated[column * 4 + (3 - row)] = shape[row * 4 + column];
    }
  }
  return rotated;
}

export function getTetrominoBlocks(
  shape: number[],
  x: number,
  y: number,
): [number, number][] {
  return shape.flatMap((value, index) =>
    value ? [[x + (index % 4), y + Math.floor(index / 4)] as [number, number]] : [],
  );
}

export function canPlaceTetromino(
  board: number[][],
  shape: number[],
  x: number,
  y: number,
): boolean {
  return getTetrominoBlocks(shape, x, y).every(
    ([column, row]) =>
      column >= 0 && column < 10 && row >= 0 && row < 20 && !board[row][column],
  );
}
