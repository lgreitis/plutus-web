import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const visibilityAtom = atomWithStorage<Record<string, boolean>>(
  "inventoryTableVisiblity",
  {}
);

export const filterAtom = atom<Record<string, boolean>>({});

export const overviewChartSettingsAtom = atomWithStorage<{
  useBuyDate: boolean;
}>("overviewChartSettings", { useBuyDate: false });
