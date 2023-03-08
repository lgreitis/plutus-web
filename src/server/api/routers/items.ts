import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { z } from "zod";

export const itemsRouter = createTRPCRouter({
  getItemStatistics: publicProcedure
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
            date: { lt: new Date("2022-12-01"), gt: new Date("2021-01-01") },
          },
        })
      ).map((el) => {
        return { ...el, name: el.date.getTime() };
      });
    }),

  getItems: publicProcedure.query(async ({ ctx }) => {
    return (
      await ctx.prisma.item.findMany({
        include: {
          OfficialPricingHistory: {
            orderBy: { date: "desc" },
            take: 1,
            select: { price: true },
          },
        },
        take: 100,
      })
    ).map((el) => {
      return {
        name: el.marketHashName,
        price: el.OfficialPricingHistory[0]?.price || 0,
      };
    });
  }),
});
