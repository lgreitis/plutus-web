import { Bars3Icon } from "@heroicons/react/24/outline";
import { useState } from "react";
import ThemeSwitcher from "../themeSwitcher";
import NavbarMobile from "./navbarMobile";

const navigation = [
  { name: "Nav1", href: "#" },
  { name: "Nav2", href: "#" },
  { name: "Nav3", href: "#" },
  { name: "Nav4", href: "#" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="px-6 pt-6 lg:px-8">
      <nav className="flex items-center justify-between" aria-label="Global">
        <div className="flex lg:flex-1">
          <a
            href="#"
            className="-m-1.5 p-1.5 font-semibold text-gray-900 dark:text-gray-50"
          >
            Plutus
          </a>
        </div>
        <div className="flex gap-4 lg:hidden">
          <ThemeSwitcher />
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-50"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:content-center lg:justify-end lg:gap-4">
          <ThemeSwitcher />
          <a
            href="#"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <NavbarMobile
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={(open) => {
          setMobileMenuOpen(open);
        }}
      />
    </div>
  );
};

export default Navbar;
