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
import { getEpochs } from "src/utils/chartUtils";
import type { ValueType } from "tailwindcss/types/config";

interface DataType {
  name: number;
  date: Date;
  price: number;
  volume: number;
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

const ItemChart = (props: Props) => {
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
      const res = getAxisYDomain(refAreaLeft, refAreaRight, "price");
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

  const getAxisYDomain = (
    from: number,
    to: number,
    ref: keyof Omit<DataType, "date">
  ) => {
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
          ticks={getEpochs(data[0]?.date, data[data.length - 1]?.date)}
          tickFormatter={() => {
            return "";
          }}
        />
        <Tooltip
          wrapperStyle={{ outline: "none" }}
          content={<TooltipComponent />}
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
          stroke="#9333ea"
          fill="#a855f7"
          yAxisId="2"
          type="step"
          animationDuration={300}
          opacity="50%"
          dataKey="volume"
        />
        <Line
          stroke="#14b8a6"
          strokeWidth={3}
          type="linear"
          dataKey="price"
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

const TooltipComponent = (props: TooltipProps<ValueType, NameType>) => {
  if (!props.active || !props.payload || !props.payload.length) {
    return <></>;
  }

  return (
    <div className="flex w-48 flex-col gap-1 rounded-lg border border-neutral-200 p-2 backdrop-blur-xl backdrop-brightness-110 dark:border-neutral-800 dark:backdrop-brightness-50">
      <span className="text-sm font-semibold text-neutral-500">
        {new Date(parseInt(String(props.label))).toLocaleString()}
      </span>
      <div key={props.payload[0]?.value} className="flex flex-col gap-1">
        <span>
          Price: {parseFloat(props.payload[1]?.value || "0").toFixed(2)}$
        </span>
        <span>Volume: {parseFloat(props.payload[0]?.value || "0")}</span>
      </div>
    </div>
  );
};

export default ItemChart;
