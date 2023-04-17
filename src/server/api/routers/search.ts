import type { Item, ItemType } from "@prisma/client";
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

  allItems: protectedProcedure
    .input(
      z.object({
        sortBy: z
          .enum([
            "marketHashName",
            "volume24h",
            "volume7d",
            "change24h",
            "change7d",
            "change30d",
            "lastPrice",
          ])
          .default("volume24h"),
        desc: z.boolean().default(true),
        pageIndex: z.number(),
        pageSize: z.number(),
        filters: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      const canBeSorted = [
        "volume24h",
        "volume7d",
        "change24h",
        "change7d",
        "change30d",
      ].includes(input.sortBy);

      const items = await ctx.prisma.itemStatistics.findMany({
        ...(input.filters.length && {
          where: {
            item: { type: { in: input.filters as ItemType[] } },
          },
        }),
        ...(canBeSorted && {
          orderBy: { [input.sortBy]: input.desc ? "desc" : "asc" },
        }),
        ...(!canBeSorted && {
          orderBy: {
            item: {
              [input.sortBy]: {
                sort: input.desc ? "desc" : "asc",
                nulls: "last",
              },
            },
          },
        }),
        take: input.pageSize,
        skip: input.pageIndex * input.pageSize,
        include: { item: true },
      });

      const count = await ctx.prisma.itemStatistics.count({
        ...(input.filters.length && {
          where: {
            item: { type: { in: input.filters as ItemType[] } },
          },
        }),
      });

      return {
        count: count,
        items: items.map((el) => ({
          icon: el.item.icon,
          marketHashName: el.item.marketHashName,
          borderColor: el.item.borderColor,
          lastPrice: el.item.lastPrice || 0,
          volume24h: el.volume24h,
          volume7d: el.volume7d,
          change24h: el.change24h,
          change7d: el.change7d,
          change30d: el.change30d,
        })),
      };
    }),
});
