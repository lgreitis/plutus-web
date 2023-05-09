import { expect, test } from "@playwright/test";
import { prisma } from "src/server/db";

test("logged in user automaticaly gets redirected to overview", async ({
  page,
}) => {
  await page.goto("/");

  await page.waitForURL("**/overview");

  await expect(page.getByText("Portfolio value")).toBeVisible();
  await expect(page.getByText("Value by category")).toBeVisible();
  await expect(page.getByText("Friends")).toBeVisible();
});

test("try favourite and unfavourite items", async ({ page }) => {
  await page.goto("/");

  await page.waitForURL("**/overview");

  await page.getByRole("link", { name: "Inventory" }).click();

  await expect(
    page.getByText(" Butterfly Knife | Night (Field-Tested)")
  ).toBeVisible();

  await page
    .locator(
      'button[name="Favourite ★ Butterfly Knife \\| Night \\(Field-Tested\\)"]'
    )
    .click();

  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("status").filter({ hasText: "Item added to favourites." })
  ).toBeVisible();

  await page
    .locator(
      'button[name="Favourite ★ Butterfly Knife \\| Night \\(Field-Tested\\)"]'
    )
    .click();

  await page.waitForLoadState("networkidle");

  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Item removed from favourites." })
  ).toBeVisible();
});

test("gets overview statistics", async ({ page }) => {
  await page.goto("/");

  await page.waitForURL("**/overview");

  await expect(page.getByTitle("Items in inventory")).toHaveText("2");
  await expect(page.getByTitle("Invested")).toHaveText("$200.00");
  await expect(page.getByTitle("Total value")).toHaveText("$60.00");
  await expect(page.getByTitle("Difference")).toHaveText("-$140.00");
});

test("edits item data", async ({ page }) => {
  await page.goto("/");

  await page.waitForURL("**/overview");
  await page.getByRole("link", { name: "Inventory" }).click();

  await page
    .locator(
      'button[name="Edit ★ Butterfly Knife \\| Night \\(Field-Tested\\)"]'
    )
    .click();

  await page.locator('button[name="Edit buy date"]').click();
  await page.getByRole("row", { name: "1 2 3 4 5 6" }).getByText("3").click();

  await page.locator('input[name="Input buy price"]').fill("130");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForLoadState("networkidle");
  await page.locator('[id="headlessui-dialog-\\:rv\\:"] path').first().click();

  await page.getByRole("link", { name: "Overview" }).click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByTitle("Items in inventory")).toHaveText("2");
  await expect(page.getByTitle("Invested")).toHaveText("$230.00");
  await expect(page.getByTitle("Total value")).toHaveText("$60.00");
  await expect(page.getByTitle("Difference")).toHaveText("-$170.00");

  // set back data
  await page.getByRole("link", { name: "Inventory" }).click();
  await page
    .locator(
      'button[name="Edit ★ Butterfly Knife \\| Night \\(Field-Tested\\)"]'
    )
    .click();
  await page.locator('input[name="Input buy price"]').fill("100");
  await page.getByRole("button", { name: "Save" }).click();
});

test("user changes currency", async ({ page }) => {
  await prisma.exchangeRate.create({
    data: {
      baseCurrency: "USD",
      conversionCurrency: "EUR",
      rate: 1.1,
      timestamp: new Date().getTime(),
    },
  });
  await prisma.exchangeRate.create({
    data: {
      baseCurrency: "USD",
      conversionCurrency: "USD",
      rate: 1,
      timestamp: new Date().getTime(),
    },
  });

  await page.goto("/");

  await page.waitForURL("**/overview");

  await page.pause();

  await page.getByRole("img", { name: "skitmos" }).click();
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await page.getByRole("button", { name: "USD" }).click();
  await page.getByText("EUR").click();
  await page.getByRole("button", { name: "Save" }).first().click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: "Overview" }).click();

  await expect(page.getByTitle("Items in inventory")).toHaveText("2");
  await expect(page.getByTitle("Invested")).toHaveText("€200.00");
  await expect(page.getByTitle("Total value")).toHaveText("€66.00");
  await expect(page.getByTitle("Difference")).toHaveText("-€134.00");

  // sets back
  await page.getByRole("img", { name: "skitmos" }).click();
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await page.getByRole("button", { name: "EUR" }).click();
  // Nth 1 because description has USD text
  await page.getByText("USD").nth(1).click();
  await page.getByRole("button", { name: "Save" }).first().click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: "Overview" }).click();

  await page.waitForLoadState("networkidle");

  await expect(page.getByTitle("Items in inventory")).toHaveText("2");
  await expect(page.getByTitle("Invested")).toHaveText("$200.00");
  await expect(page.getByTitle("Total value")).toHaveText("$60.00");
  await expect(page.getByTitle("Difference")).toHaveText("-$140.00");
});
