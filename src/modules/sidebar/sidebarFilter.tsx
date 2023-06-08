import clsx from "clsx";
import { useAtom } from "jotai";
import { filterAtom } from "src/store";

const filterCategories = [
  { name: "Favourites", key: "Favourites", color: "bg-yellow-400" },
  { name: "Skins", key: "Skin", color: "bg-teal-400" },
  { name: "Containers", key: "Container", color: "bg-sky-500" },
  { name: "Stickers", key: "Sticker", color: "bg-orange-400" },
  { name: "Agents", key: "Agent", color: "bg-pink-500" },
  { name: "Collectibles", key: "Collectible", color: "bg-green-500" },
  { name: "Patches", key: "Patch", color: "bg-amber-700" },
  { name: "Music kits", key: "MusicKit", color: "bg-gray-600" },
  { name: "Graffiti", key: "Graffiti", color: "bg-gray-600" },
  { name: "Other", key: "Other", color: "bg-slate-400" },
];

const SidebarFilter = () => {
  const [filters, setFilters] = useAtom(filterAtom);
  const handleClick = (key: string, value: boolean) => {
    setFilters((old) => ({
      ...old,
      [key]: !value,
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between pt-5">
        <span className="text-xs font-medium text-neutral-400">
          Filter categories
        </span>
        {Object.keys(filters).length > 0 && (
          <button
            type="button"
            className="hover text-xs font-medium text-neutral-400 transition hover:text-neutral-900 hover:dark:text-neutral-50"
            onClick={() => setFilters({})}
          >
            Clear
          </button>
        )}
      </div>
      {filterCategories.map((el) => {
        const active = filters[el.key] ?? false;
        return (
          <button
            type="button"
            key={el.name}
            className={clsx(
              active ? "text-black dark:text-neutral-200" : "text-neutral-500",
              "flex cursor-pointer items-center gap-3 text-xs font-medium hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
            onClick={() => handleClick(el.key, active)}
          >
            <div className={clsx("mx-1.5 h-2 w-2 rounded-full", el.color)} />
            {el.name}
          </button>
        );
      })}
    </div>
  );
};

export default SidebarFilter;
