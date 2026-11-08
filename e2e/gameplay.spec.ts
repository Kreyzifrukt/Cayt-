import { expect, test, type Page } from "@playwright/test";

type OpenedGame = {
  root: ReturnType<Page["locator"]>;
  runtimeErrors: string[];
};

async function openGame(page: Page, index: number): Promise<OpenedGame> {
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

function expectNoRuntimeErrors(errors: string[]) {
  expect(errors, "uncaught browser runtime errors").toEqual([]);
}

test.describe("gameplay input checks", () => {
  test("01 · Snake starts and responds to keyboard input", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 0);
    await root.getByRole("button", { name: "START RUN" }).click();
    await page.keyboard.press("ArrowUp");
    await expect(root.locator(".snake-board .snake-cell")).toHaveCount(256);
    await expect(root.locator(".game-live")).toContainText("IN PROGRESS");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("02 · 2048 accepts directional keyboard moves", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 1);
    const board = root.locator(".board-2048");
    await expect(board.locator(".tile")).toHaveCount(16);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowRight");
    await expect(board).toContainText(/2|4/);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("03 · Memory reveals cards and counts a pair attempt", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 2);
    await root.locator(".memory-card[aria-label='Hidden card']").first().click();
    await expect(root.locator(".memory-card.revealed")).toHaveCount(1);
    await root.locator(".memory-card[aria-label='Hidden card']").first().click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("04 · XO places the player mark and makes a CPU reply", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 3);
    await root.locator(".xo-cell").nth(4).click();
    await expect(root.locator(".xo-cell.x-mark")).toHaveCount(1);
    await expect(root.locator(".xo-cell").filter({ hasText: /^O$/ })).toHaveCount(1);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("05 · Reflex rejects an early second tap", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 4);
    const zone = root.locator(".reflex-zone");
    await zone.click();
    await expect(zone).toContainText("WAIT FOR GREEN");
    await zone.click();
    await expect(zone).toContainText("TOO EARLY!");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("06 · Lights Out applies a move and updates the counter", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 5);
    await expect(root.locator(".light-cell")).toHaveCount(25);
    await root.locator(".light-cell").nth(12).click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("07 · Tap Blitz scores a hit on the active target", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 6);
    await root.getByRole("button", { name: "START ROUND" }).click();
    await root.locator(".tap-cell.is-target").click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("08 · Word Scramble places a selected letter in the answer", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 7);
    await root.locator(".letter-tile").first().click();
    await expect(root.locator(".word-answer span").first()).not.toBeEmpty();
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("09 · Minesweeper protects the first click and reveals a safe cell", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 8);
    const firstCell = root.locator(".mine-grid button").first();
    await firstCell.click();
    await expect(firstCell).toHaveClass(/revealed/);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("10 · Tetris exposes a 10×20 field and accepts piece controls", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 9);
    await expect(root.locator(".tetris-board > span")).toHaveCount(200);
    await root.getByRole("button", { name: "ROTATE" }).click();
    await root.getByRole("button", { name: "DOWN" }).click();
    await expect(root.locator(".tetris-board > span")).toHaveCount(200);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("11 · Breakout paddle responds to directional controls", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 10);
    const paddle = root.locator(".breakout-paddle");
    const before = await paddle.getAttribute("style");
    await root.getByRole("button", { name: "RIGHT" }).click();
    await expect(paddle).not.toHaveAttribute("style", before ?? "");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("12 · Pong paddle responds to directional controls", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 11);
    const paddle = root.locator(".pong-you");
    const before = await paddle.getAttribute("style");
    await root.getByRole("button", { name: "MOVE UP" }).click();
    await expect(paddle).not.toHaveAttribute("style", before ?? "");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("13 · Simon Says plays a sequence and accepts the correct first input", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 12);
    await root.getByRole("button", { name: "START", exact: true }).click();
    const activeButton = root.locator(".simon-grid button.simon-active");
    await expect(activeButton).toBeVisible();
    const firstIndex = await activeButton.evaluate((element) =>
      Array.from(element.parentElement!.children).indexOf(element),
    );
    await expect(root.locator(".simon-grid button").first()).toBeEnabled();
    await root.locator(".simon-grid button").nth(firstIndex).click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("14 · Hangman records a guessed letter and locks that key", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 13);
    const letter = root.getByRole("button", { name: "A", exact: true });
    await letter.click();
    await expect(letter).toBeDisabled();
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("15 · Connect Four drops a player disc and CPU reply", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 14);
    await root.locator(".drop-column").nth(3).click();
    await expect(root.locator(".connect-grid .disc.red")).toHaveCount(1);
    await expect(root.locator(".connect-grid .disc.yellow")).toHaveCount(1);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("16 · Whack-a-Mole scores a hit on the spawned target", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 15);
    await root.getByRole("button", { name: "START", exact: true }).click();
    await root.locator(".tap-cell.is-target").click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("17 · Math Sprint accepts a correct answer", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 16);
    await root.getByRole("button", { name: "START", exact: true }).click();
    const question = await root.locator(".math-question").innerText();
    const values = question.match(/(\d+)\s*\+\s*(\d+)/);
    expect(values).not.toBeNull();
    const answer = Number(values![1]) + Number(values![2]);
    const input = root.locator("input.collection-input");
    await input.fill(String(answer));
    await input.press("Enter");
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("18 · Color Clash scores the color of the ink, not the word", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 17);
    await root.getByRole("button", { name: "START ROUND" }).click();
    // The initial prompt is RED rendered in BLUE ink.
    await root.getByRole("button", { name: "BLUE", exact: true }).click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("19 · Pattern Recall accepts the displayed sequence in order", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 18);
    await root.locator(".pattern-grid").evaluate((grid) => {
      const sequence: number[] = [];
      (window as Window & { __patternSequence?: number[] }).__patternSequence = sequence;
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          const element = record.target as HTMLElement;
          if (element.classList.contains("pattern-lit")) {
            sequence.push(Array.from(grid.children).indexOf(element));
          }
        }
      });
      observer.observe(grid, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    });

    await root.getByRole("button", { name: "START ROUND" }).click();
    await expect(root.locator(".result b")).toHaveText("REPEAT IT", { timeout: 5_000 });
    const sequence = await page.evaluate(
      () => (window as Window & { __patternSequence?: number[] }).__patternSequence ?? [],
    );
    expect(sequence).toHaveLength(3);
    for (const index of sequence) {
      await root.locator(".pattern-grid button").nth(index).click();
    }
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("20 · Higher or Lower accepts a card prediction", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 19);
    await root.getByRole("button", { name: "HIGHER" }).click();
    await expect(root.locator(".card-number")).toHaveText(/^\d+$/);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("21 · Typing Rush accepts the exact prompt and finishes the run", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 20);
    const prompt = await root.locator(".typing-prompt").innerText();
    await root.getByRole("button", { name: "START", exact: true }).click();
    await root.locator("textarea.collection-input").fill(prompt);
    await expect(root.locator(".game-score b")).toHaveText(String(prompt.length));
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("22 · Number Hunt completes all 25 ordered targets and records rewards once", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 21);
    await expect(root.locator(".number-grid button")).toHaveCount(100);
    await expect(root.locator(".number-hunt-meta")).toContainText("TIME");
    for (let number = 1; number <= 100; number += 1) {
      await root.getByRole("button", { name: `Number ${number}`, exact: true }).click();
    }
    await expect(root.locator(".result")).toContainText("ALL 100 FOUND");
    await expect(root.getByRole("button", { name: "Number 100", exact: true })).toBeDisabled();
    const save = await page.evaluate(() => {
      const raw = localStorage.getItem("neon-arcade-save");
      return raw ? JSON.parse(raw) as { xp: number; coins: number; played: number; wins: number; history: { score: number }[] } : null;
    });
    await expect.poll(() => page.evaluate(() => {
      const raw = localStorage.getItem("neon-arcade-save");
      return raw ? (JSON.parse(raw) as { played: number }).played : 0;
    })).toBe(1);
    expect(save).not.toBeNull();
    expect(save).toMatchObject({ played: 1, wins: 1 });
    const score = save!.history[0].score;
    expect(save!.xp).toBe(Math.max(5, Math.round(score / 5) + 10));
    expect(save!.coins).toBe(Math.max(1, Math.floor(score / 100)));
    expect(save!.history).toHaveLength(1);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("23 · Mini Sudoku accepts a cell value and keeps incomplete submission disabled", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 22);
    const firstEmpty = root.locator(".sudoku-grid select").first();
    await firstEmpty.selectOption("2");
    await expect(root.locator(".game-score b")).toHaveText("1");
    await expect(root.getByRole("button", { name: "CHECK SOLUTION" })).toBeDisabled();
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("24 · 15-Puzzle moves a tile adjacent to the empty cell", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 23);
    const blank = root.locator(".fifteen-board button.empty");
    const blankIndex = await blank.evaluate((element) =>
      Array.from(element.parentElement!.children).indexOf(element),
    );
    const candidates = [
      blankIndex % 4 > 0 ? blankIndex - 1 : -1,
      blankIndex % 4 < 3 ? blankIndex + 1 : -1,
      blankIndex >= 4 ? blankIndex - 4 : -1,
      blankIndex < 12 ? blankIndex + 4 : -1,
    ];
    const moveIndex = candidates.find((index) => index >= 0);
    expect(moveIndex).toBeGreaterThanOrEqual(0);
    await root.locator(".fifteen-board button").nth(moveIndex!).click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("25 · Sokoban responds to a valid direction", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 24);
    await root.locator(".retro-pad").getByRole("button", { name: "↑" }).click();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("26 · Reversi accepts a legal opening move and lets the CPU respond", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 25);
    await root.locator(".reversi-cell:not(:disabled)").first().click();
    await expect.poll(async () =>
      (await root.locator(".reversi-cell i.mint-disc").count()) +
      (await root.locator(".reversi-cell i.cpu-disc").count()),
    ).toBeGreaterThanOrEqual(6);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("27 · Mastermind submits a guess and adds feedback to history", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 26);
    await root.getByRole("button", { name: "Select slot 1" }).click();
    await root.getByRole("button", { name: "Choose color 2" }).click();
    await expect(root.locator(".master-active-slot")).toHaveText("EDITING SLOT 2 OF 4");
    await root.getByRole("button", { name: "SUBMIT GUESS" }).click();
    await expect(root.locator(".master-history > div")).toHaveCount(1);
    await expect(root.locator(".master-feedback-help")).toContainText("EXACT");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("28 · Blackjack deals a hand and resolves it with stand", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 27);
    await root.getByRole("button", { name: "DEAL" }).click();
    await expect(root.locator(".blackjack-table .playing-cards").nth(1).locator("b")).toHaveCount(2);
    const stand = root.getByRole("button", { name: "STAND" });
    if (await stand.isEnabled()) await stand.click();
    await expect(root.locator(".retro-status")).not.toBeEmpty();
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("29 · Frogger moves the player one safe row forward", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 28);
    await root.locator(".retro-pad").getByRole("button", { name: "↑" }).click();
    const frogIndex = await root.locator(".frogger-board .frog").evaluate((element) =>
      Array.from(element.parentElement!.children).indexOf(element),
    );
    expect(frogIndex).toBe(67);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("30 · Gem Match accepts a legal adjacent swap and explains rejected moves", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 29);
    const move = await root.locator(".match-board").evaluate((board) => {
      const cells = Array.from(board.querySelectorAll("button")) as HTMLButtonElement[];
      const values = cells.map((cell) => {
        const name = Array.from(cell.classList).find((value) => value.startsWith("gem-") && value !== "gem-selected");
        return name ?? "";
      });
      const makesMatch = (grid: string[]) => {
        for (let row = 0; row < 7; row += 1) {
          for (let column = 0; column < 7; column += 1) {
            const value = grid[row * 7 + column];
            if (column <= 4 && value === grid[row * 7 + column + 1] && value === grid[row * 7 + column + 2]) return true;
            if (row <= 4 && value === grid[(row + 1) * 7 + column] && value === grid[(row + 2) * 7 + column]) return true;
          }
        }
        return false;
      };
      for (let index = 0; index < values.length; index += 1) {
        for (const neighbor of [index + 1, index + 7]) {
          if (neighbor >= values.length || (neighbor === index + 1 && index % 7 === 6)) continue;
          const swapped = [...values];
          [swapped[index], swapped[neighbor]] = [swapped[neighbor], swapped[index]];
          if (makesMatch(swapped)) return [index, neighbor];
        }
      }
      return null;
    });
    expect(move).not.toBeNull();
    await root.locator(".match-board .gem").nth(move![0]).click();
    await expect(root.locator(".match-board .gem.selected")).toHaveCount(1);
    await root.locator(".match-board .gem").nth(move![1]).click();
    await expect(root.locator(".retro-status")).toContainText("MATCH!");
    await expect(root.locator(".game-score b")).not.toHaveText("0");
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("31 · Maze Runner moves through an open corridor", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 30);
    await expect(root.locator(".maze-board")).toBeVisible();
    await expect(root.locator(".maze-cell")).toHaveCount(81);
    await page.keyboard.press("ArrowRight");
    await expect(root.locator(".game-score b")).toHaveText("1");
    const runnerIndex = await root.locator(".maze-board .runner").evaluate((element) =>
      Array.from(element.parentElement!.children).indexOf(element),
    );
    expect(runnerIndex).toBe(11);
    expectNoRuntimeErrors(runtimeErrors);
  });
});

test.describe("mobile touch controls", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("mobile Frogger control accepts a real touch event", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 28);
    await root.locator(".retro-pad").getByRole("button", { name: "↑" }).tap();
    const frogIndex = await root.locator(".frogger-board .frog").evaluate((element) =>
      Array.from(element.parentElement!.children).indexOf(element),
    );
    expect(frogIndex).toBe(67);
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(horizontalOverflow).toBe(false);
    expectNoRuntimeErrors(runtimeErrors);
  });

  test("mobile Sokoban control accepts a real touch event", async ({ page }) => {
    const { root, runtimeErrors } = await openGame(page, 24);
    await root.locator(".retro-pad").getByRole("button", { name: "↑" }).tap();
    await expect(root.locator(".game-score b")).toHaveText("1");
    expectNoRuntimeErrors(runtimeErrors);
  });
});
