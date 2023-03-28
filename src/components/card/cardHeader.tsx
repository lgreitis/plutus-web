interface Props {
  children?: React.ReactNode;
}

const CardHeader = (props: Props) => {
  return <h3 className="text-sm font-semibold" {...props}></h3>;
};

export default CardHeader;
