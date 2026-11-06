export type PuzzleDirection = "left" | "right" | "up" | "down";

export function merge2048Line(source: number[]): { line: number[]; score: number } {
  const values = source.filter(Boolean);
  let score = 0;
  for (let index = 0; index < values.length - 1; index += 1) {
    if (values[index] === values[index + 1]) {
      values[index] *= 2;
      score += values[index];
      values.splice(index + 1, 1);
    }
  }
  return { line: [...values, ...Array(4 - values.length).fill(0)], score };
}

export function move2048(
  board: number[],
  direction: PuzzleDirection,
): { board: number[]; score: number; changed: boolean } {
  const next = Array<number>(16).fill(0);
  let score = 0;
  for (let line = 0; line < 4; line += 1) {
    const indices = Array.from({ length: 4 }, (_, index) => {
      if (direction === "left") return line * 4 + index;
      if (direction === "right") return line * 4 + 3 - index;
      if (direction === "up") return index * 4 + line;
      return (3 - index) * 4 + line;
    });
    const merged = merge2048Line(indices.map((index) => board[index]));
    score += merged.score;
    indices.forEach((index, offset) => {
      next[index] = merged.line[offset];
    });
  }
  return { board: next, score, changed: next.some((value, index) => value !== board[index]) };
}

export function has2048Moves(board: number[]): boolean {
  if (board.some((value) => value === 0)) return true;
  return board.some((value, index) =>
    (index % 4 < 3 && value === board[index + 1]) ||
    (index < 12 && value === board[index + 4]),
  );
}
