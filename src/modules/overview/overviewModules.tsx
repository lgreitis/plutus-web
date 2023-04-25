import { UserCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import CurrencyField from "src/components/currencyField";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

const InventoryValueChart = dynamic(
  () => import("src/modules/charts/inventoryValueChart"),
  { ssr: false }
);

const InventoryPieChart = dynamic(
  () => import("src/modules/charts/inventoryPieChart"),
  { ssr: false }
);

interface Props {
  userId?: string;
  showItemCount?: boolean;
}

const OverviewModules = (props: Props) => {
  const response = api.inventory.getOverviewGraph.useQuery({
    userId: props.userId,
  });
  const worthResponse = api.inventory.getInventoryWorth.useQuery({
    userId: props.userId,
  });
  const friendsResponse = api.inventory.getFriends.useQuery({
    userId: props.userId,
  });
  const currencyResponse = api.settings.getCurrentCurrency.useQuery(undefined, {
    staleTime: Infinity,
  });
  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();

  const difference = useMemo(() => {
    if (currencyResponse.data && worthResponse.data) {
      return (
        worthResponse.data.worth * currencyResponse.data.rate -
        worthResponse.data.invested
      );
    }

    return 0;
  }, [currencyResponse.data, worthResponse.data]);

  return (
    <>
      <div className="flex rounded-md bg-zinc-100 p-5 dark:bg-zinc-900">
        {worthResponse.data ? (
          <>
            {props.showItemCount && (
              <div className="flex flex-1 flex-col">
                <span className="text-sm">Items in inventory</span>
                <span className="text-2xl font-semibold">
                  {worthResponse.data.totalItems}
                </span>
              </div>
            )}
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
                  difference > 0 && "text-green-400",
                  difference < 0 && "text-red-400"
                )}
                value={difference}
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
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex w-full flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800 lg:w-1/2">
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
        <div className="flex w-full flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800 lg:w-1/2">
          <span className="text-sm font-semibold">Friends</span>
          <div className="flex h-72 flex-col divide-y divide-gray-200 overflow-auto dark:divide-zinc-900">
            {friendsResponse.data ? (
              friendsResponse.data.map((el) => (
                <div key={el.id} className="flex items-center gap-3 py-2 px-1">
                  {el.image ? (
                    <Image
                      className="inline-block h-9 w-9 rounded-full"
                      src={el.image}
                      alt={el.name || ""}
                      height="36"
                      width="36"
                    />
                  ) : (
                    <UserCircleIcon className="h-9 w-9 rounded-full text-neutral-400" />
                  )}
                  <Link href={`/user/${el.id}`} className="flex-1">
                    {el.name}
                  </Link>
                  <CurrencyField value={el.worth} />
                </div>
              ))
            ) : (
              <div className="flex h-full justify-center">
                <Loader />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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

export default OverviewModules;
