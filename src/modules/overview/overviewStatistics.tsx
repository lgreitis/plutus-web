import clsx from "clsx";
import { useMemo } from "react";
import CurrencyField from "src/components/currencyField";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

interface Props {
  data?: {
    totalItems: number;
    invested: number;
    worth: number;
  };
}

const OverviewStatistics = (props: Props) => {
  const { data } = props;
  const currencyResponse = api.settings.getCurrentCurrency.useQuery(undefined, {
    staleTime: Infinity,
  });

  const difference = useMemo(() => {
    if (currencyResponse.data && data) {
      return data.worth * currencyResponse.data.rate - data.invested;
    }
    return 0;
  }, [data, currencyResponse.data]);

  return (
    <div
      className={clsx(
        data ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1",
        "grid divide-neutral-200 rounded-md bg-neutral-100 p-5 dark:divide-neutral-800 dark:bg-neutral-900 md:flex-row md:divide-x"
      )}
    >
      {data ? (
        <>
          <div className="flex flex-1 flex-col">
            <span className="text-sm">Items in inventory</span>
            <span className="text-2xl font-semibold">{data.totalItems}</span>
          </div>
          <div className="flex flex-1 flex-col md:pl-2 ">
            <span className="text-sm">Invested</span>
            <CurrencyField
              noConvert
              className="text-2xl font-semibold"
              value={data.invested}
            />
          </div>
          <div className="flex flex-1 flex-col md:pl-2 ">
            <span className="text-sm">Total value</span>
            <CurrencyField
              className="text-2xl font-semibold"
              value={data.worth}
            />
          </div>
          <div className="flex flex-1 flex-col md:pl-2 ">
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
  );
};

export default OverviewStatistics;
