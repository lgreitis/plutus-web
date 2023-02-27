import moment from "moment";
import { useState } from "react";
import type { TooltipProps } from "recharts";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType } from "recharts/types/component/DefaultTooltipContent";
import type { ValueType } from "tailwindcss/types/config";

function getMonthEpochs(fromDate?: Date, toDate?: Date): number[] {
  if (!fromDate || !toDate) {
    return [];
  }

  const startOfMonth = moment(fromDate).startOf("month").subtract(0, "month");
  const endOfMonth = moment(toDate).endOf("month").add(1, "month");
  const monthEpochs: number[] = [];

  while (startOfMonth.isSameOrBefore(endOfMonth)) {
    monthEpochs.push(startOfMonth.valueOf());
    startOfMonth.add(1, "month").startOf("month");
  }

  return monthEpochs;
}

interface DataType {
  name: number;
  date: Date;
  price: number;
}

interface InitialState {
  data: DataType[];
  left: string | number;
  right: string | number;
  refAreaLeft?: number;
  refAreaRight?: number;
}

interface Props {
  data: DataType[];
}

const InventoryValueChart = (props: Props) => {
  const initialState: InitialState = {
    data: props.data,
    left: "dataMin",
    right: "dataMax",
    refAreaLeft: undefined,
    refAreaRight: undefined,
  };

  const [zoomGraph, setZoomGraph] = useState<InitialState>(initialState);

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomGraph;

    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setZoomGraph({
        ...initialState,
        data: props.data.slice(),
      });
      return;
    }

    if (refAreaLeft && refAreaRight && refAreaLeft > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    setZoomGraph({
      data: props.data.slice(),
      refAreaLeft: undefined,
      refAreaRight: undefined,
      left: refAreaLeft || initialState.left,
      right: refAreaRight || initialState.right,
    });
  };

  const { data, left, right, refAreaLeft, refAreaRight } = zoomGraph;

  return (
    <ResponsiveContainer width="100%">
      <ComposedChart
        data={data}
        onMouseDown={(e) =>
          e &&
          e.activeLabel &&
          setZoomGraph((prev) => ({
            ...prev,
            refAreaLeft: parseInt(e.activeLabel || "0"),
          }))
        }
        onMouseMove={(e) =>
          e &&
          e.activeLabel &&
          zoomGraph.refAreaLeft &&
          setZoomGraph((prev) => ({
            ...prev,
            refAreaRight: parseInt(e.activeLabel || "0"),
          }))
        }
        onMouseUp={() => zoom()}
      >
        <defs>
          <linearGradient id="colorUvArea" x1="0" y1="0" x2="1" y2="0">
            <stop offset="10%" stopColor="#d23174" stopOpacity={0.5} />
            <stop offset="90%" stopColor="#912d96" stopOpacity={0.5} />
          </linearGradient>
          <linearGradient id="colorUvLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="10%" stopColor="#d23174" />
            <stop offset="90%" stopColor="#912d96" />
          </linearGradient>
        </defs>
        <CartesianGrid
          horizontal={false}
          strokeDasharray="3"
          strokeOpacity={0.2}
        />
        <XAxis
          hide
          allowDataOverflow
          dataKey="name"
          domain={left && right ? [left, right] : undefined}
          type="number"
          ticks={getMonthEpochs(data[0]?.date, data[data.length - 1]?.date)}
          tickFormatter={() => {
            return "";
          }}
        />
        <Tooltip
          wrapperStyle={{ outline: "none" }}
          content={<TooltipComponent />}
        />
        <YAxis hide domain={["auto", "auto"]} type="number" />
        <Line
          stroke="url(#colorUvLine)"
          strokeWidth={3}
          type="monotone"
          dataKey="price"
          dot={false}
          animationDuration={500}
        />
        <Area
          type="monotone"
          stroke="false"
          dataKey="price"
          fill="url(#colorUvArea)"
          animationDuration={500}
        />
        {refAreaLeft && refAreaRight && (
          <ReferenceArea x1={refAreaLeft} x2={refAreaRight} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const TooltipComponent = (props: TooltipProps<ValueType, NameType>) => {
  if (!props.active || !props.payload || !props.payload.length) {
    return <></>;
  }

  return (
    <div className="flex w-48 flex-col gap-1 rounded-lg border border-neutral-200 p-2 backdrop-blur-xl backdrop-brightness-110 dark:border-neutral-800 dark:backdrop-brightness-50">
      <span className="text-sm font-semibold text-neutral-500">
        {new Date(parseInt(String(props.label))).toLocaleString()}
      </span>
      <span key={props.payload[0]?.value}>
        Price: {props.payload[0]?.value}
      </span>
    </div>
  );
};

export default InventoryValueChart;
