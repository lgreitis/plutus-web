interface Props {
  children?: React.ReactNode;
}

const CardFooter = (props: Props) => {
  return (
    <div
      className="flex w-full items-center justify-end border-t border-neutral-200 bg-neutral-100 px-4 py-3  dark:border-neutral-800 dark:bg-neutral-900"
      {...props}
    ></div>
  );
};

export default CardFooter;
