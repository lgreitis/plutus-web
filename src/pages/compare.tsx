import InternalLayout from "src/components/layouts/internalLayout";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Compare = () => {
  return <InternalLayout headerText="Compare items"></InternalLayout>;
};

export default Compare;
