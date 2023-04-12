import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { z } from "zod";

export const settingsRouter = createTRPCRouter({
  getCurrencies: protectedProcedure.query(async ({ ctx }) => {
    const currencies = await ctx.prisma.exchangeRate.findMany({
      distinct: ["conversionCurrency"],
      select: { conversionCurrency: true, rate: true },
    });

    return currencies;
  }),

  updateCurrency: protectedProcedure
    .input(z.object({ currency: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const exchangeRate = await ctx.prisma.exchangeRate.findFirst({
        where: { conversionCurrency: input.currency },
        orderBy: { timestamp: "desc" },
        select: { conversionCurrency: true, rate: true },
      });

      if (!exchangeRate) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { currency: input.currency },
      });

      return { exchangeRate };
    }),

  getCurrentCurrency: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const exchangeRate = await ctx.prisma.exchangeRate.findFirst({
      where: { conversionCurrency: user.currency },
      orderBy: { timestamp: "desc" },
    });

    if (!exchangeRate) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return { conversionCurrency: user.currency, rate: exchangeRate.rate };
  }),
});
