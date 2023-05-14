import { TRPCError, type inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "src/server/api/root";
import { appRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import { prisma } from "src/server/db";
import { databaseWipe } from "tests/utils/databaseWipe";
import { integrationUtils } from "tests/utils/integrationUtils";
import { beforeEach, describe, expect, test } from "vitest";

describe("Inventory Router", () => {
  beforeEach(async () => {
    await databaseWipe();
  });

  test("get current users inventory worth", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<
      AppRouter["inventory"]["getInventoryWorth"]
    >;
    const input: Input = {};

    const response = await caller.inventory.getInventoryWorth(input);

    expect(response.totalItems).toBe(2);
    expect(response.worth).toBe(60);
  });

  test("get other users inventory worth", async () => {
    const user1 = await integrationUtils.createUserWithItems("testUser", []);
    const user2 = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user1 },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<
      AppRouter["inventory"]["getInventoryWorth"]
    >;
    const input: Input = { userId: user2.id };

    const response = await caller.inventory.getInventoryWorth(input);

    expect(response.totalItems).toBe(2);
    expect(response.worth).toBe(60);
  });

  test("try to get other users private inventory worth", async () => {
    const user1 = await integrationUtils.createUserWithItems("testUser", []);
    const user2 = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    await prisma.user.update({
      where: { id: user2.id },
      data: { public: false },
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user1 },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<
      AppRouter["inventory"]["getInventoryWorth"]
    >;
    const input: Input = { userId: user2.id };

    await expect(caller.inventory.getInventoryWorth(input)).rejects.toThrow(
      new TRPCError({ code: "NOT_FOUND" })
    );
  });

  test("gets overview graph", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<
      AppRouter["inventory"]["getOverviewGraph"]
    >;
    const input: Input = { useCache: false };

    const response = await caller.inventory.getOverviewGraph(input);

    expect(response[0]?.price).toBe(0);
    // 60 because 2 items
    expect(response[response.length - 1]?.price).toBe(60);
  });

  test("gets other user's overview graph", async () => {
    const user1 = await integrationUtils.createUserWithItems("testUser", []);
    const user2 = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user1 },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<
      AppRouter["inventory"]["getOverviewGraph"]
    >;
    const input: Input = { useCache: false, userId: user2.id };

    const response = await caller.inventory.getOverviewGraph(input);

    expect(response[0]?.price).toBe(0);
    // 60 because 2 items
    expect(response[response.length - 1]?.price).toBe(60);
  });

  test("tries to get other user's private overview graph", async () => {
    const user1 = await integrationUtils.createUserWithItems("testUser", []);
    const user2 = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    await prisma.user.update({
      where: { id: user2.id },
      data: { public: false },
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user1 },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<
      AppRouter["inventory"]["getOverviewGraph"]
    >;
    const input: Input = { useCache: false, userId: user2.id };

    await expect(caller.inventory.getOverviewGraph(input)).rejects.toThrow(
      new TRPCError({ code: "NOT_FOUND" })
    );
  });

  test("gets user's inventory table values", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
      "item3",
    ]);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["inventory"]["getTableData"]>;
    const input: Input = { filters: [] };

    const result = await caller.inventory.getTableData(input);

    expect(result.items.length).toBe(3);
    expect(result.items[0]?.price).toBe(30);
    expect(result.items[0]?.worth).toBe(30);
    expect(result.items[0]?.quantity).toBe(1);
  });

  test("gets user's inventory table values with item filter", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
      "item3",
    ]);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["inventory"]["getTableData"]>;
    const input1: Input = { filters: ["Skin"] };
    const input2: Input = { filters: ["Other"] };

    const result1 = await caller.inventory.getTableData(input1);
    const result2 = await caller.inventory.getTableData(input2);

    expect(result1.items.length).toBe(0);
    expect(result2.items.length).toBe(3);
  });

  test("gets friends", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);
    const user2 = await integrationUtils.createUserWithExistingItems(
      "testUser2",
      ["item1", "item2"]
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { friends: { connect: { id: user2.id } } },
    });

    await prisma.account.create({
      data: {
        provider: "steam",
        providerAccountId: "test",
        type: "Oauth",
        userId: user.id,
      },
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["inventory"]["getFriends"]>;
    const input: Input = {};

    const result = await caller.inventory.getFriends(input);

    console.log(result);

    expect(result[0]?.name).toBe("testUser2");
    expect(result[0]?.worth).toBe(60);
  });
});
