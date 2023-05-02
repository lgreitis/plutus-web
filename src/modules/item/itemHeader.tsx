import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BanknotesIcon } from "@heroicons/react/20/solid";
import type { ItemType } from "@prisma/client";
import Link from "next/link";
import SidebarExpandButton from "src/components/buttons/sidebarExpandButton";
import RangeSelelect from "src/components/rangeSelect";
import HeaderText from "src/components/text/headerText";

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
    <div className="flex flex-col items-center gap-2 md:flex-row">
      <div className="flex w-full flex-1 items-center gap-2">
        <SidebarExpandButton />
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
      <RangeSelelect onChange={(key) => onRangeChange(key)} selected={range} />
    </div>
  );
};

export default ItemHeader;
