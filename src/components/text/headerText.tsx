import clsx from "clsx";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const HeaderText = (props: Props) => {
  return (
    <h1 className={clsx("text-2xl font-semibold", props.className)}>
      {props.children}
    </h1>
  );
};

export default HeaderText;
