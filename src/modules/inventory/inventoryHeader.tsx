import { ArrowPathIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { useState } from "react";
import HeaderButton from "src/components/buttons/headerButton";
import SidebarExpandButton from "src/components/buttons/sidebarExpandButton";
import HeaderText from "src/components/text/headerText";
import VisibilityPopover from "src/components/visibilityPopover";
import InventoryFetchModal from "src/modules/modals/inventoryFetchModal";
import { visibilityAtom } from "src/store";
import { inventoryVisibilityColumns } from "src/utils/visibilityColumns";

const SaveInventoryPopover = dynamic(
  () => import("src/components/saveInventoryPopover"),
  {
    ssr: false,
  }
);

const InventoryHeader = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex items-end">
      <SidebarExpandButton />
      <HeaderText>Inventory</HeaderText>
      <div className="flex flex-1 items-center gap-2 pl-2">
        <VisibilityPopover
          atom={visibilityAtom}
          columns={inventoryVisibilityColumns}
        />
        <SaveInventoryPopover />
      </div>
      <HeaderButton onClick={() => setModalOpen(true)}>
        <ArrowPathIcon className="h-5 w-5" /> Refresh
      </HeaderButton>
      {modalOpen && (
        <InventoryFetchModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default InventoryHeader;
