import { type inferProcedureInput } from "@trpc/server";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { env } from "src/env.mjs";
import { appRouter, type AppRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import { prisma } from "src/server/db";
import { databaseWipe } from "tests/utils/databaseWipe";
import { integrationUtils } from "tests/utils/integrationUtils";
import { beforeEach, describe, expect, test } from "vitest";

describe("Search Router", () => {
  beforeEach(async () => {
    await databaseWipe();
  });

  test("find item route", async () => {
    const mock = new MockAdapter(axios);

    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    const items = await prisma.item.findMany({
      select: { marketHashName: true, icon: true, id: true },
    });

    mock
      .onGet(`${env.WORKER_API_URL}/search`)
      .reply(200, { success: true, result: items });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["search"]["findItem"]>;
    const input: Input = { searchString: "test" };

    const response = await caller.search.findItem(input);

    expect(response.items[0]?.icon).toBeDefined();
    expect(response.items[0]?.id).toBeDefined();
    expect(response.items[0]?.marketHashName).toBe(items[0]?.marketHashName);
    expect(response.items[1]?.icon).toBeDefined();
    expect(response.items[1]?.id).toBeDefined();
    expect(response.items[1]?.marketHashName).toBe(items[1]?.marketHashName);
  });

  test("find all items with filters", async () => {
    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    const items = await prisma.item.findMany({
      select: { marketHashName: true, icon: true, id: true },
      orderBy: { marketHashName: "desc" },
    });

    await prisma.userFavouriteItem.create({
      data: { userId: user.id, marketHashName: "item1" },
    });

    console.log(items);

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["search"]["allItems"]>;
    const input: Input = {
      filters: ["Favourites"],
      pageIndex: 0,
      pageSize: 10,
      sortBy: "marketHashName",
    };

    const response = await caller.search.allItems(input);

    console.log(response);

    expect(response.count).toBe(1);
    expect(response.items[0]?.marketHashName).toBe("item1");
  });
});
