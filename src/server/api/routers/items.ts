import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

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

      return ctx.prisma.officialItemPricing.findMany({
        where: { itemId: item.id },
      });
    }),
});
