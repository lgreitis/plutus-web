import { Popover } from "@headlessui/react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import Checkbox from "src/components/checkbox";
import DefaultTransition from "src/components/defaultTransition";
import { visibilityAtom } from "src/store";

const columns = [
  { key: "dateAdded", label: "Date Added" },
  { key: "buyPrice", label: "Buy Price" },
  { key: "price", label: "Price" },
  { key: "quantity", label: "Quantity" },
  { key: "worth", label: "Worth" },
  { key: "trend7d", label: "Trend 7d" },
];

const InventoryVisibility = () => {
  const [visibility, setVisibility] = useAtom(visibilityAtom);
  const handleChange = (id: string, value: boolean) => {
    setVisibility((old) => ({
      ...old,
      [id]: !value,
    }));
  };

  return (
    <div>
      <Popover className="relative">
        <>
          <Popover.Button className="flex h-7 items-center gap-1 rounded-md px-1 hover:bg-neutral-100 focus:outline-none dark:hover:bg-neutral-800">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </Popover.Button>
          <DefaultTransition>
            <Popover.Panel className="absolute z-50 mt-1 flex flex-col divide-y overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black dark:divide-neutral-900 dark:bg-bg-dark">
              {columns.map((el) => (
                <div
                  key={el.key}
                  className="flex select-none items-center gap-2 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => {
                    handleChange(el.key, visibility[el.key] ?? true);
                  }}
                >
                  <Checkbox
                    checked={visibility[el.key] ?? true}
                    onClick={() => {
                      return;
                    }}
                  />
                  {el.label}
                </div>
              ))}
            </Popover.Panel>
          </DefaultTransition>
        </>
      </Popover>
    </div>
  );
};

export default InventoryVisibility;
