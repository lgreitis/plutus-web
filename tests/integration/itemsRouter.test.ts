import { type inferProcedureInput } from "@trpc/server";
import { sub } from "date-fns";
import { appRouter, type AppRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import { prisma } from "src/server/db";
import { databaseWipe } from "tests/utils/databaseWipe";
import { integrationUtils } from "tests/utils/integrationUtils";
import { beforeEach, describe, expect, test } from "vitest";

describe("Items Router", () => {
  beforeEach(async () => {
    await databaseWipe();
  });

  test("gets two items one with buy price", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
    ]);

    await integrationUtils.createItemWith30dHistory("item2");

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["items"]["getItem"]>;
    const input1: Input = { marketHashName: "item1" };
    const input2: Input = { marketHashName: "item2" };

    const response1 = await caller.items.getItem(input1);
    const response2 = await caller.items.getItem(input2);

    expect(response1.buyPrice).toBe(100);
    expect(response2.buyPrice).toBe(undefined);
  });

  test("gets two items to compare", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
    ]);

    await integrationUtils.createItemWith30dHistory("item2");

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);

    const response = await caller.items.getItemCompare({
      marketHashName1: "item1",
      marketHashName2: "item2",
    });

    expect(response.item1.buyPrice).toBe(100);
    expect(response.item2.buyPrice).toBe(undefined);
  });

  test("gets two items one with buy price", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
    ]);

    await integrationUtils.createItemWith30dHistory("item2");

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["items"]["getItemStatistics"]>;

    const input1: Input = { marketHashName: "item1", range: "week" };
    const response1 = await caller.items.getItemStatistics(input1);
    const response2 = await caller.items.getItemStatistics({
      ...input1,
      range: "month",
    });

    expect(response1.length).toBe(7);
    expect(response1[0]?.price).toBe(24);
    expect(response1[response1.length - 1]?.price).toBe(30);

    expect(response2.length).toBe(30);
    expect(response2[0]?.price).toBe(1);
    expect(response2[response2.length - 1]?.price).toBe(30);
  });

  test("updates user items info", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
    ]);

    const item = await prisma.item.findFirstOrThrow({
      where: { marketHashName: "item1" },
    });
    const userItem = await prisma.userItem.findFirstOrThrow({
      where: { itemId: item.id },
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["items"]["updateUserItem"]>;

    const dateAdded = sub(new Date(), { days: 100 });

    const input: Input = {
      buyPrice: 2,
      buyDate: dateAdded,
      itemId: userItem.itemId,
    };

    // Sanity check
    const tableOld = await caller.inventory.getTableData({ filters: [] });
    expect(tableOld.items[0]?.buyPrice === 2).toBeFalsy();
    expect(tableOld.items[0]?.dateAdded === dateAdded).toBeFalsy();

    await caller.items.updateUserItem(input);

    const tableNew = await caller.inventory.getTableData({ filters: [] });
    expect(tableNew.items[0]?.buyPrice).toBe(2);
    expect(tableNew.items[0]?.dateAdded).toStrictEqual(dateAdded);
  });

  test("updates user items info", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
    ]);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<
      AppRouter["items"]["toggleItemToFavourite"]
    >;

    const input: Input = {
      marketHashName: "item1",
    };

    const tableOld = await caller.inventory.getTableData({ filters: [] });
    expect(tableOld.items[0]?.favourite).toBeFalsy();

    await caller.items.toggleItemToFavourite(input);

    const tableNew = await caller.inventory.getTableData({ filters: [] });
    expect(tableNew.items[0]?.favourite).toBeTruthy();
  });
});
