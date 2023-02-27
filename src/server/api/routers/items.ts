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

      await new Promise((r) => setTimeout(r, 2000));

      return (
        await ctx.prisma.officialItemPricing.findMany({
          where: {
            itemId: item.id,
            date: { lt: new Date("2022-12-01"), gt: new Date("2021-01-01") },
          },
        })
      ).map((el) => {
        return { ...el, name: el.date.getTime() };
      });
    }),
});
