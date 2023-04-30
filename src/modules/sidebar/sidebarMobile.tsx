import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import Logo from "src/components/logo";
import ThemeSwitcher from "src/components/themeSwitcher";
import SidebarFilter from "src/modules/sidebar/sidebarFilter";
import UserSection from "src/modules/sidebar/userSection";
import { mobileSidebar } from "src/store";

interface Props {
  navCategories: {
    name: string;
    link: string;
    icon: JSX.Element;
  }[];
  showFilterCategories?: boolean;
  onCommandOpen: () => void;
}

const SidebarMobile = (props: Props) => {
  const [open, setOpen] = useAtom(mobileSidebar);
  const router = useRouter();

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-bg-dark/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col overflow-y-auto bg-white dark:bg-bg-dark">
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center">
                      <div className="flex-1 font-semibold">
                        <Logo href="/overview" />
                      </div>
                      <MagnifyingGlassIcon
                        className="h-5 w-5 cursor-pointer"
                        onClick={() => {
                          setOpen(false);
                          props.onCommandOpen();
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 pt-5">
                      {props.navCategories.map((el) => (
                        <Link
                          href={el.link}
                          key={el.name}
                          className={clsx(
                            "flex items-center gap-3 text-xs font-medium ",
                            router.pathname === el.link
                              ? "dark:text-neutral-200"
                              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {el.icon}
                          {el.name}
                        </Link>
                      ))}
                      {props.showFilterCategories && <SidebarFilter />}
                    </div>
                    <div className="flex flex-1 flex-col gap-3"></div>
                    <div className="flex flex-shrink-0 items-center">
                      <div className="flex-1">
                        <div className="w-fit">
                          <UserSection />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThemeSwitcher
                          placement="top-end"
                          color="text-neutral-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default SidebarMobile;
