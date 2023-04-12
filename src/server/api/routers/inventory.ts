import { TRPCError } from "@trpc/server";
import { subDays, subYears } from "date-fns";
import { fillEmptyDataPoints } from "src/server/api/routers/items";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { getLatestPrice } from "src/utils/priceUtils";
import { z } from "zod";

export const inventoryRouter = createTRPCRouter({
  getInventoryWorth: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.userItem.findMany({
      where: {
        Inventory: { userId: ctx.session.user.id },
      },
      include: {
        Item: {
          include: {
            ApiItemPrice: {
              orderBy: { fetchTime: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!items) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    let worth = 0;
    let invested = 0;

    for (const item of items) {
      const apiPrice = item.Item.ApiItemPrice[0];
      if (!apiPrice) {
        continue;
      }

      const latestPrice = getLatestPrice(
        {
          date: item.Item.officialPricingHistoryUpdateTime || new Date(0),
          price: item.Item.lastPrice || 0,
        },
        item.Item.ApiItemPrice[0]
          ? {
              date: item.Item.ApiItemPrice[0].fetchTime,
              price: item.Item.ApiItemPrice[0].current,
            }
          : undefined
      );

      invested += (item.buyPrice || 0) * item.quantity;
      worth += latestPrice * item.quantity;
    }

    return { worth, invested, difference: worth - invested };
  }),

  getOverviewGraph: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.userItem.findMany({
      where: { Inventory: { userId: ctx.session.user.id } },
      select: {
        quantity: true,
        Item: {
          include: {
            OfficialPricingHistoryOptimized: {
              orderBy: { date: "asc" },
              where: { date: { gt: subYears(new Date(), 1) } },
            },
          },
        },
      },
    });

    const chartData = new Map<number, { price: number }>();

    for (const item of items) {
      const data = fillEmptyDataPoints(
        item.Item.OfficialPricingHistoryOptimized
      );
      data.forEach((val) => {
        const el = chartData.get(val.date);
        if (el) {
          chartData.set(val.date, {
            price: el.price + val.price * item.quantity,
          });
        } else {
          chartData.set(val.date, {
            price: val.price * item.quantity,
          });
        }
      });
    }

    const res: { price: number; date: Date; name: number }[] = [];

    for (const [key, val] of chartData.entries()) {
      res.push({
        price: val.price,
        date: new Date(key),
        name: key,
      });
    }

    return res.sort((a, b) => (a.date > b.date ? 1 : -1));
  }),

  updateItemInfo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        dateAdded: z.date().optional(),
        buyPrice: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.userItem.findUnique({
        where: { id: input.id },
      });

      if (!exists) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const userItem = await ctx.prisma.userItem.update({
        where: { id: input.id },
        data: { buyPrice: input.buyPrice, dateAdded: input.dateAdded },
      });

      return userItem;
    }),

  getTableData: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.userItem.findMany({
      where: { Inventory: { userId: ctx.session.user.id } },
      include: {
        Item: {
          include: {
            OfficialPricingHistoryOptimized: {
              orderBy: { date: "desc" },
              // TODO: this is wrong
              where: { date: { gte: subDays(new Date(), 7) } },
              select: { price: true, date: true },
            },
            ApiItemPrice: {
              orderBy: { fetchTime: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    return {
      items: items.map((el) => {
        const first = el.Item.OfficialPricingHistoryOptimized[0];
        const last =
          el.Item.OfficialPricingHistoryOptimized[
            el.Item.OfficialPricingHistoryOptimized.length - 1
          ];

        const latestPrice = getLatestPrice(
          {
            date: el.Item.officialPricingHistoryUpdateTime || new Date(0),
            price: el.Item.lastPrice || 0,
          },
          el.Item.ApiItemPrice[0]
            ? {
                date: el.Item.ApiItemPrice[0].fetchTime,
                price: el.Item.ApiItemPrice[0].current,
              }
            : undefined
        );

        if (!first || !last) {
          return {
            id: el.id,
            marketHashName: el.marketHashName,
            price: latestPrice || 0,
            worth: latestPrice * el.quantity,
            quantity: el.quantity,
            borderColor: el.Item.borderColor,
            trend7d: 0,
            icon: el.Item.icon,
            rarity: el.Item.rarity,
            dateAdded: el.dateAdded,
            buyPrice: el.buyPrice,
          };
        }

        const trend7d = ((first.price - last.price) / last.price) * 100;
        return {
          id: el.id,
          marketHashName: el.marketHashName,
          price: latestPrice || 0,
          worth: latestPrice * el.quantity,
          quantity: el.quantity,
          borderColor: el.Item.borderColor,
          trend7d,
          icon: el.Item.icon,
          rarity: el.Item.rarity,
          dateAdded: el.dateAdded,
          buyPrice: el.buyPrice,
        };
      }),
    };
  }),
});
