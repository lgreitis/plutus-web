import InternalLayout from "src/components/layouts/internalLayout";
import HeaderText from "src/components/text/headerText";
import CurrencyCard from "src/modules/settings/currencyCard";
import DiscordCard from "src/modules/settings/discordCard";
import ProfileStatusCard from "src/modules/settings/profileStatusCard";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const SettingsPage = () => {
  return (
    <InternalLayout>
      <HeaderText>Settings</HeaderText>
      <DiscordCard />
      <CurrencyCard />
      <ProfileStatusCard />
    </InternalLayout>
  );
};

export default SettingsPage;
