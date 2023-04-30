import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { mobileSidebar } from "src/store";

const SidebarExpandButton = () => {
  const [, setOpen] = useAtom(mobileSidebar);

  return (
    <button
      type="button"
      className="mr-2 block h-7 w-fit rounded-md p-1 transition hover:bg-neutral-100 hover:dark:bg-neutral-800 md:hidden"
      onClick={() => setOpen(true)}
    >
      <Bars3Icon className="h-5 w-5" />
    </button>
  );
};

export default SidebarExpandButton;
