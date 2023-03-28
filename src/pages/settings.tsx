import CardContainer from "src/components/card/cardContainer";
import CardHeader from "src/components/card/cardHeader";
import InternalLayout from "src/components/layouts/internalLayout";

const SettingsPage = () => {
  return (
    <InternalLayout>
      <CardContainer>
        <CardHeader>Discord Integration</CardHeader>
      </CardContainer>
      <CardContainer>
        <CardHeader>Currency</CardHeader>
      </CardContainer>
    </InternalLayout>
  );
};

export default SettingsPage;
