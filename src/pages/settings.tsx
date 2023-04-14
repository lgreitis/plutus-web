import InternalLayout from "src/components/layouts/internalLayout";
import HeaderText from "src/components/text/headerText";
import CurrencyCard from "src/modules/settings/currencyCard";
import DiscordCard from "src/modules/settings/discordCard";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const SettingsPage = () => {
  return (
    <InternalLayout>
      <HeaderText>Settings</HeaderText>
      <DiscordCard />
      <CurrencyCard />
    </InternalLayout>
  );
};

export default SettingsPage;
