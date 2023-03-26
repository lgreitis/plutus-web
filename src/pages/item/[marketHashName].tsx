import clsx from "clsx";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import HeaderText from "src/components/text/headerText";
import InventoryValueChart from "src/modules/charts/inventoryValueChart";
import { api } from "src/utils/api";

const ranges = [
  {
    key: "week",
    title: "Week",
  },
  {
    key: "month",
    title: "Month",
  },
  {
    key: "year",
    title: "Year",
  },
  {
    key: "all",
    title: "All",
  },
] as const;

const ItemPage = () => {
  const router = useRouter();
  const { marketHashName } = router.query;
  const [range, setRange] = useState<"month" | "week" | "year" | "all">(
    "month"
  );
  const query = api.items.getItemStatisticsMHN.useQuery({
    marketHashName: marketHashName?.toString() || "",
    range: range,
  });
  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();

  useEffect(() => {
    setAxisData(undefined);
  }, [query.data]);

  return (
    <InternalLayout>
      <HeaderText className="flex">
        <span className="flex-1">{marketHashName}</span>
        <div className="flex w-1/4 justify-between divide-x divide-neutral-800 rounded border border-neutral-800">
          {ranges.map((el) => (
            <button
              type="button"
              key={el.key}
              onClick={() => {
                setRange(el.key);
              }}
              className={clsx(
                range === el.key &&
                  "bg-neutral-800 text-neutral-700 dark:text-neutral-200",
                "w-full p-1 text-base text-neutral-500 transition-all hover:bg-neutral-900 hover:text-neutral-700 dark:hover:text-neutral-200"
              )}
            >
              {el.title}
            </button>
          ))}
        </div>
      </HeaderText>
      <div className="flex flex-col gap-5">
        <div className="flex w-full flex-1 flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          {query.data && !query.isFetching ? (
            <>
              <div className="h-64">
                <InventoryValueChart
                  data={query.data}
                  onZoom={(dateMin, dateMax) => {
                    setAxisData({ dateMin, dateMax });
                  }}
                />
              </div>
              <XAxis data={query.data} axisData={axisData} />
            </>
          ) : (
            <div className="flex h-64 justify-center">
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

export default ItemPage;
