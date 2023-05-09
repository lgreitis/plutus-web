import { eachDayOfInterval, sub } from "date-fns";
import { prisma } from "src/server/db";

export const integrationUtils = {
  createUserWithInventory: async (name: string) => {
    const user = await prisma.user.create({ data: { name: name } });
    const inventory = await prisma.inventory.create({
      data: { userId: user.id },
    });
    return { user, inventory };
  },

  createItemWith30dHistory: async (name: string) => {
    const item = await integrationUtils.addUserNonExistantItem(name, 30);
    const interval = eachDayOfInterval({
      end: new Date(),
      start: sub(new Date(), { days: 30 }),
    });

    for await (const [i, date] of interval.entries()) {
      await prisma.officialPricingHistory.create({
        data: { date: date, price: i, volume: i, itemId: item.id },
      });
      await prisma.officialPricingHistoryOptimized.create({
        data: { date: date, price: i, volume: i, itemId: item.id },
      });
    }

    return item;
  },

  createUserWithItems: async (name: string, items: string[]) => {
    const { user, inventory } = await integrationUtils.createUserWithInventory(
      name
    );

    for await (const item of items) {
      const dbItem = await integrationUtils.createItemWith30dHistory(item);
      await prisma.userItem.create({
        data: {
          inventoryId: inventory.id,
          itemId: dbItem.id,
          quantity: 1,
          buyPrice: 100,
        },
      });
    }

    return user;
  },

  addUserItems: async (userId: string, items: string[]) => {
    const inventory = await prisma.inventory.create({
      data: { userId: userId },
    });

    for await (const item of items) {
      const dbItem = await integrationUtils.createItemWith30dHistory(item);
      await prisma.userItem.create({
        data: {
          inventoryId: inventory.id,
          itemId: dbItem.id,
          quantity: 1,
          buyPrice: 100,
        },
      });
    }
  },

  addUserNonExistantItem: async (name: string, price?: number) => {
    return prisma.item.create({
      data: {
        lastPrice: price ?? 0,
        marketHashName: name,
        marketName: name,
        icon: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq5OEqPn9NLPFqWZU7Mxkh6fFpdih2Vbs-RJpYWH7LdfEJA9sYw7R_1C7xe--1JTvu8yfyHFhuXYn-z-DyDd4AnT4",
        icon_small: "",
        rarity: "BaseGrade",
        type: "Other",
      },
    });
  },
};
