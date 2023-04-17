import type { ItemType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { subYears } from "date-fns";
import { fillEmptyDataPoints } from "src/server/api/routers/items";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { z } from "zod";

export const inventoryRouter = createTRPCRouter({
  getInventoryWorth: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.userItem.findMany({
      where: {
        Inventory: { userId: ctx.session.user.id },
      },
      include: {
        Item: true,
      },
    });

    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    const exchangeRate = await ctx.prisma.exchangeRate.findFirst({
      orderBy: { timestamp: "desc" },
      where: { conversionCurrency: user?.currency || "USD" },
    });

    if (!items || !user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    let worth = 0;
    let invested = 0;

    for (const item of items) {
      invested += (item.buyPrice || 0) * item.quantity;
      worth += (item.Item.lastPrice || 0) * item.quantity;
    }

    const pieData: {
      [key in ItemType]: { name: string; value: number; color: string };
    } = {
      Agent: { name: "Agents", value: 0, color: "#ec4899" },
      Container: { name: "Containers", value: 0, color: "#0ea5e9" },
      Collectible: { name: "Collectibles", value: 0, color: "#22c55e" },
      Graffiti: { name: "Graffiti", value: 0, color: "#22c55e" },
      Patch: { name: "Patches", value: 0, color: "#b45309" },
      MusicKit: { name: "Music kits", value: 0, color: "#4b5563" },
      Skin: { name: "Skins", value: 0, color: "#2dd4bf" },
      Sticker: { name: "Stickers", value: 0, color: "#fb923c" },
      Other: { name: "Other", value: 0, color: "#94a3b8" },
    };

    for (const item of items) {
      if (item.Item.type) {
        pieData[item.Item.type].value +=
          (item.Item.lastPrice || 0) * item.quantity;
      }
    }

    return {
      worth,
      invested,
      difference: worth * (exchangeRate?.rate || 1) - invested,
      pieData,
    };
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

  getTableData: protectedProcedure
    .input(z.object({ filters: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const items = await ctx.prisma.userItem.findMany({
        where: {
          Inventory: { userId: ctx.session.user.id },
          ...(input.filters.length && {
            Item: { type: { in: input.filters as ItemType[] } },
          }),
        },
        include: {
          Item: {
            include: {
              ItemStatistics: true,
            },
          },
        },
      });

      return {
        items: items.map((el) => {
          return {
            id: el.id,
            marketHashName: el.marketHashName,
            price: el.Item.lastPrice || 0,
            worth: (el.Item.lastPrice || 0) * el.quantity,
            quantity: el.quantity,
            borderColor: el.Item.borderColor,
            trend7d: el.Item.ItemStatistics?.change7d || 0,
            icon: el.Item.icon,
            rarity: el.Item.rarity,
            dateAdded: el.dateAdded,
            buyPrice: el.buyPrice,
          };
        }),
      };
    }),
});
