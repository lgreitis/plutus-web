import { TRPCError } from "@trpc/server";
import { subDays, subYears } from "date-fns";
import { normalizeDateWithFills } from "src/server/api/routers/items";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { getLatestPrice } from "src/utils/priceUtils";

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

      worth += latestPrice;
    }

    return { worth: worth.toFixed(2) };
  }),

  getOverviewGraph: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.userItem.findMany({
      where: { Inventory: { userId: ctx.session.user.id } },
      select: {
        quantity: true,
        Item: {
          include: {
            OfficialPricingHistory: {
              orderBy: { date: "desc" },
              where: { date: { gt: subYears(new Date(), 1) } },
            },
          },
        },
      },
    });

    const chartData = new Map<
      number,
      { price: number; quantity: number; hits: number }
    >();

    items.forEach((item) => {
      const data = normalizeDateWithFills(item.Item.OfficialPricingHistory);
      data.forEach((val) => {
        const el = chartData.get(val.date.getTime());
        if (el) {
          chartData.set(val.date.getTime(), {
            quantity: el.quantity,
            price: el.price + val.price,
            hits: el.hits + 1,
          });
        } else {
          chartData.set(val.date.getTime(), {
            price: val.price,
            quantity: item.quantity,
            hits: 1,
          });
        }
      });
    });

    const res: { price: number; date: Date; name: number; hits: number }[] = [];

    chartData.forEach((val, key) => {
      res.push({
        price: val.price * val.quantity,
        date: new Date(key),
        name: key,
        hits: val.hits,
      });
    });

    return res.sort((a, b) => (a.date > b.date ? -1 : 1));
  }),

  getTableData: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.userItem.findMany({
      where: { Inventory: { userId: ctx.session.user.id } },
      include: {
        Item: {
          include: {
            OfficialPricingHistory: {
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
        const first = el.Item.OfficialPricingHistory[0];
        const last =
          el.Item.OfficialPricingHistory[
            el.Item.OfficialPricingHistory.length - 1
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
            marketHashName: el.marketHashName,
            price: latestPrice || 0,
            worth: latestPrice * el.quantity,
            quantity: el.quantity,
            borderColor: el.Item.borderColor,
            trend7d: 0,
            icon: el.Item.icon,
            rarity: el.Item.rarity,
          };
        }

        const trend7d = ((first.price - last.price) / last.price) * 100;
        return {
          marketHashName: el.marketHashName,
          price: latestPrice || 0,
          worth: latestPrice * el.quantity,
          quantity: el.quantity,
          borderColor: el.Item.borderColor,
          trend7d,
          icon: el.Item.icon,
          rarity: el.Item.rarity,
        };
      }),
    };
  }),
});
