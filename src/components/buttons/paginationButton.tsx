import clsx from "clsx";
import { useState } from "react";

interface Props {
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const PaginationButton = (props: Props) => {
  const [click, setClick] = useState(false);

  return (
    <button
      disabled={props.disabled}
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}
      onMouseDown={(e) => !props.disabled && e.button === 0 && setClick(true)}
      onMouseUp={() => setClick(false)}
      className={clsx(
        click && "bg-neutral-300 dark:bg-neutral-700",
        props.disabled &&
          "border-neutral-300 bg-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-700",
        !click && !props.disabled && "bg-white  dark:bg-bg-dark ",
        "flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 transition-all hover:border-black dark:border-neutral-800 dark:hover:border-neutral-200"
      )}
    >
      {props.children}
    </button>
  );
};

export default PaginationButton;
