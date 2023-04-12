interface Props {
  children?: React.ReactNode;
}

const CardHeader = (props: Props) => {
  return <h3 className="px-4 pt-4 text-base font-semibold" {...props}></h3>;
};

export default CardHeader;
