import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { env } from "src/env.mjs";
import { appRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import { prisma } from "src/server/db";
import { databaseWipe } from "tests/utils/databaseWipe";
import { integrationUtils } from "tests/utils/integrationUtils";
import { beforeEach, describe, expect, test } from "vitest";

describe("Inventory Fetch", () => {
  beforeEach(async () => {
    await databaseWipe();
  });

  test("fetch inventory", async () => {
    const mock = new MockAdapter(axios);

    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    await prisma.account.create({
      data: {
        provider: "steam",
        providerAccountId: "test",
        type: "Oauth",
        userId: user.id,
      },
    });

    mock
      .onPost(`${env.WORKER_API_URL}/inventoryFetch`)
      .reply(200, { success: true, jobId: "10" });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);

    const response = await caller.inventoryFetch.startItemFetch();

    expect(response.isDone).toBe(false);
    expect(response.jobFailed).toBe(false);
    expect(response.progress).toBe(0);
    expect(response.success).toBe(true);
  });

  test("request second time should mimic axios response", async () => {
    const mock = new MockAdapter(axios);

    const user = await integrationUtils.createUserWithItems("testUser", [
      "item1",
      "item2",
    ]);

    await prisma.account.create({
      data: {
        provider: "steam",
        providerAccountId: "test",
        type: "Oauth",
        userId: user.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { fetchJobId: "10" },
    });

    mock.onPost(`${env.WORKER_API_URL}/inventoryFetchStatus`).reply(200, {
      success: true,
      isDone: true,
      jobFailed: false,
      progress: 100,
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });

    const caller = appRouter.createCaller(ctx);

    const response = await caller.inventoryFetch.startItemFetch();

    expect(response.isDone).toBe(true);
    expect(response.jobFailed).toBe(false);
    expect(response.progress).toBe(100);
    expect(response.success).toBe(true);
  });
});
