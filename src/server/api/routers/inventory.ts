import type { ItemType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios, { isAxiosError } from "axios";
import { isBefore, subYears } from "date-fns";
import { env } from "src/env.mjs";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { fillEmptyDataPoints } from "src/utils/itemProcessingUtils";
import { z } from "zod";

interface FriendsResponse {
  friendslist: {
    friends: { steamid: string }[];
  };
}

export const inventoryRouter = createTRPCRouter({
  getFriends: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId ?? ctx.session.user.id },
        include: { friends: true },
      });

      const steamAccount = await ctx.prisma.account.findFirst({
        where: {
          userId: input.userId ?? ctx.session.user.id,
          provider: "steam",
        },
      });

      if ((input.userId && user && !user.public) || !user || !steamAccount) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!user.friends.length) {
        const friends = await axios
          .get<FriendsResponse>(
            "http://api.steampowered.com/ISteamUser/GetFriendList/v0001",
            {
              params: {
                key: env.STEAM_API_KEY,
                steamid: steamAccount.providerAccountId,
              },
            }
          )
          .catch((err) => {
            if (isAxiosError(err) && err.status === 401) {
              // TODO:
              throw new TRPCError({ code: "UNAUTHORIZED" });
            }
          });

        if (!friends) {
          return [];
        }

        for (const friend of friends.data.friendslist.friends) {
          const friendAccount = await ctx.prisma.account.findFirst({
            where: { providerAccountId: friend.steamid, provider: "steam" },
          });

          if (friendAccount) {
            await ctx.prisma.user.update({
              where: { id: input.userId ?? ctx.session.user.id },
              data: { friends: { connect: { id: friendAccount.userId } } },
            });
          }
        }
      }

      const userPop = await ctx.prisma.user.findUnique({
        where: { id: input.userId ?? ctx.session.user.id },
        include: {
          friends: {
            include: {
              Inventory: { include: { UserItem: { include: { Item: true } } } },
            },
          },
        },
      });

      const friendsWorth: {
        name: string | null;
        worth: number;
        image: string | null;
        id: string;
      }[] = [];

      if (!userPop) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      for (const friend of userPop.friends) {
        let worth = 0;
        if (friend.Inventory) {
          for (const item of friend.Inventory?.UserItem) {
            worth += (item.Item.lastPrice || 0) * item.quantity;
          }
        }

        friendsWorth.push({
          name: friend.name,
          image: friend.image,
          worth: worth,
          id: friend.id,
        });
      }

      return friendsWorth.sort((a, b) => b.worth - a.worth);
    }),

  getInventoryWorth: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const items = await ctx.prisma.userItem.findMany({
        where: {
          Inventory: { userId: input.userId ?? ctx.session.user.id },
        },
        include: {
          Item: true,
        },
      });

      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId ?? ctx.session.user.id },
      });

      if (input.userId && user && !user.public) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!items || !user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      let worth = 0;
      let invested = 0;
      let totalItems = 0;

      for (const item of items) {
        totalItems += item.quantity;
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
        totalItems,
        pieData,
      };
    }),

  getOverviewGraph: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        useBuyDate: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId ?? ctx.session.user.id },
      });

      if ((input.userId && user && !user.public) || !user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const items = await ctx.prisma.userItem.findMany({
        where: { Inventory: { userId: input.userId ?? ctx.session.user.id } },
        select: {
          quantity: true,
          dateAdded: true,
          Item: {
            select: {
              OfficialPricingHistoryOptimized: {
                orderBy: { date: "asc" },
                where: { date: { gt: subYears(new Date(), 1) } },
                select: {
                  date: true,
                  price: true,
                  volume: true,
                },
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

          if (input.useBuyDate && isBefore(val.date, item.dateAdded)) {
            return;
          }

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
              UserFavouriteItem: { where: { userId: ctx.session.user.id } },
            },
          },
        },
      });

      return {
        items: items.map((el) => {
          return {
            id: el.id,
            marketHashName: el.Item.marketHashName,
            itemId: el.Item.id,
            price: el.Item.lastPrice || 0,
            worth: (el.Item.lastPrice || 0) * el.quantity,
            quantity: el.quantity,
            borderColor: el.Item.borderColor,
            trend7d: el.Item.ItemStatistics?.change7d || 0,
            icon: el.Item.icon,
            rarity: el.Item.rarity,
            dateAdded: el.dateAdded,
            buyPrice: el.buyPrice,
            favourite: el.Item.UserFavouriteItem[0] ? true : false,
          };
        }),
      };
    }),
});
