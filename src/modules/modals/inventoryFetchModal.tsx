import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
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
    api.inventoryFetch.startItemFetch.useMutation({
      cacheTime: 0,
    });

  useEffect(() => {
    if (!started) {
      mutate();
      setStarted(true);
    }
  }, [mutate, started]);

  useEffect(() => {
    if (data && data.isDone) {
      setDone(true);
    }
  }, [data]);

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
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="flex w-full max-w-md transform flex-col items-center gap-3 overflow-hidden rounded-2xl bg-white p-6 text-center align-middle shadow-xl transition-all dark:bg-bg-dark">
                {!done && (
                  <>
                    <span className="relative flex h-10 w-10">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75 dark:bg-white"></span>
                      <span className="relative inline-flex h-10 w-10 rounded-full bg-black dark:bg-white"></span>
                    </span>
                    <Dialog.Title
                      as="h3"
                      className="pt-1 text-lg font-medium leading-6"
                    >
                      Please wait while we&apos;re fetching your inventory
                    </Dialog.Title>
                    <span className="text-neutral-500">
                      This may take anywhere from 30 seconds to a couple of
                      minutes
                    </span>
                  </>
                )}
                {done &&
                  (isError ? (
                    <ErrorContent onClick={onClose} />
                  ) : (
                    <SuccessContent onClick={onClose} />
                  ))}
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
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

export default InventoryFetchModal;
