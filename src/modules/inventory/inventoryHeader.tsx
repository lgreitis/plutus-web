import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import HeaderButton from "src/components/buttons/headerButton";
import HeaderText from "src/components/text/headerText";
import InventoryFetchModal from "src/modules/modals/inventoryFetchModal";

const InventoryHeader = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex items-end">
      <HeaderText className="flex-1">Inventory</HeaderText>
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
