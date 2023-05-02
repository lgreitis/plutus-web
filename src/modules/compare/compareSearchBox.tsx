import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import Loader from "src/components/loader";
import useDebounce from "src/hooks/useDebounce";
import { api } from "src/utils/api";

interface Props {
  selected?: string;
  onChange: (value: string) => void;
}

const CompareSearchBox = (props: Props) => {
  const { mutateAsync, data, isLoading } = api.search.findItem.useMutation();
  const [searchString, setSearchString] = useState("");
  const debounce = useDebounce(searchString, 250);

  useEffect(() => {
    const searchString = debounce.trim();
    if (searchString) {
      void mutateAsync({ searchString });
    }
  }, [debounce, mutateAsync]);

  return (
    <Combobox value={props.selected} onChange={props.onChange}>
      <div className="relative w-full">
        <Combobox.Input
          onChange={(e) => setSearchString(e.target.value)}
          className={({ open }) =>
            clsx(
              open && "rounded-b-none",
              "w-full rounded-md border border-neutral-200 bg-white placeholder:text-neutral-400 focus:border-black focus:ring-0 dark:border-neutral-800 dark:bg-bg-dark placeholder:dark:text-neutral-600 focus:dark:border-white"
            )
          }
          placeholder="Select an item to compare"
        />
        <Combobox.Options className="absolute z-10 max-h-72 min-h-[3rem] w-full scroll-py-2 overflow-auto rounded-md rounded-t-none border border-t-0 bg-white py-2 dark:border-neutral-800 dark:bg-bg-dark">
          {isLoading && (
            <div className="flex h-10 w-full items-center justify-center">
              <Loader />
            </div>
          )}
          {data &&
            data.items.map((item) => (
              <Combobox.Option
                key={item.id}
                value={item.marketHashName}
                className={({ active }) =>
                  clsx(
                    "flex cursor-default select-none items-center gap-2 px-4 py-2",
                    active && "bg-purple-400 text-white dark:bg-pink-800"
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
      </div>
    </Combobox>
  );
};

export default CompareSearchBox;
