import { subDays } from "date-fns";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { getLatestPrice } from "src/utils/priceUtils";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  findItem: protectedProcedure
    .input(z.object({ searchString: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const items = await ctx.prisma.item.findMany({
        where: { marketHashName: { search: input.searchString } },
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
        take: 10,
      });

      const populatedItems = items.map((el) => {
        const latestPrice = getLatestPrice(
          {
            date: el.officialPricingHistoryUpdateTime || new Date(0),
            price: el.lastPrice || 0,
          },
          el.ApiItemPrice[0]
            ? {
                date: el.ApiItemPrice[0].fetchTime,
                price: el.ApiItemPrice[0].current,
              }
            : undefined
        );

        return {
          id: el.id,
          marketHashName: el.marketHashName,
          icon: el.icon,
          latestPrice: latestPrice,
        };
      });

      return { items: populatedItems };
    }),
});
