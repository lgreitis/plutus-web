import { chromium, type BrowserContext } from "@playwright/test";
import path from "node:path";
import { prisma } from "src/server/db";
import { databaseWipe } from "../utils/databaseWipe";
import { integrationUtils } from "../utils/integrationUtils";

type Cookie = Parameters<BrowserContext["addCookies"]>[0][0];
const testCookie: Cookie = {
  name: "next-auth.session-token",
  value: "d52f0c50-b8e3-4326-b48c-4d4a66fdeb64", // some random id
  domain: "localhost",
  path: "/",
  expires: -1, // expired => forces browser to refresh cookie on test run
  httpOnly: true,
  secure: false,
  sameSite: "Lax",
};

export default async function globalSetup() {
  const now = new Date();

  await databaseWipe();

  const user = await prisma.user.upsert({
    where: {
      email: "lukasgreicius70@gmail.com",
    },
    create: {
      name: "skitmos",
      email: "lukasgreicius70@gmail.com",
      image:
        "https://cdn.discordapp.com/avatars/135821957995298817/a_b0c438b136402c26e7492d317c93183c.gif",
      sessions: {
        create: {
          // create a session in db that hasn't expired yet, with the same id as the cookie
          expires: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          sessionToken: testCookie.value,
        },
      },
      accounts: {
        create: {
          type: "oauth",
          provider: "steam",
          providerAccountId: "76561198102409602",
          access_token: "ggg_zZl1pWIvKkf3UDynZ09zLvuyZsm1yC0YoRPt",
          id_token: "76561198102409602",
          steamid: "76561198102409602",
        },
      },
    },
    update: {},
  });

  await integrationUtils.addUserItems(user.id, [
    "★ Butterfly Knife | Night (Field-Tested)",
    "StatTrak™ M4A1-S | Hyper Beast (Minimal Wear)",
  ]);

  const storageState = path.resolve(__dirname, "storage-state.json");
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState });
  await context.addCookies([testCookie]);
  await context.storageState({ path: storageState });
  await browser.close();
}
