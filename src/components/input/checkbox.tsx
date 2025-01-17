import clsx from "clsx";

interface Props {
  checked: boolean;
  onClick?: () => void;
}

const Checkbox = (props: Props) => {
  const { onClick, checked } = props;

  return (
    <span
      className={clsx(
        checked && "border-black bg-black dark:border-white dark:bg-white",
        !checked && "border-black dark:border-white",
        "relative h-4 w-4 min-w-[1rem] rounded-sm border"
      )}
      onClick={onClick}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onClick}
      />
      {props.checked && <CheckSVG />}
    </span>
  );
};

const CheckSVG = () => {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 20 20"
      width="16"
      className="absolute top-[-1px] left-[-1px]"
    >
      <path
        d="M14 7L8.5 12.5L6 10"
        className="stroke-white dark:stroke-black"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></path>
    </svg>
  );
};

export default Checkbox;
