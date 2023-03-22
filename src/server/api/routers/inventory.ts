import { TRPCError } from "@trpc/server";
import axios, { isAxiosError } from "axios";
import { env } from "src/env.mjs";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

interface InventoryFetchStartResponse {
  success: boolean;
  jobId: string;
}

interface InventoryFetchStatusResponse {
  isDone: boolean;
  jobFailed: boolean;
  progress: number;
  success: boolean;
}

const defaultResult: InventoryFetchStatusResponse = {
  isDone: false,
  jobFailed: false,
  progress: 0,
  success: true,
};

export const inventoryRouter = createTRPCRouter({
  startItemFetch: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const userAccount = await ctx.prisma.account.findFirst({
      where: { userId, provider: "steam" },
      include: { user: true },
    });

    if (!userAccount) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const user = userAccount.user;

    if (user.fetchJobId) {
      const apiStatus = await axios
        .post<InventoryFetchStatusResponse>(
          `${env.WORKER_API_URL}/inventoryFetchStatus`,
          {
            jobId: user.fetchJobId,
            secret: env.WORKER_SECRET_KEY,
          }
        )
        .catch(async (error) => {
          if (isAxiosError(error)) {
            if (error.response?.status === 400) {
              await ctx.prisma.user.update({
                where: { id: user.id },
                data: { fetchJobId: null },
              });
              throw new TRPCError({ code: "NOT_FOUND" });
            }
          }

          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        });

      if (apiStatus && apiStatus.data.isDone) {
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: { fetchJobId: null },
        });
        return apiStatus.data;
      } else {
        return defaultResult;
      }
    } else {
      const apiResult = await axios.post<InventoryFetchStartResponse>(
        `${env.WORKER_API_URL}/inventoryFetch`,
        {
          steamId: userAccount.steamid,
          userId,
          secret: env.WORKER_SECRET_KEY,
        }
      );

      if (!apiResult.data.success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      await ctx.prisma.user.update({
        where: { id: userId },
        data: { fetchJobId: apiResult.data.jobId, lastFetch: new Date() },
      });

      return defaultResult;
    }
  }),
});
