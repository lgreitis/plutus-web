import { TRPCError } from "@trpc/server";
import axios from "axios";
import { subDays } from "date-fns";
import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { z } from "zod";

export const itemsRouter = createTRPCRouter({
  getItemStatistics: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ input, ctx }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { id: input.itemId },
      });

      const response = await axios.get<{ ip: string }>(
        "https://api.ipify.org?format=json"
      );

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return (
        await ctx.prisma.officialPricingHistory.findMany({
          where: {
            itemId: item.id,
            date: { lt: new Date("2022-12-01"), gt: new Date("2021-01-01") },
          },
          orderBy: { date: "asc" },
        })
      ).map((el) => {
        return { ...el, name: el.date.getTime(), ip: response.data.ip };
      });
    }),

  getItems: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.item.findMany({
      include: {
        OfficialPricingHistory: {
          orderBy: { date: "desc" },
          where: { date: { gte: subDays(new Date(), 7) } },
          select: { price: true, date: true },
        },
      },
      take: 100,
    });

    return {
      items: items.map((el) => {
        const first = el.OfficialPricingHistory[0];
        const last =
          el.OfficialPricingHistory[el.OfficialPricingHistory.length - 1];

        if (!first || !last) {
          return {
            marketHashName: el.marketHashName,
            price: el.lastPrice || 0,
            trend7d: 0,
          };
        }

        const trend7d = ((first.price - last.price) / last.price) * 100;
        return {
          marketHashName: el.marketHashName,
          price: first.price || 0,
          trend7d,
        };
      }),
    };
  }),

  findItem: publicProcedure
    .input(z.object({ searchString: z.string() }))
    .mutation(async ({ input, ctx }) => {
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
