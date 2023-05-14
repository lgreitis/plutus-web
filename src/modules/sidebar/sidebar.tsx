import {
  ArchiveBoxIcon,
  HomeIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Logo from "src/components/logo";
import ThemeSwitcher from "src/components/themeSwitcher";
import useKeyPress from "src/hooks/useKeyPress";
import CommandPalette from "src/modules/commandPalette/commandPalette";
import SidebarFilter from "src/modules/sidebar/sidebarFilter";
import SidebarMobile from "src/modules/sidebar/sidebarMobile";
import UserSection from "src/modules/sidebar/userSection";

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

interface Props {
  showFilterCategories?: boolean;
}

const Sidebar = (props: Props) => {
  const { showFilterCategories } = props;
  const router = useRouter();

  const [commandOpen, setCommandOpen] = useState(false);
  const keyPress = useKeyPress(["Meta+k", "Control+k"]);

  useEffect(() => {
    if (keyPress) {
      setCommandOpen(true);
    }
  }, [keyPress]);

  return (
    <>
      <SidebarMobile
        navCategories={NavCategories}
        showFilterCategories={showFilterCategories}
        onCommandOpen={() => setCommandOpen(true)}
      />
      <div className="hidden border-r border-neutral-200 dark:border-neutral-800 md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <CommandPalette
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
        />
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center">
            <div className="flex-1 font-semibold">
              <Logo href="/overview" />
            </div>
            <MagnifyingGlassIcon
              title="Search for item"
              className="h-5 w-5 cursor-pointer"
              onClick={() => setCommandOpen(true)}
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 pt-5">
            {NavCategories.map((el) => (
              <Link
                href={el.link}
                key={el.name}
                className={clsx(
                  "flex items-center gap-3 text-xs font-medium ",
                  router.pathname === el.link
                    ? "dark:text-neutral-200"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                )}
              >
                {el.icon}
                {el.name}
              </Link>
            ))}
            {showFilterCategories && <SidebarFilter />}
          </div>
          <div className="flex flex-1 flex-col gap-3"></div>
          <div className="flex flex-shrink-0 items-center">
            <div className="flex-1">
              <div className="w-fit">
                <UserSection />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher placement="top-end" color="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
