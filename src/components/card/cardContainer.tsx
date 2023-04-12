interface Props {
  children?: React.ReactNode;
}

const CardContainer = (props: Props) => {
  return (
    <div
      className="flex flex-col gap-4 rounded-md border border-neutral-200 dark:border-neutral-800"
      {...props}
    ></div>
  );
};

export default CardContainer;
