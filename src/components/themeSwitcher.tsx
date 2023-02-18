import { Listbox, Transition } from "@headlessui/react";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { Fragment, useEffect, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const themes = [
  { name: "Light", value: "light", icon: <SunIcon className="h-5 w-5" /> },
  { name: "Dark", value: "dark", icon: <MoonIcon className="h-5 w-5" /> },
  {
    name: "System",
    value: "system",
    icon: <ComputerDesktopIcon className="h-5 w-5" />,
  },
];

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Listbox value={theme} onChange={setTheme}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="h-6 w-6 rounded-md p-1 hover:bg-gray-400/10">
              {theme === "light" && <SunIcon className="h-4 w-4" />}
              {theme === "system" && (
                <ComputerDesktopIcon className="h-4 w-4" />
              )}
              {theme === "dark" && <MoonIcon className="h-4 w-4" />}
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-10 mt-2 w-32 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-zinc-900 dark:bg-bg-dark">
                {themes.map((el) => {
                  return (
                    <Listbox.Option
                      key={el.name}
                      className={({ active }) =>
                        classNames(
                          active
                            ? "bg-gray-900 text-gray-50 dark:bg-slate-200  dark:text-gray-900"
                            : "text-gray-900 dark:text-gray-50  ",
                          "cursor-default select-none p-2 text-sm "
                        )
                      }
                      value={el.value}
                    >
                      <div className="flex gap-2">
                        {el.icon}
                        {el.name}
                      </div>
                    </Listbox.Option>
                  );
                })}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default ThemeSwitcher;
