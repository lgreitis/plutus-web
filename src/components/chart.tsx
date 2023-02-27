import { useState } from "react";
import type { TooltipProps } from "recharts";
import {
  Area,
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

interface DataType {
  price: number;
  volume: number;
  name: number;
}

interface InitialState {
  data: DataType[];
  left: string | number;
  right: string | number;
  refAreaLeft?: number;
  refAreaRight?: number;
  top: string | number;
  bottom: string | number;
  top2: string | number;
  bottom2: string | number;
}

interface Props {
  data: DataType[];
}

// TODO: TEMP FILE, REMOVE THIS

const Chart = (props: Props) => {
  const getAxisYDomain = (
    from: number,
    to: number,
    ref: keyof DataType,
    offset: number
  ): [string, string] | [number, number] => {
    const refData = props.data.slice(from - 1, to);

    if (!refData[0]) {
      return ["dataMax+1", "dataMin-1"];
    }

    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });

    return [(bottom | 0) - offset, (top | 0) + offset];
  };

  const initialState: InitialState = {
    data: props.data,
    left: "dataMin",
    right: "dataMax",
    refAreaLeft: undefined,
    refAreaRight: undefined,
    top: "dataMax+1",
    bottom: "dataMin-1",
    top2: "dataMax+5000",
    bottom2: "dataMin",
  };

  const [zoomGraph, setZoomGraph] = useState<InitialState>(initialState);

  // const changeHandler = (e: CategoricalChartState) => {
  //   setZoomGraph((prev) => ({
  //     ...prev,
  //     refAreaRight: parseInt(e.activeLabel || "0"),
  //   }));
  // };

  // const debouncedChangeHandler = useCallback(debounce(changeHandler, 1), []);

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomGraph;
    const { data } = zoomGraph;

    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setZoomGraph((prev) => ({
        ...prev,
        refAreaLeft: undefined,
        refAreaRight: undefined,
      }));
      return;
    }

    // xAxis domain
    if (refAreaLeft && refAreaRight && refAreaLeft > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(
      refAreaLeft || 0,
      refAreaRight,
      "price",
      1
    );
    const [bottom2, top2] = getAxisYDomain(
      refAreaLeft || 0,
      refAreaRight,
      "volume",
      10000
    );

    setZoomGraph((prev) => ({
      ...prev,
      refAreaLeft: undefined,
      refAreaRight: undefined,
      data: data?.slice(),
      left: refAreaLeft || 0,
      right: refAreaRight || 0,
      bottom,
      top,
      bottom2,
      top2,
    }));
  };

  const zoomOut = () => {
    const { data } = zoomGraph;
    setZoomGraph({
      ...initialState,
      data: data?.slice(),
    });
  };

  const { data, left, right, refAreaLeft, refAreaRight, top, bottom, top2 } =
    zoomGraph;

  return (
    <>
      <button type="button" className="btn update" onClick={() => zoomOut()}>
        Zoom Out
      </button>

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
          <XAxis
            allowDataOverflow
            dataKey="name"
            hide
            domain={left && right ? [left, right] : undefined}
            type="number"
          />
          <YAxis
            hide
            allowDataOverflow
            domain={[bottom, top]}
            type="number"
            yAxisId="1"
          />
          <YAxis
            yAxisId="2"
            hide
            orientation="left"
            allowDataOverflow
            domain={["dataMin", initialState.top2]}
            type="number"
          />
          <Tooltip content={<TooltipComponent />} />
          <Line
            yAxisId="1"
            type="natural"
            dataKey="price"
            stroke="#8884d8"
            dot={false}
            animationDuration={300}
          />
          <Area
            yAxisId="2"
            type="step"
            animationDuration={300}
            dataKey="volume"
          />
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea
              yAxisId="1"
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

const TooltipComponent = (props: TooltipProps<ValueType, NameType>) => {
  if (!props.active) {
    return null;
  }

  return (
    <div className="flex w-48 flex-col gap-1 rounded-lg border border-neutral-200 p-2 backdrop-blur-xl backdrop-brightness-110 dark:border-neutral-800 dark:backdrop-brightness-50">
      <span className="text-sm font-semibold text-neutral-500">
        {new Date(parseInt(String(props.label))).toLocaleString()}
      </span>
      {props.payload?.map((el) => (
        <span key={el.value}>
          {String(el.name)}: {el.value}
        </span>
      ))}
    </div>
  );
};

export default Chart;
