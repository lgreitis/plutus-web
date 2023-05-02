import { TRPCError } from "@trpc/server";
import { subMonths, subWeeks, subYears } from "date-fns";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import {
  fillEmptyDataPoints,
  normalizeData,
} from "src/utils/itemProcessingUtils";
import { z } from "zod";

interface StatisticsDataPoint {
  price: number;
  volume: number;
  date: Date;
  name: number;
}

export const itemsRouter = createTRPCRouter({
  getItem: protectedProcedure
    .input(z.object({ marketHashName: z.string() }))
    .query(async ({ input, ctx }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { marketHashName: input.marketHashName },
        select: {
          OfficialPricingHistoryOptimized: {
            orderBy: { date: "desc" },
            take: 1,
            select: { price: true, date: true },
          },
          ItemStatistics: true,
          id: true,
          type: true,
          lastPrice: true,
          icon: true,
        },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userItem = await ctx.prisma.userItem.findFirst({
        where: {
          Inventory: { userId: ctx.session.user.id },
          itemId: item.id,
        },
      });

      return { ...item, buyPrice: userItem?.buyPrice || undefined };
    }),

  getItemCompare: protectedProcedure
    .input(
      z.object({ marketHashName1: z.string(), marketHashName2: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      const item1 = await ctx.prisma.item.findUnique({
        where: { marketHashName: input.marketHashName1 },
        select: {
          OfficialPricingHistoryOptimized: {
            orderBy: { date: "desc" },
            take: 1,
            select: { price: true, date: true },
          },
          ItemStatistics: true,
          id: true,
          type: true,
          lastPrice: true,
          icon: true,
        },
      });
      const item2 = await ctx.prisma.item.findUnique({
        where: { marketHashName: input.marketHashName2 },
        select: {
          OfficialPricingHistoryOptimized: {
            orderBy: { date: "desc" },
            take: 1,
            select: { price: true, date: true },
          },
          ItemStatistics: true,
          id: true,
          type: true,
          lastPrice: true,
          icon: true,
        },
      });

      if (!item1 || !item2) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userItem1 = await ctx.prisma.userItem.findFirst({
        where: {
          Inventory: { userId: ctx.session.user.id },
          itemId: item1.id,
        },
      });
      const userItem2 = await ctx.prisma.userItem.findFirst({
        where: {
          Inventory: { userId: ctx.session.user.id },
          itemId: item2.id,
        },
      });

      return {
        item1: { ...item1, buyPrice: userItem1?.buyPrice || undefined },
        item2: { ...item2, buyPrice: userItem2?.buyPrice || undefined },
      };
    }),

  getItemStatistics: protectedProcedure
    .input(
      z.object({
        marketHashName: z.string(),
        range: z.enum(["week", "month", "year", "all"]),
        fillEmptyDataPoints: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { marketHashName: input.marketHashName },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      let date = new Date();
      let needToNormalizeData = false;

      switch (input.range) {
        case "week": {
          date = subWeeks(new Date(), 1);
          break;
        }
        case "month": {
          date = subMonths(new Date(), 1);
          break;
        }
        case "year": {
          needToNormalizeData = true;
          date = subYears(new Date(), 1);
          break;
        }
        case "all": {
          needToNormalizeData = true;
          date = new Date(0);
          break;
        }
      }

      const data = await ctx.prisma.officialPricingHistory.findMany({
        where: {
          itemId: item.id,
          date: { gt: date },
        },
        orderBy: { date: "asc" },
      });

      if (needToNormalizeData || input.fillEmptyDataPoints) {
        const normalized = normalizeData(data);

        if (input.fillEmptyDataPoints) {
          const arr: { date: Date; price: number; volume: number }[] = [];

          normalized.forEach((value, key) => {
            arr.push({
              price: value.price,
              volume: value.volume,
              date: new Date(key),
            });
          });

          const filled = fillEmptyDataPoints(arr, date);

          return filled.map((el) => ({
            price: el.price,
            volume: el.volume,
            date: new Date(el.date),
            name: el.date,
          }));
        }

        const result: StatisticsDataPoint[] = [];

        normalized.forEach((value, key) => {
          result.push({
            price: value.price,
            volume: value.volume,
            date: new Date(key),
            name: key,
          });
        });

        return result;
      }

      return data.map((el) => {
        return {
          price: el.price,
          volume: el.volume,
          date: el.date,
          name: el.date.getTime(),
        };
      });
    }),

  toggleItemToFavourite: protectedProcedure
    .input(
      z.object({
        marketHashName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingFavourite = await ctx.prisma.userFavouriteItem.findUnique({
        where: {
          marketHashName_userId: {
            marketHashName: input.marketHashName,
            userId: ctx.session.user.id,
          },
        },
      });

      let mutatedValue = false;

      if (existingFavourite) {
        await ctx.prisma.userFavouriteItem.delete({
          where: {
            marketHashName_userId: {
              marketHashName: input.marketHashName,
              userId: ctx.session.user.id,
            },
          },
        });
        mutatedValue = false;
      } else {
        await ctx.prisma.userFavouriteItem.create({
          data: {
            marketHashName: input.marketHashName,
            userId: ctx.session.user.id,
          },
        });
        mutatedValue = true;
      }

      return { mutatedValue };
    }),

  updateUserItem: protectedProcedure
    .input(
      z.object({
        buyDate: z.date(),
        buyPrice: z.number().or(z.null()),
        itemId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const inventory = await ctx.prisma.inventory.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!inventory) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.userItem.update({
        where: {
          inventoryId_itemId: {
            itemId: input.itemId,
            inventoryId: inventory.id,
          },
        },
        data: { buyPrice: input.buyPrice, dateAdded: input.buyDate },
      });

      return;
    }),
});
