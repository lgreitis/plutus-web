import clsx from "clsx";

interface Props {
  className?: string;
}

const Loader = (props: Props) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-center gap-1",
        props.className
      )}
    >
      <div className="h-1 w-1 animate-loading-blink rounded-full bg-black opacity-100 dark:bg-white"></div>
      <div
        style={{ animationDelay: "0.2s" }}
        className="h-1 w-1 animate-loading-blink rounded-full bg-black opacity-100 dark:bg-white"
      ></div>
      <div
        style={{ animationDelay: "0.4s" }}
        className="h-1 w-1 animate-loading-blink rounded-full bg-black opacity-100 dark:bg-white"
      ></div>
    </div>
  );
};

export default Loader;
