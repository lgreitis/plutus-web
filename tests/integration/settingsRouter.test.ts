import { appRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import { prisma } from "src/server/db";
import { databaseWipe } from "tests/utils/databaseWipe";
import { beforeEach, describe, expect, test } from "vitest";

describe("Settings router", () => {
  beforeEach(async () => {
    await databaseWipe();
  });

  test("discord linked should be false on default account", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    const response = await caller.settings.isDiscordlinked();

    expect(response.linked).toBeFalsy();
  });

  test("discord linked should be true on linked account", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    await prisma.account.create({
      data: {
        userId: user.id,
        provider: "discord",
        providerAccountId: "111",
        type: "oauth",
      },
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    const response = await caller.settings.isDiscordlinked();

    expect(response.linked).toBeTruthy();
  });

  test("profile visibility by default is true", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    const response = await caller.settings.profileVisibility();

    expect(response.public).toBeTruthy();
  });

  test("user toggles profile visibility to false", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    await caller.settings.toggleProfileVisibility({ public: false });
    const response = await caller.settings.profileVisibility();

    expect(response.public).toBeFalsy();
  });

  test("by default user should'nt have email and sendEmails to false", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    const response = await caller.settings.sendEmails();

    expect(response.emailLinked).toBeFalsy();
    expect(response.sendEmails).toBeFalsy();
  });

  test("user with email should recieve true on emailLinked", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    await prisma.user.update({
      where: { id: user.id },
      data: { email: "hello@test.com" },
    });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    const response = await caller.settings.sendEmails();

    expect(response.emailLinked).toBeTruthy();
    expect(response.sendEmails).toBeFalsy();
  });

  test("user toggles email sending", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    await caller.settings.toggleEmailSending({ sendMails: true });
    const response = await caller.settings.sendEmails();

    expect(response.emailLinked).toBeFalsy();
    expect(response.sendEmails).toBeTruthy();
  });

  test("get currencies should get all currencies once", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

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
        conversionCurrency: "EUR",
        rate: 1.1,
        timestamp: new Date().getTime(),
      },
    });
    await prisma.exchangeRate.create({
      data: {
        baseCurrency: "USD",
        conversionCurrency: "GBP",
        rate: 1.1,
        timestamp: new Date().getTime(),
      },
    });

    const response = await caller.settings.getCurrencies();

    expect(response.length).toBe(2);
  });

  test("default users currency is USD", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    const response = await caller.settings.getCurrentCurrency();

    expect(response.conversionCurrency).toBe("USD");
    expect(response.rate).toBe(1);
  });

  test("user changes currency", async () => {
    const user = await prisma.user.create({ data: { name: "testUser" } });

    const ctx = createInnerTRPCContext({
      session: { expires: "-10", user: user },
    });
    const caller = appRouter.createCaller(ctx);

    await prisma.exchangeRate.create({
      data: {
        baseCurrency: "USD",
        conversionCurrency: "EUR",
        rate: 2,
        timestamp: new Date().getTime(),
      },
    });

    await caller.settings.updateCurrency({ currency: "EUR" });

    const response = await caller.settings.getCurrentCurrency();

    expect(response.conversionCurrency).toBe("EUR");
    expect(response.rate).toBeCloseTo(2);
  });
});
