import Image from "next/image";
import Link from "next/link";

interface Props {
  image: string;
  borderColor: string;
  marketHashName: string;
}

const ItemNameCell = (props: Props) => {
  return (
    <Link
      href={`/item/${props.marketHashName}`}
      className="transition hover:text-purple-400  hover:dark:text-pink-800"
    >
      <div className="flex items-center gap-1 md:gap-3">
        {
          <Image
            src={`https://community.akamai.steamstatic.com/economy/image/${props.image}/360fx360f`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl border"
            style={{
              borderColor: `#${props.borderColor}`,
            }}
            alt=""
          />
        }
        {props.marketHashName}
      </div>
    </Link>
  );
};

export default ItemNameCell;
