import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BanknotesIcon } from "@heroicons/react/20/solid";
import type { ItemType } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import HeaderText from "src/components/text/headerText";

const ranges = [
  {
    key: "week",
    title: "Week",
  },
  {
    key: "month",
    title: "Month",
  },
  {
    key: "year",
    title: "Year",
  },
  {
    key: "all",
    title: "All",
  },
] as const;

const multisellable: ItemType[] = [
  "Collectible",
  "Container",
  "Graffiti",
  "MusicKit",
  "Patch",
  "Sticker",
];

interface Props {
  marketHashName: string;
  itemType?: ItemType | null;
  onRangeChange: (key: "month" | "week" | "year" | "all") => void;
  range: "month" | "week" | "year" | "all";
}

const ItemHeader = (props: Props) => {
  const { marketHashName, itemType, onRangeChange, range } = props;

  return (
    <div className="flex flex-col items-center md:flex-row">
      <div className="flex flex-1 items-center gap-2">
        <HeaderText>{marketHashName}</HeaderText>
        <Link
          href={`https://steamcommunity.com/market/listings/730/${encodeURIComponent(
            marketHashName
          )}`}
          target="_blank"
          className="flex h-7 w-7 items-center gap-1 rounded-md px-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <FontAwesomeIcon icon={faSteam} className="h-5 w-5" />
        </Link>
        {itemType && multisellable.includes(itemType) && (
          <Link
            href={`https://steamcommunity.com/market/multisell?appid=730&contextid=2&items%5B%5D=${encodeURIComponent(
              marketHashName
            )}`}
            target="_blank"
            className="flex h-7 w-7 items-center gap-1 rounded-md px-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <BanknotesIcon className="h-5 w-5" />
          </Link>
        )}
      </div>
      <div className="flex w-full min-w-max justify-between divide-x divide-neutral-800 rounded border border-neutral-800 md:w-1/4">
        {ranges.map((el) => (
          <button
            type="button"
            key={el.key}
            onClick={() => onRangeChange(el.key)}
            className={clsx(
              range === el.key && "bg-neutral-200  dark:bg-neutral-800",
              "w-full p-1 text-sm font-semibold text-neutral-800 transition-all hover:bg-neutral-200 dark:text-neutral-200  dark:hover:bg-neutral-800"
            )}
          >
            {el.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ItemHeader;
