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

test("test favourite filter", async ({ page }) => {
  await page.goto("/");

  await page.waitForURL("**/overview");

  await page.getByRole("link", { name: "Inventory" }).click();

  await expect(
    page.getByText(" Butterfly Knife | Night (Field-Tested)")
  ).toBeVisible();

  await expect(
    page.getByText("StatTrak™ M4A1-S | Hyper Beast (Minimal Wear)")
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

  await page.getByRole("button", { name: "Favourites" }).click();

  await expect(
    page.getByText("Butterfly Knife | Night (Field-Tested)")
  ).toBeVisible();

  await expect(
    page.getByText("StatTrak™ M4A1-S | Hyper Beast (Minimal Wear)")
  ).toBeHidden();

  await page
    .locator(
      'button[name="Favourite ★ Butterfly Knife \\| Night \\(Field-Tested\\)"]'
    )
    .click();

  await expect(
    page.getByText("Butterfly Knife | Night (Field-Tested)")
  ).toBeHidden();
});

test("test column visibility", async ({ page }) => {
  await page.goto("/");

  await page.waitForURL("**/overview");

  await page.getByRole("link", { name: "Inventory" }).click();

  await expect(
    page.getByRole("columnheader", { name: "Buy Price" }).getByText("Buy Price")
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Buy Date" }).getByText("Buy Date")
  ).toBeVisible();

  await page.getByRole("button", { name: "Change column visibility" }).click();
  await page.getByTitle("Change Buy Date").click();
  await page.getByTitle("Change Buy Price").click();

  await expect(
    page.getByRole("columnheader", { name: "Buy Price" }).getByText("Buy Price")
  ).toBeHidden();
  await expect(
    page.getByRole("columnheader", { name: "Buy Date" }).getByText("Buy Date")
  ).toBeHidden();

  await page.getByTitle("Change Buy Date").click();
  await page.getByTitle("Change Buy Price").click();

  await expect(
    page.getByRole("columnheader", { name: "Buy Price" }).getByText("Buy Price")
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Buy Date" }).getByText("Buy Date")
  ).toBeVisible();
});

test("test compare page", async ({ page }) => {
  const items = await prisma.item.findMany({
    select: { marketHashName: true, icon: true, id: true },
  });

  await page.route(
    `http://localhost:3000/api/trpc/search.findItem?batch=1`,
    async (route) => {
      const json = [{ result: { data: { json: { items: items } } } }];
      await route.fulfill({ json });
    }
  );

  await page.goto("/");
  await page.waitForURL("**/overview");

  await page.getByRole("link", { name: "Compare items" }).click();

  await page.getByTitle("Enter first item search value").click();
  await page
    .getByTitle("Enter first item search value")
    .fill("Butterfly Knife | Night (Field-Tested)");
  await page
    .getByRole("option", { name: "Butterfly Knife | Night (Field-Tested)" })
    .click();

  await page.getByTitle("Enter second item search value").click();
  await page
    .getByTitle("Enter second item search value")
    .fill("StatTrak™ M4A1-S | Hyper Beast (Minimal Wear)");
  await page
    .getByRole("option", {
      name: "StatTrak™ M4A1-S | Hyper Beast (Minimal Wear)",
    })
    .click();

  await expect(page.locator("img").nth(1)).toBeVisible();
  await expect(page.locator("img").nth(2)).toBeVisible();
});

test("test command palette", async ({ page }) => {
  const items = await prisma.item.findMany({
    select: { marketHashName: true, icon: true, id: true },
  });

  await page.route(
    `http://localhost:3000/api/trpc/search.findItem?batch=1`,
    async (route) => {
      const json = [{ result: { data: { json: { items: items } } } }];
      await route.fulfill({ json });
    }
  );

  await page.goto("/");
  await page.waitForURL("**/overview");

  await page.waitForLoadState("networkidle");

  await page
    .locator("div")
    .filter({ hasText: /^PlutusSearch for item$/ })
    .locator("svg")
    .nth(1)
    .click();
  await page.getByPlaceholder("Search...").click();
  await page
    .getByPlaceholder("Search...")
    .fill("Butterfly Knife | Night (Field-Tested)");
  await page
    .getByRole("option", { name: "Butterfly Knife | Night (Field-Tested)" })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Butterfly Knife | Night (Field-Tested)",
    })
  ).toBeVisible();
});
