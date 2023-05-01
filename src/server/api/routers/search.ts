import type { Item } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { env } from "src/env.mjs";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { organizeFilters, organizeSorts } from "src/utils/tableFetchingUtils";
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
      const filters = organizeFilters(input.filters);
      const sortBy = organizeSorts(input.sortBy, input.desc);

      const items = await ctx.prisma.itemStatistics.findMany({
        ...(filters.itemFilters.length && {
          where: {
            Item: { type: { in: filters.itemFilters } },
          },
        }),
        ...(filters.favourites && {
          where: {
            Item: {
              UserFavouriteItem: { some: { userId: ctx.session.user.id } },
              ...(filters.itemFilters.length && {
                type: { in: filters.itemFilters },
              }),
            },
          },
        }),
        ...(sortBy.itemStatisticsOrderBy && {
          orderBy: sortBy.itemStatisticsOrderBy,
        }),
        ...(sortBy.itemOrderBy && {
          orderBy: {
            Item: sortBy.itemOrderBy,
          },
        }),
        take: input.pageSize,
        skip: input.pageIndex * input.pageSize,
        include: {
          Item: {
            include: {
              UserFavouriteItem: { where: { userId: ctx.session.user.id } },
            },
          },
        },
      });

      const count = await ctx.prisma.itemStatistics.count({
        ...(filters.itemFilters.length && {
          where: {
            Item: { type: { in: filters.itemFilters } },
          },
        }),
        ...(filters.favourites && {
          where: {
            Item: {
              UserFavouriteItem: { some: { userId: ctx.session.user.id } },
              ...(filters.itemFilters.length && {
                type: { in: filters.itemFilters },
              }),
            },
          },
        }),
      });

      return {
        count: count,
        items: items.map((el) => ({
          icon: el.Item.icon,
          marketHashName: el.Item.marketHashName,
          borderColor: el.Item.borderColor,
          lastPrice: el.Item.lastPrice || 0,
          volume24h: el.volume24h,
          volume7d: el.volume7d,
          change24h: el.change24h,
          change7d: el.change7d,
          change30d: el.change30d,
        })),
      };
    }),
});
