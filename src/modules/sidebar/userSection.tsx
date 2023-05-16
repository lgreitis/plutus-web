import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  RocketLaunchIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import DefaultTransition from "src/components/defaultTransition";

const UserSection = () => {
  const { data: sessionData } = useSession();

  return (
    <Menu as="div" className="relative">
      <Menu.Button as="div" className="flex items-center gap-1">
        {({ open }) => (
          <>
            {sessionData && sessionData.user.image ? (
              <Image
                className="inline-block h-9 w-9 rounded-full"
                src={sessionData.user.image}
                alt={sessionData.user.name || ""}
                height="36"
                width="36"
              />
            ) : (
              <UserCircleIcon className="h-9 w-9 rounded-full text-neutral-400" />
            )}
            <ChevronDownIcon
              className={clsx(
                open && "rotate-180",
                "h-3 w-3 text-neutral-400 transition-all"
              )}
            />
          </>
        )}
      </Menu.Button>
      <DefaultTransition>
        <Menu.Items className="absolute -top-2 left-0 w-32 origin-top-right -translate-y-full transform divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-zinc-900 dark:bg-bg-dark">
          <Menu.Item
            as="button"
            onClick={() => {
              window.open(
                "https://discord.com/api/oauth2/authorize?client_id=1076127754375933992&permissions=2048&scope=bot",
                "_blank",
                "noreferrer"
              );
            }}
            className={({ active }) =>
              clsx(
                active
                  ? "bg-gray-900 text-white dark:bg-slate-200  dark:text-gray-900"
                  : "text-gray-900 dark:text-white",
                "flex cursor-default select-none gap-3 rounded-t p-2 text-sm"
              )
            }
          >
            <FontAwesomeIcon icon={faDiscord} className="h-5 w-5" />
            Discord Bot
          </Menu.Item>
          <Menu.Item
            as={Link}
            href={`/user/${sessionData?.user.id || ""}`}
            className={({ active }) =>
              clsx(
                active
                  ? "bg-gray-900 text-white dark:bg-slate-200  dark:text-gray-900"
                  : "text-gray-900 dark:text-white",
                "flex cursor-default select-none gap-3 rounded-t p-2 text-sm"
              )
            }
          >
            <RocketLaunchIcon className="h-5 w-5" />
            Your Profile
          </Menu.Item>
          <Menu.Item
            as={Link}
            href="/settings"
            className={({ active }) =>
              clsx(
                active
                  ? "bg-gray-900 text-white dark:bg-slate-200  dark:text-gray-900"
                  : "text-gray-900 dark:text-white",
                "flex cursor-default select-none gap-3 rounded-t p-2 text-sm"
              )
            }
          >
            <Cog8ToothIcon className="h-5 w-5" />
            Settings
          </Menu.Item>
          <Menu.Item
            as="div"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className={({ active }) =>
              clsx(
                active
                  ? "bg-gray-900 text-white dark:bg-slate-200  dark:text-gray-900"
                  : "text-gray-900 dark:text-white",
                "flex cursor-default select-none gap-3 rounded-b p-2 text-sm"
              )
            }
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Logout
          </Menu.Item>
        </Menu.Items>
      </DefaultTransition>
    </Menu>
  );
};

export default UserSection;
