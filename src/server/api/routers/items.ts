import type {
  OfficialPricingHistory,
  OfficialPricingHistoryOptimized,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  eachDayOfInterval,
  startOfDay,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { getLatestPrice } from "src/utils/priceUtils";
import { z } from "zod";

interface StatisticsDataPoint {
  price: number;
  volume: number;
  date: Date;
  name: number;
}

interface DataGroup {
  volume: number;
  itemCount: number;
  sumPrice: number;
  price: number;
}

export const itemsRouter = createTRPCRouter({
  getItem: protectedProcedure
    .input(z.object({ marketHashName: z.string() }))
    .query(async ({ input, ctx }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { marketHashName: input.marketHashName },
        include: {
          OfficialPricingHistoryOptimized: {
            orderBy: { date: "desc" },
            take: 1,
            select: { price: true, date: true },
          },
          ApiItemPrice: {
            orderBy: { fetchTime: "desc" },
            take: 1,
          },
        },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const latestPrice = getLatestPrice(
        {
          date: item.officialPricingHistoryUpdateTime || new Date(0),
          price: item.lastPrice || 0,
        },
        item.ApiItemPrice[0]
          ? {
              date: item.ApiItemPrice[0].fetchTime,
              price: item.ApiItemPrice[0].current,
            }
          : undefined
      );

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { ...item, latestPrice };
    }),

  getItemStatistics: protectedProcedure
    .input(
      z.object({
        marketHashName: z.string(),
        range: z.enum(["week", "month", "year", "all"]),
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

      if (needToNormalizeData) {
        const normalized = normalizeData(data);
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
});

export const normalizeData = (
  items: (OfficialPricingHistory | OfficialPricingHistoryOptimized)[]
): Map<number, DataGroup> => {
  const groupedData = new Map<number, DataGroup>();

  items.forEach((item) => {
    const start = startOfDay(item.date).getTime();
    if (groupedData.has(start)) {
      const dataGroup = groupedData.get(start);

      if (dataGroup) {
        const combinedItemCount = dataGroup.itemCount + 1;
        const combinedPrice = dataGroup.sumPrice + item.price;
        const combinedVolume = dataGroup.volume + item.volume;
        groupedData.set(start, {
          itemCount: combinedItemCount,
          sumPrice: combinedPrice,
          volume: combinedVolume,
          price: combinedPrice / combinedItemCount,
        });
      }
    } else {
      groupedData.set(start, {
        itemCount: 1,
        price: item.price,
        sumPrice: item.price,
        volume: item.volume,
      });
    }
  });

  return groupedData;
};

export const fillEmptyDataPoints = (
  items: OfficialPricingHistoryOptimized[]
) => {
  const intervals = eachDayOfInterval({
    start: items[0]?.date || new Date(),
    end: new Date(),
  }).map((el) => ({ price: 0, date: startOfDay(el).getTime() }));

  let last: number | undefined;

  const itemMap = new Map<number, DataGroup>();

  for (const item of items) {
    itemMap.set(startOfDay(item.date).getTime(), {
      itemCount: 1,
      price: item.price,
      sumPrice: item.price,
      volume: item.volume,
    });
  }

  const result = intervals.map((el) => {
    const item = itemMap.get(el.date);
    if (item) {
      last = item.price;
      return { ...el, price: item.price };
    } else if (last) {
      return { ...el, price: last };
    }
    return { ...el };
  });

  return result;
};
