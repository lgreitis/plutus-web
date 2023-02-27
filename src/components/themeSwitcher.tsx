import { Listbox } from "@headlessui/react";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import type { Placement } from "@popperjs/core";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePopper } from "react-popper";

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

const sizingConstants = {
  sm: { buttonSizing: "h-6 w-6", iconSizing: "h-4 w-4" },
  base: {
    buttonSizing: "h-7 w-7",
    iconSizing: "h-5 w-5",
  },
};
interface Props {
  placement?: Placement;
  color?: string;
  sizing?: keyof typeof sizingConstants;
}

const ThemeSwitcher = ({
  placement = "bottom",
  color = "dark:text-white",
  sizing = "base",
}: Props) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Listbox value={theme} onChange={setTheme}>
      <Listbox.Button
        ref={setReferenceElement}
        className={`rounded-md p-1 hover:bg-gray-400/10 ${color} ${sizingConstants[sizing].buttonSizing}`}
      >
        {theme === "light" && (
          <SunIcon className={sizingConstants[sizing].iconSizing} />
        )}
        {theme === "system" && (
          <ComputerDesktopIcon className={sizingConstants[sizing].iconSizing} />
        )}
        {theme === "dark" && (
          <MoonIcon className={sizingConstants[sizing].iconSizing} />
        )}
      </Listbox.Button>
      <Listbox.Options
        ref={setPopperElement}
        className="w-32 divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-zinc-900 dark:bg-bg-dark"
        {...attributes.popper}
        style={styles.popper}
      >
        {themes.map((el) => {
          return (
            <Listbox.Option
              key={el.name}
              className={({ active }) =>
                classNames(
                  active
                    ? "bg-gray-900 text-white dark:bg-slate-200  dark:text-gray-900"
                    : "text-gray-900 dark:text-white  ",
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
    </Listbox>
  );
};

export default ThemeSwitcher;
