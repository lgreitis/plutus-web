import type { OfficialPricingHistoryOptimized } from "@prisma/client";
import { eachDayOfInterval, startOfDay } from "date-fns";

interface DataGroup {
  volume: number;
  itemCount: number;
  sumPrice: number;
  price: number;
}

export const normalizeData = (
  items: { price: number; volume: number; date: Date }[]
): Map<number, DataGroup> => {
  const groupedData = new Map<number, DataGroup>();

  items.forEach((item) => {
    const start = startOfDay(item.date).getTime();
    if (groupedData.has(start)) {
      const dataGroup = groupedData.get(start);

      if (dataGroup) {
        const combinedItemCount = dataGroup.itemCount + 1;
        const combinedPrice = dataGroup.sumPrice + item.price;
        const combinedVolume = dataGroup.volume + item.volume;
        groupedData.set(start, {
          itemCount: combinedItemCount,
          sumPrice: combinedPrice,
          volume: combinedVolume,
          price: combinedPrice / combinedItemCount,
        });
      }
    } else {
      groupedData.set(start, {
        itemCount: 1,
        price: item.price,
        sumPrice: item.price,
        volume: item.volume,
      });
    }
  });

  return groupedData;
};

export const fillEmptyDataPoints = (
  items: OfficialPricingHistoryOptimized[]
) => {
  const intervals = eachDayOfInterval({
    start: items[0]?.date || new Date(),
    end: new Date(),
  }).map((el) => ({ price: 0, date: startOfDay(el).getTime() }));

  let last: number | undefined;

  const itemMap = new Map<number, DataGroup>();

  for (const item of items) {
    itemMap.set(startOfDay(item.date).getTime(), {
      itemCount: 1,
      price: item.price,
      sumPrice: item.price,
      volume: item.volume,
    });
  }

  const result = intervals.map((el) => {
    const item = itemMap.get(el.date);
    if (item) {
      last = item.price;
      return { ...el, price: item.price };
    } else if (last) {
      return { ...el, price: last };
    }
    return { ...el };
  });

  return result;
};
