import InternalLayout from "src/components/layouts/internalLayout";
import InventoryHeader from "src/modules/inventory/inventoryHeader";
import InventoryTable from "src/modules/inventory/inventoryTable";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Inventory = () => {
  return (
    <InternalLayout showFilterCategories>
      <InventoryHeader />
      <div className="inline-block min-w-full overflow-y-auto align-middle">
        <InventoryTable />
      </div>
    </InternalLayout>
  );
};

export default Inventory;
