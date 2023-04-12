import type { Item } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { env } from "src/env.mjs";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  findItem: protectedProcedure
    .input(z.object({ searchString: z.string() }))
    .mutation(async ({ input }) => {
      const response = await axios.get<{ result: Item[]; success: boolean }>(
        `${env.WORKER_API_URL}/search`,
        {
          params: {
            returnMatchData: false,
            searchString: input.searchString,
          },
          headers: {
            Authorization: env.WORKER_SECRET_KEY,
          },
        }
      );

      if (!response.data.success || response.status !== 200) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return { items: response.data.result.slice(0, 10) };
    }),
});
