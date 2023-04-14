import { Switch } from "@headlessui/react";
import clsx from "clsx";

interface Props {
  toggled: boolean;
  onChange: (status: boolean) => void;
  srOnly?: string;
}

const Toggle = (props: Props) => {
  return (
    <Switch
      checked={props.toggled}
      onChange={props.onChange}
      className={clsx(
        props.toggled
          ? "bg-purple-400  dark:bg-pink-800"
          : "bg-neutral-200 dark:bg-neutral-800",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-offset-2"
      )}
    >
      <span className="sr-only">{props.srOnly}</span>
      <span
        aria-hidden="true"
        className={clsx(
          props.toggled ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-bg-dark"
        )}
      />
    </Switch>
  );
};

export default Toggle;
