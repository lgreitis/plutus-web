import { UserCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import CurrencyField from "src/components/currencyField";
import Loader from "src/components/loader";
import OverviewChartModule from "src/modules/overview/overviewChartModule";
import { api } from "src/utils/api";

const InventoryPieChart = dynamic(
  () => import("src/modules/charts/inventoryPieChart"),
  { ssr: false }
);

interface Props {
  userId?: string;
}

const OverviewModules = (props: Props) => {
  const worthResponse = api.inventory.getInventoryWorth.useQuery({
    userId: props.userId,
  });
  const friendsResponse = api.inventory.getFriends.useQuery({
    userId: props.userId,
  });
  const currencyResponse = api.settings.getCurrentCurrency.useQuery(undefined, {
    staleTime: Infinity,
  });

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
            <div className="flex flex-1 flex-col">
              <span className="text-sm">Items in inventory</span>
              <span className="text-2xl font-semibold">
                {worthResponse.data.totalItems}
              </span>
            </div>
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
      <OverviewChartModule userId={props.userId} />
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

export default OverviewModules;
