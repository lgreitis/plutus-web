import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          name: true,
          image: true,
          public: true,
          id: true,
          Inventory: { include: { UserItem: true } },
        },
      });

      if (user && !user.public) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { user };
    }),
});
