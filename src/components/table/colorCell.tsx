import clsx from "clsx";

interface Props {
  value: number;
  className?: string;
  children?: React.ReactNode;
}

const ColorCell = (props: Props) => {
  return (
    <span
      className={clsx(
        props.className,
        props.value > 0 && "text-green-400",
        props.value < 0 && "text-red-400"
      )}
    >
      {props.value.toFixed(2)}
      {props.children}
    </span>
  );
};

export default ColorCell;
