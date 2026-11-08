import { expect, test, type Page } from "@playwright/test";

async function openGame(page: Page, index: number) {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/");
  const menuButton = page.locator(".menu-button");
  if (await menuButton.isVisible()) await menuButton.click();
  const games = page.locator(".sidebar-games button.nav");
  await expect(games).toHaveCount(31);
  await games.nth(index).click();
  const root = page.locator(".playfield");
  await expect(root.locator(".engine")).toBeVisible();
  return { root, runtimeErrors };
}

function assertNoRuntimeErrors(errors: string[]) {
  expect(errors, "uncaught browser runtime errors").toEqual([]);
}

function solveLightsOut(initial: boolean[]): number[] {
  const rows = Array.from({ length: 25 }, (_, cell) => {
    const row = Math.floor(cell / 5);
    const column = cell % 5;
    const effects = Array.from({ length: 25 }, (_, press) => {
      const pressRow = Math.floor(press / 5);
      const pressColumn = press % 5;
      return Math.abs(row - pressRow) + Math.abs(column - pressColumn) <= 1 ? 1 : 0;
    });
    return [...effects, initial[cell] ? 1 : 0];
  });

  let pivotRow = 0;
  const pivotColumns: number[] = [];
  for (let column = 0; column < 25; column += 1) {
    const candidate = rows.findIndex((row, index) => index >= pivotRow && row[column] === 1);
    if (candidate < 0) continue;
    [rows[pivotRow], rows[candidate]] = [rows[candidate], rows[pivotRow]];
    for (let row = 0; row < 25; row += 1) {
      if (row === pivotRow || rows[row][column] === 0) continue;
      for (let cell = column; cell <= 25; cell += 1) {
        rows[row][cell] ^= rows[pivotRow][cell];
      }
    }
    pivotColumns.push(column);
    pivotRow += 1;
  }

  for (const row of rows) {
    if (row.slice(0, 25).every((value) => value === 0) && row[25] === 1) {
      throw new Error("The displayed Lights Out board has no solution.");
    }
  }

  const solution = Array(25).fill(0) as number[];
  pivotColumns.forEach((column, row) => {
    solution[column] = rows[row][25];
  });
  return solution.flatMap((pressed, index) => (pressed ? [index] : []));
}

async function solveMaze(root: ReturnType<Page["locator"]>): Promise<string[]> {
  return root.locator(".maze-board").evaluate((board) => {
    const cells = Array.from(board.children) as HTMLElement[];
    const start = cells.findIndex((cell) => cell.classList.contains("runner"));
    const key = cells.findIndex((cell) => cell.classList.contains("key-cell"));
    const exit = cells.findIndex((cell) => cell.classList.contains("exit-cell"));
    const directions = [
      { delta: -9, key: "ArrowUp" },
      { delta: 9, key: "ArrowDown" },
      { delta: -1, key: "ArrowLeft" },
      { delta: 1, key: "ArrowRight" },
    ];

    const shortestPath = (from: number, to: number): string[] => {
      const queue = [from];
      const previous = new Map<number, { parent: number; key: string }>();
      previous.set(from, { parent: -1, key: "" });
      for (let cursor = 0; cursor < queue.length && !previous.has(to); cursor += 1) {
        const current = queue[cursor];
        for (const direction of directions) {
          const next = current + direction.delta;
          if (next < 0 || next >= cells.length) continue;
          if (direction.delta === -1 && current % 9 === 0) continue;
          if (direction.delta === 1 && current % 9 === 8) continue;
          if (cells[next].classList.contains("wall") || previous.has(next)) continue;
          previous.set(next, { parent: current, key: direction.key });
          queue.push(next);
        }
      }
      if (!previous.has(to)) throw new Error("Maze target is unreachable.");
      const path: string[] = [];
      let position = to;
      while (position !== from) {
        const step = previous.get(position)!;
        path.push(step.key);
        position = step.parent;
      }
      return path.reverse();
    };

    return [...shortestPath(start, key), ...shortestPath(key, exit)];
  });
}

async function solveSokoban(root: ReturnType<Page["locator"]>): Promise<string[]> {
  return root.locator(".sokoban-board").evaluate((board) => {
    const cells = Array.from(board.children) as HTMLElement[];
    const walls = new Set(cells.flatMap((cell, index) => cell.classList.contains("wall") ? [index] : []));
    const goals = new Set(cells.flatMap((cell, index) => cell.classList.contains("goal") ? [index] : []));
    const boxes = cells.flatMap((cell, index) => cell.classList.contains("box") ? [index] : []);
    const player = cells.findIndex((cell) => cell.classList.contains("player"));
    const directions = [
      { delta: -8, key: "ArrowUp" },
      { delta: 8, key: "ArrowDown" },
      { delta: -1, key: "ArrowLeft" },
      { delta: 1, key: "ArrowRight" },
    ];
    const encode = (position: number, crates: number[]) => position + "|" + crates.join(",");
    const initial = { position: player, crates: boxes.sort((a, b) => a - b), path: [] as string[] };
    const queue = [initial];
    const visited = new Set([encode(initial.position, initial.crates)]);

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const state = queue[cursor];
      if (state.crates.every((crate) => goals.has(crate))) return state.path;

      for (const direction of directions) {
        const next = state.position + direction.delta;
        if (next < 0 || next >= cells.length) continue;
        if (direction.delta === -1 && state.position % 8 === 0) continue;
        if (direction.delta === 1 && state.position % 8 === 7) continue;
        if (walls.has(next)) continue;

        let crates = state.crates;
        const boxIndex = crates.indexOf(next);
        if (boxIndex >= 0) {
          const beyond = next + direction.delta;
          if (beyond < 0 || beyond >= cells.length || walls.has(beyond) || crates.includes(beyond)) continue;
          crates = [...crates];
          crates[boxIndex] = beyond;
          crates.sort((a, b) => a - b);
        }

        const key = encode(next, crates);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ position: next, crates, path: [...state.path, direction.key] });
      }
    }
    throw new Error("The current Sokoban level has no solution.");
  });
}

test("Lights Out can be solved from the rendered board and records the win", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 5);
  const state = await root.locator(".light-cell").evaluateAll((cells) =>
    cells.map((cell) => cell.getAttribute("aria-pressed") === "true"),
  );
  const solution = solveLightsOut(state);
  expect(solution.length).toBeGreaterThan(0);
  for (const index of solution) {
    await root.locator(".light-cell").nth(index).click();
  }
  await expect(root.locator(".result b")).toHaveText("ALL LIGHTS OUT. CLEAN WORK.");
  await expect.poll(() => page.evaluate(() => {
    const raw = localStorage.getItem("neon-arcade-save");
    return raw ? (JSON.parse(raw) as { wins: number }).wins : 0;
  })).toBe(1);
  assertNoRuntimeErrors(runtimeErrors);
});

test("Word Scramble completes all five words using the displayed letter tiles", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 7);
  const words = ["PLANET", "PUZZLE", "GALAXY", "ROCKET", "ARCADE"];

  for (const word of words) {
    const tiles = root.locator(".letter-tile");
    const letters = (await tiles.allTextContents()).map((letter) => letter.trim());
    const used = new Set<number>();
    for (const letter of word) {
      const index = letters.findIndex((candidate, position) => candidate === letter && !used.has(position));
      expect(index, "every target letter must be present in the letter bank").toBeGreaterThanOrEqual(0);
      used.add(index);
      await tiles.nth(index).click();
    }
    await root.getByRole("button", { name: "CHECK WORD", exact: true }).click();
  }

  await expect(root.locator(".result b")).toHaveText("FIVE FOR FIVE. WORDSMITH STATUS.");
  await expect.poll(() => page.evaluate(() => {
    const raw = localStorage.getItem("neon-arcade-save");
    return raw ? (JSON.parse(raw) as { wins: number }).wins : 0;
  })).toBe(1);
  assertNoRuntimeErrors(runtimeErrors);
});

test("Mini Sudoku validates a complete correct 4×4 solution and records the result", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 22);
  const solution = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
  const editableIndexes = [1, 2, 4, 7, 8, 11, 13, 14];
  const selects = root.locator(".sudoku-grid select");

  for (let index = 0; index < editableIndexes.length; index += 1) {
    await selects.nth(index).selectOption(String(solution[editableIndexes[index]]));
  }

  await root.getByRole("button", { name: "CHECK SOLUTION" }).click();
  await expect(root.locator(".result b")).toHaveText("CHECK COMPLETE");
  await expect.poll(() => page.evaluate(() => {
    const raw = localStorage.getItem("neon-arcade-save");
    if (!raw) return 0;
    return (JSON.parse(raw) as { wins: number }).wins;
  })).toBe(1);
  assertNoRuntimeErrors(runtimeErrors);
});

test("Maze Runner finds its key, reaches the exit and completes the game", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 30);
  const path = await solveMaze(root);
  expect(path.length).toBeGreaterThan(0);
  for (const key of path) {
    await page.keyboard.press(key);
  }
  await expect(root.locator(".result b")).toHaveText("MAZE CLEARED");
  await expect(root.locator(".retro-status")).toContainText("KEY ACQUIRED");
  assertNoRuntimeErrors(runtimeErrors);
});

test("Sokoban solves the complete level without pushing a crate through a wall", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 24);
  const path = await solveSokoban(root);
  expect(path.length).toBeGreaterThan(0);
  for (const key of path) {
    await page.keyboard.press(key);
  }
  await expect(root.locator(".result b")).toHaveText("ALL CRATES STORED");
  assertNoRuntimeErrors(runtimeErrors);
});

test("XO reaches a valid terminal state against the CPU", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 3);
  for (let turn = 0; turn < 9 && !(await root.locator(".result").count()); turn += 1) {
    const move = root.locator(".xo-cell:not(:disabled)").first();
    if (!(await move.count())) break;
    await move.click();
  }
  await expect(root.locator(".result")).toBeVisible();
  const result = (await root.locator(".result b").innerText()).trim();
  expect(["NICE MOVES. VICTORY.", "A PERFECT STALEMATE.", "THE CPU GOT YOU."]).toContain(result);
  assertNoRuntimeErrors(runtimeErrors);
});

test("Connect Four reaches a terminal win or draw without accepting a full column", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 14);
  for (let move = 0; move < 42 && !(await root.locator(".result").count()); move += 1) {
    const column = await root.locator(".connect-grid").evaluate((grid) => {
      for (let index = 0; index < 7; index += 1) {
        const cell = grid.children[7 + index] as HTMLElement;
        if (!cell.classList.contains("red") && !cell.classList.contains("yellow")) return index;
      }
      return -1;
    });
    if (column < 0) break;
    await root.locator(".drop-column").nth(column).click();
  }
  await expect(root.locator(".result")).toBeVisible();
  await expect(root.locator(".result b")).toHaveText(/YOU WIN|CPU WINS|DRAW/);
  assertNoRuntimeErrors(runtimeErrors);
});

test("Reversi runs to a terminal board state through consecutive legal moves", async ({ page }) => {
  const { root, runtimeErrors } = await openGame(page, 25);
  for (let move = 0; move < 60 && !(await root.locator(".result").count()); move += 1) {
    const legal = root.locator(".reversi-cell:not(:disabled)");
    if (!(await legal.count())) break;
    await legal.first().click();
  }
  await expect(root.locator(".result")).toBeVisible();
  await expect(root.locator(".result b")).toHaveText(/YOU WIN|DRAW|CPU WINS/);
  assertNoRuntimeErrors(runtimeErrors);
});

test("Hangman wins when all letters in the hidden word are guessed", async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  const { root, runtimeErrors } = await openGame(page, 13);
  for (const letter of ["O", "R", "B", "I", "T"]) {
    await root.getByRole("button", { name: letter, exact: true }).click();
  }
  await expect(root.locator(".result b")).toHaveText("WORD SAVED");
  await expect.poll(() => page.evaluate(() => {
    const raw = localStorage.getItem("neon-arcade-save");
    return raw ? (JSON.parse(raw) as { wins: number }).wins : 0;
  })).toBe(1);
  assertNoRuntimeErrors(runtimeErrors);
});

test("Mastermind completes the eight-attempt loss path and locks input", async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  const { root, runtimeErrors } = await openGame(page, 26);
  const submit = root.getByRole("button", { name: "SUBMIT GUESS", exact: true });
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await submit.click();
  }
  await expect(root.locator(".master-history > div")).toHaveCount(8);
  await expect(submit).toBeDisabled();
  await expect(root.locator(".result b")).toHaveText("CODE: 1 · 1 · 1 · 1");
  assertNoRuntimeErrors(runtimeErrors);
});

test("Higher or Lower can reach the ten-correct-prediction victory condition", async ({ page }) => {
  await page.addInitScript(() => {
    const values = [0.999, 0, 0.999, 0, 0.999, 0, 0.999, 0, 0.999, 0];
    let index = 0;
    Math.random = () => values[index++ % values.length];
  });
  const { root, runtimeErrors } = await openGame(page, 19);
  const guesses = ["HIGHER", "LOWER", "HIGHER", "LOWER", "HIGHER", "LOWER", "HIGHER", "LOWER", "HIGHER", "LOWER"];
  for (const guess of guesses) {
    await root.getByRole("button", { name: guess, exact: true }).click();
  }
  await expect(root.locator(".result b")).toHaveText("10 CORRECT GUESSES");
  assertNoRuntimeErrors(runtimeErrors);
});
