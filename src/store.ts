import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const visibilityAtom = atomWithStorage<Record<string, boolean>>(
  "inventoryTableVisiblity",
  {}
);

export const filterAtom = atom<Record<string, boolean>>({});

export const overviewChartSettingsAtom = atomWithStorage<{
  useBuyDate: boolean;
  onlyWithBuyPrice: boolean;
  onlyFavourites: boolean;
}>("overviewChartSettings", {
  useBuyDate: false,
  onlyWithBuyPrice: false,
  onlyFavourites: false,
});

export const mobileSidebar = atom<boolean>(false);
