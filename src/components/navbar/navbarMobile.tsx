import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// TODO: remove these
const navigation = [
  { name: "Nav1", href: "#" },
  { name: "Nav2", href: "#" },
  { name: "Nav3", href: "#" },
  { name: "Nav4", href: "#" },
];

const NavbarMobile = (props: Props) => {
  const { mobileMenuOpen, setMobileMenuOpen } = props;

  return (
    <Dialog as="div" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
      <Dialog.Panel className="fixed inset-0 z-10 overflow-y-auto bg-white px-6 py-6 dark:bg-bg-dark  lg:hidden">
        <div className="flex items-center justify-between">
          <a
            href="#"
            className="-m-1.5 p-1.5 font-semibold text-gray-900 dark:text-gray-50"
          >
            <span>Plutus</span>
          </a>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <XMarkIcon
              className="h-6 w-6 text-gray-900 dark:text-gray-50"
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div className="space-y-2 py-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10 dark:text-gray-50"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="py-6">
              <a
                href="#"
                className="-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-400/10 dark:text-gray-50"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default NavbarMobile;
