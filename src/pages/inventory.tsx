import InventoryHeader from "src/components/inventory/inventoryHeader";
import InventoryTable from "src/components/inventory/inventoryTable";
import InternalLayout from "src/components/layouts/internalLayout";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Inventory = () => {
  return (
    <InternalLayout showFilterCategories>
      <InventoryHeader />
      <div className="inline-block min-w-full overflow-y-scroll align-middle">
        <InventoryTable />
      </div>
    </InternalLayout>
  );
};

export default Inventory;
