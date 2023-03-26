import { addMonths, getTime, isBefore, startOfMonth } from "date-fns";
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

  const monthEpochs: number[] = [];
  monthEpochs.push(getTime(fromDate));
  let startMonth = startOfMonth(addMonths(fromDate, 1));
  const endMonth = toDate;

  while (isBefore(startMonth, endMonth)) {
    monthEpochs.push(getTime(startMonth));
    startMonth = addMonths(startMonth, 1);
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
  top: string | number;
  bottom: string | number;
  refAreaLeft?: number;
  refAreaRight?: number;
}

interface Props {
  data: DataType[];
  onZoom?: (dateMin: Date, dateMax: Date) => void;
}

const InventoryValueChart = (props: Props) => {
  const initialState: InitialState = {
    data: props.data,
    left: "dataMin",
    right: "dataMax",
    top: "dataMax",
    bottom: "dataMin",
    refAreaLeft: undefined,
    refAreaRight: undefined,
  };

  const [zoomGraph, setZoomGraph] = useState<InitialState>(initialState);

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomGraph;

    if (refAreaLeft === refAreaRight || !refAreaRight) {
      if (props.onZoom) {
        props.onZoom(
          new Date(props.data[0]?.date || ""),
          new Date(props.data[props.data.length - 1]?.date || "")
        );
      }
      setZoomGraph({
        ...initialState,
        data: props.data.slice(),
      });
      return;
    }

    if (refAreaLeft && refAreaRight && refAreaLeft > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    let bottom: string | number = "dataMin";
    let top: string | number = "dataMax";

    if (refAreaLeft && refAreaRight) {
      const res = getAxisYDomain(refAreaLeft, refAreaRight);
      bottom = res[0] || 0;
      top = res[1] || 0;
    }

    if (props.onZoom) {
      props.onZoom(
        new Date(refAreaLeft || props.data[0]?.date || ""),
        new Date(refAreaRight || props.data[props.data.length - 1]?.date || "")
      );
    }

    setZoomGraph({
      data: props.data.slice(),
      refAreaLeft: undefined,
      refAreaRight: undefined,
      top,
      bottom,
      left: refAreaLeft || initialState.left,
      right: refAreaRight || initialState.right,
    });
  };

  // const getAxisYDomain = (from: number, to: number, ref: keyof DataType) => {
  //   const refData: DataType[] = zoomGraph.data.filter(
  //     (el) => el.name > from && el.name < to
  //   );
  //   if (!refData[0]) {
  //     return [0, 0];
  //   }
  //   let [bottom, top] = [refData[0][ref], refData[0][ref]];

  //   refData.forEach((d) => {
  //     if (d[ref] > top) top = d[ref];
  //     if (d[ref] < bottom) bottom = d[ref];
  //   });

  //   console.log(bottom, top);
  //   return [bottom, top];
  //   // return [(bottom | 0) - offset, (top | 0) + offset];
  // };

  const getAxisYDomain = (from: number, to: number) => {
    const ref = "price" as const;
    const refData: DataType[] = zoomGraph.data.filter(
      (el) => el.name > from && el.name < to
    );
    if (!refData[0]) {
      return [0, 0];
    }
    let [bottom, top] = [refData[0][ref], refData[0][ref]];

    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });

    return [bottom, top];
  };

  const { data, left, right, top, bottom, refAreaLeft, refAreaRight } =
    zoomGraph;

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
        <YAxis hide allowDataOverflow domain={[bottom, top]} type="number" />
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
        Price: {parseFloat(props.payload[0]?.value || "0").toFixed(2)}$
      </span>
    </div>
  );
};

export default InventoryValueChart;
