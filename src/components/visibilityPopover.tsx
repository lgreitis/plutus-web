import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import Checkbox from "src/components/input/checkbox";
import ListPopover from "src/components/listPopover";
import type { visibilityAtom } from "src/store";

interface Props {
  atom: typeof visibilityAtom;
  columns: { key: string; label: string }[];
}

const VisibilityPopover = (props: Props) => {
  const [visibility, setVisibility] = useAtom(props.atom);
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
      {props.columns.map((el) => (
        <div
          key={el.key}
          className="flex select-none items-center gap-2 whitespace-nowrap px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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

export default VisibilityPopover;
