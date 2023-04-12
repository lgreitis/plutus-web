interface Props {
  children?: React.ReactNode;
}

const CardSubheader = (props: Props) => {
  return (
    <h4
      className="-mt-2 px-4 text-sm font-normal dark:text-neutral-400"
      {...props}
    ></h4>
  );
};

export default CardSubheader;
