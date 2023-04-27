import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import Checkbox from "src/components/input/checkbox";
import ListPopover from "src/components/listPopover";
import { visibilityAtom } from "src/store";

const columns = [
  { key: "dateAdded", label: "Buy Date" },
  { key: "buyPrice", label: "Buy Price" },
  { key: "price", label: "Price" },
  { key: "quantity", label: "Quantity" },
  { key: "worth", label: "Worth" },
  { key: "difference", label: "Difference" },
  { key: "trend7d", label: "Trend 7d" },
  { key: "actions", label: "Actions" },
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
    <ListPopover
      placement="bottom-start"
      button={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
    >
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
    </ListPopover>
  );
};

export default InventoryVisibility;
