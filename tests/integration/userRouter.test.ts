import { TRPCError, type inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "src/server/api/root";
import { appRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import { prisma } from "src/server/db";
import { databaseWipe } from "tests/utils/databaseWipe";
import { beforeEach, describe, expect, test } from "vitest";

describe("User Router", () => {
  beforeEach(async () => {
    await databaseWipe();
  });

  test("gets users info", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["user"]["getUser"]>;
    const input: Input = { userId: user.id };

    const response = await caller.user.getUser(input);

    expect(response.user?.name).toBe(user.name);
  });

  test("can get other users info", async () => {
    const user1 = await prisma.user.create({ data: { name: "testUser" } });
    const user2 = await prisma.user.create({ data: { name: "testUser2" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user1 },
    });
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["user"]["getUser"]>;
    const input: Input = { userId: user2.id };

    const response = await caller.user.getUser(input);

    expect(response.user?.name).toBe(user2.name);
  });

  test("can't get other users info if private", async () => {
    const user1 = await prisma.user.create({ data: { name: "testUser" } });
    const user2 = await prisma.user.create({
      data: { name: "testUser2", public: false },
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user1 },
    });
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["user"]["getUser"]>;
    const input: Input = { userId: user2.id };

    await expect(caller.user.getUser(input)).rejects.toThrow(
      new TRPCError({ code: "NOT_FOUND" })
    );
  });
});
