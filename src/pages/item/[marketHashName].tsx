import { format } from "date-fns";
import { useRouter } from "next/router";
import { useState } from "react";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import HeaderText from "src/components/text/headerText";
import InventoryValueChart from "src/modules/charts/inventoryValueChart";
import { api } from "src/utils/api";

const ItemPage = () => {
  const router = useRouter();
  const { marketHashName } = router.query;
  const query = api.items.getItemStatisticsMHN.useQuery({
    marketHashName: marketHashName?.toString() || "",
  });
  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();

  return (
    <InternalLayout>
      <HeaderText>{marketHashName}</HeaderText>
      <div className="flex gap-5">
        <div className="flex w-full flex-1 flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          {query.data ? (
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
