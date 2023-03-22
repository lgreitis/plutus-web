import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import TooltipIconButton from "src/components/buttons/tooltipIconButton";
import InventoryFetchModal from "src/components/modals/inventoryFetchModal";
import HeaderText from "src/components/text/headerText";

const InventoryHeader = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex">
      <HeaderText className="flex-1">Inventory</HeaderText>
      <TooltipIconButton
        onClick={() => {
          setModalOpen(true);
        }}
        icon={<ArrowPathIcon />}
        tooltipText="Refresh inventory"
      />
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
