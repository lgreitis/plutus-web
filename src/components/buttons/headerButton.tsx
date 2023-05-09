interface Props {
  children?: React.ReactNode;
  onClick?: () => void;
  name?: string;
}

const HeaderButton = (props: Props) => {
  return (
    <button
      type="button"
      className="flex h-7 items-center gap-1 rounded-md px-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      {...props}
    />
  );
};

export default HeaderButton;
