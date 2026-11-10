import { expect, test } from "@playwright/test";

test("all 31 games mount without browser runtime errors", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  const gameButtons = page.locator(".sidebar-games button.nav");
  await expect(gameButtons).toHaveCount(31);

  for (let index = 0; index < 31; index += 1) {
    await gameButtons.nth(index).click();
    await expect(page.locator(".playfield .engine")).toBeVisible();
    await expect(page.locator(".game-page h1")).not.toBeEmpty();
    await page.locator(".back").click();
    await expect(page.locator(".sidebar-games button.nav")).toHaveCount(31);
  }

  expect(pageErrors).toEqual([]);
});

test("a game remains usable at a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".menu-button").click();

  const gameButtons = page.locator(".sidebar.open .sidebar-games button.nav");
  await expect(gameButtons).toHaveCount(31);
  await gameButtons.nth(9).click();

  await expect(page.locator(".playfield .engine")).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
