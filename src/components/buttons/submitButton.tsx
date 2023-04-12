import clsx from "clsx";
import { useState } from "react";
import Loader from "src/components/loader";

interface Props {
  loading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const SubmitButton = (props: Props) => {
  const [click, setClick] = useState(false);

  return (
    <button
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}
      onMouseDown={(e) => !props.loading && e.button === 0 && setClick(true)}
      onMouseUp={() => setClick(false)}
      className={clsx(
        click && "bg-neutral-300 dark:bg-neutral-700",
        props.loading &&
          "border-neutral-300 bg-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-700",
        !click &&
          !props.loading &&
          "bg-bg-dark hover:bg-white dark:bg-white dark:hover:bg-bg-dark",
        "flex h-8 items-center justify-center rounded-md border border-black  text-white transition-all hover:border-black  hover:text-black dark:border-white dark:text-black dark:hover:text-white"
      )}
    >
      {props.loading ? (
        <div className="flex h-5 justify-center px-3">
          <Loader />
        </div>
      ) : (
        <span className="h-5 px-3 text-center text-sm">{props.children}</span>
      )}
    </button>
  );
};

export default SubmitButton;
