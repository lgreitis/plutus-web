interface Props {
  checked: boolean;
  onClick?: () => void;
}

const Checkbox = (props: Props) => {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-gray-300 text-purple-400   focus:ring-0 dark:text-pink-800"
      checked={props.checked}
      onChange={props.onClick}
    />
  );
};
export default Checkbox;
