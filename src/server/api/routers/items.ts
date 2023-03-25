import { TRPCError } from "@trpc/server";
import { subDays } from "date-fns";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { z } from "zod";

export const itemsRouter = createTRPCRouter({
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

      worth += apiPrice.avg;
    }

    return { worth: worth.toFixed(2) };
  }),

  getItemStatistics: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ input, ctx }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { id: input.itemId },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return (
        await ctx.prisma.officialPricingHistory.findMany({
          where: {
            itemId: item.id,
            date: { gt: new Date("2022-01-01") },
          },
          orderBy: { date: "asc" },
        })
      ).map((el) => {
        return { ...el, name: el.date.getTime() };
      });
    }),

  getTableData: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.userItem.findMany({
      where: { Inventory: { userId: ctx.session.user.id } },
      include: {
        Item: {
          include: {
            OfficialPricingHistory: {
              orderBy: { date: "desc" },
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

        if (!first || !last) {
          return {
            marketHashName: el.marketHashName,
            price: el.Item.ApiItemPrice[0]?.avg || 0,
            worth: (el.Item.lastPrice || 0) * el.quantity,
            quantity: el.quantity,
            trend7d: 0,
            icon: el.Item.icon,
            rarity: el.Item.rarity,
          };
        }

        const trend7d = ((first.price - last.price) / last.price) * 100;
        return {
          marketHashName: el.marketHashName,
          price: el.Item.ApiItemPrice[0]?.avg || 0,
          worth: (first.price || 0) * el.quantity,
          quantity: el.quantity,
          trend7d,
          icon: el.Item.icon,
          rarity: el.Item.rarity,
        };
      }),
    };
  }),

  findItem: protectedProcedure
    .input(z.object({ searchString: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.userItem.findFirst({
        where: { Inventory: { userId: ctx.session.user.id } },
      });

      const items = await ctx.prisma.item.findMany({
        where: { marketHashName: { search: input.searchString } },
        select: {
          id: true,
          marketHashName: true,
          icon: true,
        },
        take: 10,
      });

      return { items };
    }),
});
