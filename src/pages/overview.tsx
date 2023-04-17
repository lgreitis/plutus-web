import clsx from "clsx";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useState } from "react";
import CurrencyField from "src/components/currencyField";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import HeaderText from "src/components/text/headerText";
import { api } from "src/utils/api";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

const InventoryValueChart = dynamic(
  () => import("src/modules/charts/inventoryValueChart"),
  { ssr: false }
);

const InventoryPieChart = dynamic(
  () => import("src/modules/charts/inventoryPieChart"),
  { ssr: false }
);

export const getServerSideProps = serverSideRequireAuth;

const Overview = () => {
  const response = api.inventory.getOverviewGraph.useQuery();
  const worthResponse = api.inventory.getInventoryWorth.useQuery();
  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();

  return (
    <InternalLayout>
      <HeaderText>Overview</HeaderText>
      <div className="flex rounded-md bg-zinc-100 p-5 dark:bg-zinc-900">
        {worthResponse.data ? (
          <>
            <div className="flex flex-1 flex-col">
              <span className="text-sm">Invested</span>
              <CurrencyField
                noConvert
                className="text-2xl font-semibold"
                value={worthResponse.data.invested || 0}
              />
            </div>
            <div className="flex flex-1 flex-col border-l border-zinc-200 pl-2 dark:border-zinc-800">
              <span className="text-sm">Total value</span>
              <CurrencyField
                className="text-2xl font-semibold"
                value={worthResponse.data.worth || 0}
              />
            </div>
            <div className="flex flex-1 flex-col border-l border-zinc-200 pl-2 dark:border-zinc-800">
              <span className="text-sm">Difference</span>
              <CurrencyField
                className={clsx(
                  "text-2xl font-semibold",
                  worthResponse.data.difference > 0 && "text-green-400",
                  worthResponse.data.difference < 0 && "text-red-400"
                )}
                value={worthResponse.data.difference || 0}
                noConvert
              />
            </div>
          </>
        ) : (
          <Loader className="h-12 w-full" />
        )}
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
      <div className="flex w-1/2 flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <span className="text-sm font-semibold">Value by category</span>
        <div className="h-72">
          {worthResponse.data ? (
            <InventoryPieChart data={worthResponse.data.pieData} />
          ) : (
            <div className="flex h-full justify-center">
              <Loader />
            </div>
          )}
        </div>
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
