import { format } from "date-fns";

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

export default XAxis;
