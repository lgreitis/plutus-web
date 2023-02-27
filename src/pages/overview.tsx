import { format } from "date-fns";
import InventoryValueChart from "src/components/charts/inventoryValueChart";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

const Overview = () => {
  const response = api.items.getItemStatistics.useQuery({
    itemId: "5abd8ada-3ba5-4e61-95a0-1f9f3c9f711a",
  });

  return (
    <InternalLayout headerText="Overview">
      <div className="flex  flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        <span className="text-sm font-semibold">Portfolio value</span>
        {response.data ? (
          <>
            <div className="h-64">
              <InventoryValueChart data={response.data} />
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
}

const XAxis = (props: XAxisProps) => {
  const { data } = props;
  if (!data[0]) {
    return null;
  }

  return (
    <div className="-mt-4 flex justify-between">
      <span className="pl-1 text-sm text-neutral-500">
        {format(data[0].date, "dd LLL, yyyy")}
      </span>
      <span className="pr-1 text-sm text-neutral-500">
        {format(data[data.length - 1]?.date || new Date(), "dd LLL, yyyy")}
      </span>
    </div>
  );
};

export default Overview;
