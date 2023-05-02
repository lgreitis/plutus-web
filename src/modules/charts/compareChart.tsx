import { useState } from "react";
import type { TooltipProps } from "recharts";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import CurrencyField from "src/components/currencyField";
import { getEpochs } from "src/utils/chartUtils";

interface DataType {
  name1: number;
  date1: Date;
  price1: number;
  volume1: number;
  name2: number;
  date2: Date;
  price2: number;
  volume2: number;
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
  buyPrice1?: number;
  buyPrice2?: number;
  onZoom?: (dateMin: Date, dateMax: Date) => void;
}

const CompareChart = (props: Props) => {
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
          new Date(props.data[0]?.date1 || ""),
          new Date(props.data[props.data.length - 1]?.date1 || "")
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
      const res1 = getAxisYDomain(refAreaLeft, refAreaRight, "price1");
      const res2 = getAxisYDomain(refAreaLeft, refAreaRight, "price2");
      bottom = (res1[0] || 0) < (res2[0] || 0) ? res1[0] || 0 : res2[0] || 0;
      top = (res1[1] || 0) > (res2[1] || 0) ? res1[1] || 0 : res2[1] || 0;
    }

    if (props.onZoom) {
      props.onZoom(
        new Date(refAreaLeft || props.data[0]?.date1 || ""),
        new Date(refAreaRight || props.data[props.data.length - 1]?.date1 || "")
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

  const getAxisYDomain = (
    from: number,
    to: number,
    ref: keyof Omit<Omit<DataType, "date1">, "date2">
  ) => {
    const refData: DataType[] = zoomGraph.data.filter(
      (el) => el.name1 > from && el.name1 < to
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
        <CartesianGrid
          horizontal={false}
          strokeDasharray="3"
          strokeOpacity={0.2}
        />
        <XAxis
          hide
          allowDataOverflow
          dataKey="name1"
          domain={left && right ? [left, right] : undefined}
          type="number"
          ticks={getEpochs(data[0]?.date1, data[data.length - 1]?.date1)}
          tickFormatter={() => {
            return "";
          }}
        />
        <Tooltip
          wrapperStyle={{ outline: "none" }}
          content={(tooltipProps) => (
            <TooltipComponent
              {...tooltipProps}
              buyPrice1={props.buyPrice1}
              buyPrice2={props.buyPrice2}
            />
          )}
        />
        <YAxis hide allowDataOverflow domain={[bottom, top]} type="number" />
        <YAxis
          yAxisId="2"
          hide
          orientation="left"
          allowDataOverflow
          domain={[0, (dataMax: number) => dataMax * 2]}
          type="number"
        />
        <Area
          stroke="#4f46e5"
          fill="#3730a3"
          yAxisId="2"
          type="step"
          animationDuration={300}
          opacity="90%"
          dataKey="volume1"
        />
        <Area
          stroke="#10b981"
          fill="#047857"
          yAxisId="2"
          type="step"
          animationDuration={300}
          opacity="80%"
          dataKey="volume2"
        />
        {props.buyPrice1 && (
          <ReferenceLine
            y={props.buyPrice1}
            strokeDasharray="6 6"
            stroke="#a78bfa"
            strokeWidth={3}
          />
        )}
        {props.buyPrice2 && (
          <ReferenceLine
            y={props.buyPrice2}
            strokeDasharray="6 6"
            stroke="#a3e635"
            strokeWidth={3}
          />
        )}
        <Line
          stroke="#db2777"
          strokeWidth={3}
          type="linear"
          dataKey="price1"
          dot={false}
          animationDuration={500}
        />
        <Line
          stroke="#4ade80"
          strokeWidth={3}
          type="linear"
          dataKey="price2"
          dot={false}
          animationDuration={500}
        />
        {refAreaLeft && refAreaRight && (
          <ReferenceArea x1={refAreaLeft} x2={refAreaRight} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const TooltipComponent = (
  props: TooltipProps<ValueType, NameType> & {
    buyPrice1?: number;
    buyPrice2?: number;
  }
) => {
  if (!props.active || !props.payload || !props.payload.length) {
    return <></>;
  }

  // payload0 = volume1
  // payload1 = volume2
  // payload2 = price1
  // payload3 = price2

  return (
    <div className="flex w-full flex-col gap-1 rounded-lg border border-neutral-200 p-2 backdrop-blur-xl backdrop-brightness-110 dark:border-neutral-800 dark:backdrop-brightness-50">
      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-500">
        {new Date(parseInt(String(props.label))).toLocaleString()}
      </span>
      <div key={String(props.label)} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-pink-600"></div>
          First item&apos;s Price:{" "}
          <CurrencyField
            value={parseFloat(props.payload[2]?.value?.toString() || "0")}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
          First item&apos;s Volume:{" "}
          {parseFloat(props.payload[0]?.value?.toString() || "0")}
        </div>
        {props.buyPrice1 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-400"></div>
            First item&apos;s Buy price:{" "}
            <CurrencyField value={props.buyPrice1} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
          Second item&apos;s Price:{" "}
          <CurrencyField
            value={parseFloat(props.payload[3]?.value?.toString() || "0")}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          Second item&apos;s Volume:{" "}
          {parseFloat(props.payload[1]?.value?.toString() || "0")}
        </div>
        {props.buyPrice2 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-lime-400"></div>
            Second item&apos;s Buy price:{" "}
            <CurrencyField value={props.buyPrice2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareChart;
