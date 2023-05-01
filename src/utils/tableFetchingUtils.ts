import type { ItemType } from "@prisma/client";

export const organizeFilters = (filters: string[]) => {
  const organized: { itemFilters: ItemType[]; favourites: boolean } = {
    itemFilters: [],
    favourites: false,
  };

  filters.forEach((filter) => {
    if (
      [
        "Skin",
        "Sticker",
        "Container",
        "Collectible",
        "Agent",
        "Patch",
        "MusicKit",
        "Graffiti",
        "Other",
      ].includes(filter)
    ) {
      organized.itemFilters.push(filter as ItemType);
    } else if (filter === "Favourites") {
      organized.favourites = true;
    }
  });

  return organized;
};

export const organizeSorts = (sortBy: string, desc: boolean) => {
  const sortRes: {
    itemStatisticsOrderBy?: { [key: string]: "desc" | "asc" };
    itemOrderBy?: { [key: string]: "desc" | "asc" };
  } = { itemStatisticsOrderBy: undefined, itemOrderBy: undefined };

  const itemStatisticsSort = [
    "volume24h",
    "volume7d",
    "change24h",
    "change7d",
    "change30d",
  ].includes(sortBy);

  if (itemStatisticsSort) {
    sortRes.itemStatisticsOrderBy = { [sortBy]: desc ? "desc" : "asc" };
  } else {
    sortRes.itemOrderBy = { [sortBy]: desc ? "desc" : "asc" };
  }

  return sortRes;
};
