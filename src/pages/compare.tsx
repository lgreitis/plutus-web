import SidebarExpandButton from "src/components/buttons/sidebarExpandButton";
import InternalLayout from "src/components/layouts/internalLayout";
import HeaderText from "src/components/text/headerText";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Compare = () => {
  return (
    <InternalLayout>
      <div className="flex items-center">
        <SidebarExpandButton />
        <HeaderText>Compare items</HeaderText>
      </div>
    </InternalLayout>
  );
};

export default Compare;
