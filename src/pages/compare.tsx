import InternalLayout from "src/components/layouts/internalLayout";
import HeaderText from "src/components/text/headerText";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Compare = () => {
  return (
    <InternalLayout>
      <HeaderText>Compare items</HeaderText>
    </InternalLayout>
  );
};

export default Compare;
