import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { useState } from "react";
import Checkbox from "src/components/input/checkbox";
import ListPopover from "src/components/listPopover";
import Loader from "src/components/loader";
import XAxis from "src/modules/charts/XAxis";
import { overviewChartSettingsAtom } from "src/store";
import { api } from "src/utils/api";

const InventoryValueChart = dynamic(
  () => import("src/modules/charts/inventoryValueChart"),
  { ssr: false }
);

interface Props {
  userId?: string;
}

const OverviewChartModule = (props: Props) => {
  const [settings, setSettings] = useAtom(overviewChartSettingsAtom);

  const response = api.inventory.getOverviewGraph.useQuery({
    userId: props.userId,
    useBuyDate: settings.useBuyDate,
  });

  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();

  return (
    <div className="flex flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Portfolio value</span>
        <ListPopover
          placement="bottom-end"
          button={<Cog8ToothIcon className="h-5 w-5" />}
        >
          <div
            className="flex w-40 select-none items-center gap-2 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => {
              setSettings((prev) => ({
                ...prev,
                useBuyDate: !prev.useBuyDate,
              }));
            }}
          >
            <Checkbox
              checked={settings.useBuyDate}
              onClick={() => {
                return;
              }}
            />
            Include date added values to calculations
          </div>
        </ListPopover>
      </div>
      {response.data ? (
        <>
          <div className="h-64" key={response.dataUpdatedAt}>
            <InventoryValueChart
              data={response.data}
              onZoom={(dateMin, dateMax) => {
                setAxisData({ dateMin, dateMax });
              }}
            />
          </div>
          <XAxis data={response.data} axisData={axisData} />
        </>
      ) : (
        <div className="flex h-64 justify-center">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default OverviewChartModule;
