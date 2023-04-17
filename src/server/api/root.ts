import { inventoryRouter } from "src/server/api/routers/inventory";
import { inventoryFetchRouter } from "src/server/api/routers/inventoryFetch";
import { itemsRouter } from "src/server/api/routers/items";
import { searchRouter } from "src/server/api/routers/search";
import { settingsRouter } from "src/server/api/routers/settings";
import { userRouter } from "src/server/api/routers/user";
import { createTRPCRouter } from "src/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  items: itemsRouter,
  inventoryFetch: inventoryFetchRouter,
  inventory: inventoryRouter,
  search: searchRouter,
  settings: settingsRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
