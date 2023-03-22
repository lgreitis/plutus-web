import clsx from "clsx";

const IconButton = (props: React.ComponentProps<"button">) => {
  const { className, ...rest } = props;

  return (
    <button
      type="button"
      className={clsx(
        className,
        "h-7 w-7 rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      )}
      {...rest}
    ></button>
  );
};

export default IconButton;
