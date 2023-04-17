import InternalLayout from "src/components/layouts/internalLayout";
import HeaderText from "src/components/text/headerText";
import OverviewModules from "src/modules/overview/overviewModules";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Overview = () => {
  return (
    <InternalLayout>
      <HeaderText>Overview</HeaderText>
      <OverviewModules />
    </InternalLayout>
  );
};

export default Overview;
