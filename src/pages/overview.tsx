import { format } from "date-fns";
import { useState } from "react";
import Chart from "src/components/chart";
import InventoryValueChart from "src/components/charts/inventoryValueChart";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

const Overview = () => {
  const response = api.items.getItemStatistics.useQuery({
    itemId: "5abd8ada-3ba5-4e61-95a0-1f9f3c9f711a",
  });
  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();

  return (
    <InternalLayout headerText="Overview">
      <div className="flex rounded-md bg-zinc-100 p-5 dark:bg-zinc-900">
        <div className="flex flex-1 flex-col">
          <span className="text-sm">Invested</span>
          <span className="text-2xl font-semibold">953,57$</span>
        </div>
        <div className="flex flex-1 flex-col border-l border-zinc-200 pl-2 dark:border-zinc-800">
          <span className="text-sm">Total value</span>
          <span className="text-2xl font-semibold">1100,01$</span>
        </div>
        <div className="flex flex-1 flex-col border-l border-zinc-200 pl-2 dark:border-zinc-800">
          <span className="text-sm">Profit</span>
          <span className="text-2xl font-semibold text-green-400">146,44$</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <span className="text-sm font-semibold">Portfolio value</span>
        {response.data ? (
          <>
            <div className="h-64">
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
      <div className="flex  flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <span className="text-sm font-semibold">Portfolio value</span>
        {response.data ? (
          <>
            <div className="h-64">
              <Chart data={response.data} />
            </div>
            <XAxis data={response.data} />
          </>
        ) : (
          <div className="flex h-64 justify-center">
            <Loader />
          </div>
        )}
      </div>
    </InternalLayout>
  );
};

interface XAxisProps {
  data: { date: Date }[];
  axisData?: { dateMin: Date; dateMax: Date };
}

const XAxis = (props: XAxisProps) => {
  const { data, axisData } = props;
  if (!data[0]) {
    return null;
  }

  return (
    <div className="-mt-4 flex justify-between">
      <span className="pl-1 text-sm text-neutral-500">
        {format(axisData?.dateMin || data[0].date, "dd LLL, yyyy")}
      </span>
      <span className="pr-1 text-sm text-neutral-500">
        {format(
          axisData?.dateMax || data[data.length - 1]?.date || new Date(),
          "dd LLL, yyyy"
        )}
      </span>
    </div>
  );
};

export default Overview;
