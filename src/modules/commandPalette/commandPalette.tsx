import { Combobox, Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import Loader from "src/components/loader";
import useDebounce from "src/hooks/useDebounce";
import { api } from "src/utils/api";
interface Props {
  open?: boolean;
  onClose: () => void;
}
const CommandPalette = (props: Props) => {
  const { data, mutateAsync, isLoading } = api.search.findItem.useMutation();
  const [searchString, setSearchString] = useState("");
  const router = useRouter();

  const debounce = useDebounce(searchString, 250);

  useEffect(() => {
    const searchString = debounce.trim();
    if (searchString) {
      void mutateAsync({ searchString });
    }
  }, [debounce, mutateAsync]);

  return (
    <Transition.Root
      show={props.open}
      as={Fragment}
      afterLeave={() => setSearchString("")}
      appear
    >
      <Dialog as="div" className="relative z-10" onClose={props.onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-500 bg-opacity-25 transition-opacity dark:bg-neutral-800 dark:bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-neutral-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all dark:divide-neutral-900 dark:bg-bg-dark">
              <Combobox
                onChange={(val: string) => {
                  void router.push(`/item/${val}`);
                  props.onClose();
                }}
              >
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-neutral-400 dark:text-neutral-700"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-neutral-400  focus:ring-0 dark:text-white dark:placeholder:text-neutral-600 sm:text-sm"
                    placeholder="Search..."
                    onChange={(event) => setSearchString(event.target.value)}
                  />
                </div>

                {isLoading && <Loader className="py-6" />}

                {data && data.items.length > 0 && (
                  <Combobox.Options
                    static
                    className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-neutral-800 dark:text-neutral-200"
                  >
                    {data.items.map((item) => (
                      <Combobox.Option
                        key={item.id}
                        value={item.marketHashName}
                        className={({ active }) =>
                          clsx(
                            "flex cursor-default select-none items-center gap-2 px-4 py-2",
                            active &&
                              "bg-purple-400 text-white dark:bg-pink-800"
                          )
                        }
                      >
                        <Image
                          src={`https://community.akamai.steamstatic.com/economy/image/${item.icon}/360fx360f`}
                          width={36}
                          height={36}
                          className="h-9 w-9"
                          alt={item.marketHashName}
                        />
                        {item.marketHashName}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}

                {searchString !== "" && data && data.items.length === 0 && (
                  <p className="p-4 text-sm text-gray-500">No items found.</p>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CommandPalette;
