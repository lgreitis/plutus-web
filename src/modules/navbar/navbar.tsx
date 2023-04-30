import { ArrowSmallRightIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Logo from "src/components/logo";
import ThemeSwitcher from "src/components/themeSwitcher";
import NavbarMobile from "src/modules/navbar/navbarMobile";

const Navbar = () => {
  const { data: sessionData } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
      <nav className="flex items-center justify-between" aria-label="Global">
        <div className="lg:flex-1">
          <Logo href="/" />
        </div>
        <div className="flex gap-4 lg:hidden">
          <ThemeSwitcher sizing="sm" />
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {/* {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {item.name}
            </a>
          ))} */}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:content-center lg:justify-end lg:gap-4">
          <ThemeSwitcher sizing="sm" />
          {sessionData ? (
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Log in{" "}
              <ArrowSmallRightIcon className="h-4 w-4 [&>path]:stroke-[2.5]" />
            </Link>
          )}
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
