import { useMemo } from "react";
import type { TooltipProps } from "recharts";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import CurrencyField from "src/components/currencyField";
import type { RouterOutputs } from "src/utils/api";

type ChartData = RouterOutputs["inventory"]["getInventoryWorth"]["pieData"];

interface Props {
  data: ChartData;
}

const InventoryPieChart = (props: Props) => {
  const data = useMemo(() => {
    return Object.entries(props.data).map((el) => ({
      name: el[1].name,
      value: el[1].value,
      color: el[1].color,
      key: el[0],
    }));
  }, [props.data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie dataKey="value" data={data}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              stroke={entry.color}
              fillOpacity={0.1}
              fill={entry.color}
            />
          ))}
        </Pie>
        <Tooltip
          wrapperStyle={{ outline: "none" }}
          content={<TooltipComponent />}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const TooltipComponent = (props: TooltipProps<ValueType, NameType>) => {
  if (!props.active || !props.payload || !props.payload.length) {
    return <></>;
  }

  return (
    <div className="flex w-48 flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-transparent dark:backdrop-blur-xl dark:backdrop-brightness-50">
      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-500">
        {props.payload[0]?.name}
      </span>
      <span key={props.payload[0]?.name ?? "nokey"}>
        Value:{" "}
        <CurrencyField
          value={parseFloat(props.payload[0]?.value?.toString() || "0")}
        />
      </span>
    </div>
  );
};

export default InventoryPieChart;
