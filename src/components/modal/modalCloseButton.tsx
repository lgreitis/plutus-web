import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  onClick?: () => void;
}

const ModalCloseButton = (props: Props) => {
  return (
    <XMarkIcon
      onClick={props.onClick}
      className="absolute top-0 right-0 mr-3 mt-3 h-6 w-6 cursor-pointer text-neutral-400 transition hover:text-neutral-900 hover:dark:text-neutral-50"
    />
  );
};

export default ModalCloseButton;
