interface Props {
  children?: React.ReactNode;
}

const GenericHeader = (props: Props) => {
  return <span className="select-none" {...props}></span>;
};

export default GenericHeader;
