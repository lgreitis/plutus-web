import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import SidebarExpandButton from "src/components/buttons/sidebarExpandButton";
import InternalLayout from "src/components/layouts/internalLayout";
import RangeSelelect from "src/components/rangeSelect";
import HeaderText from "src/components/text/headerText";
import XAxis from "src/modules/charts/xAxis";
import CompareInformationGrid from "src/modules/compare/compareInformationGrid";
import CompareSearchBox from "src/modules/compare/compareSearchBox";
import { api } from "src/utils/api";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

const CompareChart = dynamic(() => import("src/modules/charts/compareChart"));

export const getServerSideProps = serverSideRequireAuth;

const Compare = () => {
  const [range, setRange] = useState<"month" | "week" | "year" | "all">(
    "month"
  );
  const [selected, setSelected] = useState<{ first?: string; second?: string }>(
    { first: "", second: "" }
  );
  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();
  const chartQuery1 = api.items.getItemStatistics.useQuery(
    {
      marketHashName: selected.first || "",
      range: range,
      fillEmptyDataPoints: true,
    },
    { enabled: selected.first ? true : false, refetchOnWindowFocus: false }
  );
  const chartQuery2 = api.items.getItemStatistics.useQuery(
    {
      marketHashName: selected.second || "",
      range: range,
      fillEmptyDataPoints: true,
    },
    { enabled: selected.second ? true : false, refetchOnWindowFocus: false }
  );

  const { mutate, data } = api.items.getItemCompare.useMutation();

  useEffect(() => {
    const { first, second } = selected;
    if (first && second) {
      mutate({ marketHashName1: first, marketHashName2: second });
    }
  }, [selected, mutate]);

  useEffect(() => {
    setAxisData(undefined);
  }, [chartQuery1.data, chartQuery2.data, data]);

  return (
    <InternalLayout>
      <div className="flex items-center">
        <SidebarExpandButton />
        <HeaderText className="flex-1">Compare items</HeaderText>

        <RangeSelelect
          onChange={(key) => setRange(key)}
          selected={range}
          hideAll={true}
        />
      </div>
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col justify-between gap-10 md:flex-row">
          <div className="flex w-full flex-col gap-2 md:gap-4">
            <CompareSearchBox
              title="Enter first item search value"
              onChange={(val) =>
                setSelected((prev) => ({ ...prev, first: val }))
              }
              selected={selected.first}
            />
            {data && <CompareInformationGrid data={data.item1} />}
          </div>
          <div className="flex w-full flex-col gap-2 md:gap-4">
            <CompareSearchBox
              title="Enter second item search value"
              onChange={(val) =>
                setSelected((prev) => ({ ...prev, second: val }))
              }
              selected={selected.second}
            />
            {data && <CompareInformationGrid data={data.item2} />}
          </div>
        </div>
        {data &&
          chartQuery1.data &&
          chartQuery2.data &&
          !chartQuery1.isFetching &&
          !chartQuery2.isFetching && (
            <div className="flex w-full flex-1 flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="h-64">
                <CompareChart
                  data={chartQuery1.data.map((el, i) => {
                    const el2 = chartQuery2.data[i];

                    return {
                      date1: el.date,
                      name1: el.name,
                      price1: el.price,
                      volume1: el.volume,
                      date2: el2?.date || new Date(),
                      name2: el2?.name || 0,
                      price2: el2?.price || 0,
                      volume2: el2?.volume || 0,
                    };
                  })}
                  buyPrice1={data.item1.buyPrice || undefined}
                  buyPrice2={data.item2.buyPrice || undefined}
                  onZoom={(dateMin, dateMax) => {
                    setAxisData({ dateMin, dateMax });
                  }}
                />
              </div>
              <XAxis data={chartQuery1.data} axisData={axisData} />
            </div>
          )}
      </div>
    </InternalLayout>
  );
};

export default Compare;
