import clsx from "clsx";

const ranges = [
  {
    key: "week",
    title: "Week",
  },
  {
    key: "month",
    title: "Month",
  },
  {
    key: "year",
    title: "Year",
  },
  {
    key: "all",
    title: "All",
  },
] as const;

interface Props {
  onChange: (key: "all" | "week" | "month" | "year") => void;
  selected: "all" | "week" | "month" | "year";
  hideAll?: boolean;
}

const RangeSelelect = (props: Props) => {
  const { onChange, selected, hideAll } = props;

  return (
    <div className="flex w-full min-w-max justify-between divide-x divide-neutral-200 rounded border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800 md:w-1/4">
      {ranges.map(
        (el) =>
          !(hideAll && el.key === "all") && (
            <button
              type="button"
              key={el.key}
              onClick={() => onChange(el.key)}
              className={clsx(
                selected === el.key && "bg-neutral-200  dark:bg-neutral-800",
                "w-full p-1 text-sm font-semibold text-neutral-800 transition-all hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
              )}
            >
              {el.title}
            </button>
          )
      )}
    </div>
  );
};

export default RangeSelelect;
