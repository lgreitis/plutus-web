import {
  ArchiveBoxIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  HomeIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  Square2StackIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeSwitcher from "src/components/themeSwitcher";

const NavCategories = [
  {
    name: "Overview",
    link: "/overview",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    name: "Inventory",
    link: "/inventory",
    icon: <ArchiveBoxIcon className="h-5 w-5" />,
  },
  {
    name: "All items",
    link: "/search",
    icon: <ListBulletIcon className="h-5 w-5" />,
  },
  {
    name: "Compare items",
    link: "/compare",
    icon: <Square2StackIcon className="h-5 w-5" />,
  },
];

const filterCategories = [
  { name: "Agents", color: "bg-pink-500" },
  { name: "Containers", color: "bg-sky-500" },
  { name: "Patches", color: "bg-slate-400" },
  { name: "Music kits", color: "bg-gray-600" },
  { name: "Skins", color: "bg-teal-400" },
  { name: "Stickers", color: "bg-orange-400" },
  { name: "Tools", color: "bg-amber-700" },
];

interface Props {
  showFilterCategories?: boolean;
}

const Sidebar = (props: Props) => {
  const { showFilterCategories } = props;
  const router = useRouter();
  const { data: sessionData } = useSession();

  return (
    <div className="hidden border-r  border-neutral-200 dark:border-neutral-800  md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center">
          <div className="flex-1 font-semibold">Plutus</div>
          <div>
            <MagnifyingGlassIcon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 pt-5">
          {NavCategories.map((el) => (
            <Link
              href={el.link}
              key={el.name}
              className={clsx(
                "flex items-center gap-3 text-xs font-medium ",
                router.pathname === el.link
                  ? "text-neutral-200"
                  : "text-neutral-500 hover:text-neutral-200"
              )}
            >
              {el.icon}
              {el.name}
            </Link>
          ))}

          {showFilterCategories && (
            <>
              <span className="pt-5 text-xs font-medium text-neutral-400">
                Filter categories
              </span>
              {filterCategories.map((el) => (
                <a
                  key={el.name}
                  className="flex items-center gap-3 text-xs font-medium text-neutral-500"
                >
                  <div
                    className={clsx("mx-1.5 h-2 w-2 rounded-full", el.color)}
                  />
                  {el.name}
                </a>
              ))}
            </>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3"></div>

        <div className="flex flex-shrink-0 items-center">
          <div className="flex-1">
            {sessionData && sessionData.user.image ? (
              <div className="flex items-center gap-1">
                <Image
                  className="inline-block h-9 w-9 rounded-full"
                  src={sessionData?.user.image}
                  alt=""
                  height="36"
                  width="36"
                />
                <ChevronDownIcon className="h-3 w-3 text-neutral-400" />
              </div>
            ) : (
              <UserCircleIcon className="h-9 w-9 rounded-full  text-neutral-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Cog8ToothIcon className="h-5 w-5 text-neutral-400" />
            <ThemeSwitcher placement="top-start" color="text-neutral-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
