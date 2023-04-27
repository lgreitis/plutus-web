import { Dialog } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import DefaultModal from "src/components/modal/defaultModal";
import ModalButton from "src/components/modal/modalButton";
import ModalCloseButton from "src/components/modal/modalCloseButton";
import { api } from "src/utils/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

const InventoryFetchModal = (props: Props) => {
  const { open, onClose } = props;
  const [started, setStarted] = useState(true);
  const [done, setDone] = useState(false);
  const { mutate, data, error, isError } =
    api.inventoryFetch.startItemFetch.useMutation();
  const apiUtils = api.useContext();

  useEffect(() => {
    if (!started) {
      mutate();
      setStarted(true);
    }
  }, [mutate, started]);

  useEffect(() => {
    if (data && data.isDone) {
      setDone(true);
      void apiUtils.inventory.invalidate();
    }
  }, [data, apiUtils]);

  useEffect(() => {
    if (error) {
      setDone(true);
    }
  }, [error]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (started && !done) {
      interval = setInterval(() => {
        mutate();
      }, 2500);
    }

    return () => interval && clearInterval(interval);
  }, [started, mutate, done]);

  return (
    <DefaultModal onClose={onClose} open={open}>
      <ModalCloseButton onClick={onClose} />
      {!done && <ProcessingContent />}
      {done &&
        (isError ? (
          <ErrorContent onClick={onClose} />
        ) : (
          <SuccessContent onClick={onClose} />
        ))}
    </DefaultModal>
  );
};

const ProcessingContent = () => {
  return (
    <>
      <span className="relative flex h-10 w-10">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75 dark:bg-white"></span>
        <span className="relative inline-flex h-10 w-10 rounded-full bg-black dark:bg-white"></span>
      </span>
      <Dialog.Title as="h3" className="pt-1 text-lg font-medium leading-6">
        Please wait while we&apos;re fetching your inventory
      </Dialog.Title>
      <span className="text-neutral-500">
        This may take a while so feel free to close this window. When it&apos;s
        finished we&apos;ll update your inventory automatically.
      </span>
    </>
  );
};

interface DoneProps {
  onClick: () => void;
}

const SuccessContent = (props: DoneProps) => {
  const { onClick } = props;

  return (
    <>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
        <CheckIcon className="h-10 w-10 text-green-600" />
      </div>
      <Dialog.Title as="h3" className="pt-1 text-lg font-medium leading-6">
        We&apos;re done!
      </Dialog.Title>
      <span className="text-neutral-500">
        Your inventory is now up to date!
      </span>
      <button
        type="button"
        className="h-10 w-full rounded border border-black bg-black px-3 text-sm text-white transition-all duration-150 hover:bg-white hover:text-black dark:border-white  dark:bg-white dark:text-black hover:dark:bg-bg-dark hover:dark:text-white"
        onClick={onClick}
      >
        Close
      </button>
    </>
  );
};

const ErrorContent = (props: DoneProps) => {
  const { onClick } = props;

  return (
    <>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
        <XMarkIcon className="h-10 w-10 text-red-600" />
      </div>
      <Dialog.Title as="h3" className="pt-1 text-lg font-medium leading-6">
        Oh no! Something went wrong.
      </Dialog.Title>
      <span className="text-neutral-500">
        Failed to fetch your inventory, please try again later.
      </span>
      <ModalButton onClick={onClick}>Close</ModalButton>
    </>
  );
};

export default InventoryFetchModal;
