import { useEffect, useState } from "react";
import { toast } from "sonner";
import SubmitButton from "src/components/buttons/submitButton";
import CardContainer from "src/components/card/cardContainer";
import CardFooter from "src/components/card/cardFooter";
import CardHeader from "src/components/card/cardHeader";
import CardSubheader from "src/components/card/cardSubheader";
import Toggle from "src/components/input/toggle";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

const EmailSendCard = () => {
  const { data, isLoading } = api.settings.sendEmails.useQuery();
  const { mutate, isLoading: isMutationLoading } =
    api.settings.toggleEmailSending.useMutation();
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    if (data) {
      setToggled(data.sendEmails);
    }
  }, [data]);

  return (
    <CardContainer>
      <CardHeader>Recieve monthly emails</CardHeader>
      <CardSubheader>
        At the start of each month, you will receive an email about how your
        inventory is doing. The emails will be sent to the email address linked
        to your Discord account.
      </CardSubheader>
      {(isLoading || !data) && (
        <>
          <Loader />
          <div></div>
        </>
      )}
      {data && data.emailLinked && (
        <div className="flex items-center gap-2 px-4">
          <Toggle
            toggled={toggled}
            onChange={setToggled}
            srOnly="Toggle profile visibility"
          />{" "}
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {toggled ? "Enabled" : "Disabled"}
          </span>
        </div>
      )}
      {data && !data.emailLinked && (
        <>
          <span className="px-4 font-semibold ">
            For this feature to be available, please link your Discord account.
          </span>
          <div></div>
        </>
      )}
      {data?.emailLinked && (
        <CardFooter>
          <SubmitButton
            loading={isMutationLoading}
            onClick={() => {
              mutate(
                { sendMails: toggled },
                {
                  onSuccess: () => {
                    toast.success("Your preferences have been saved.");
                  },
                  onError: () => {
                    toast.error("Failed to update your preferences.");
                  },
                }
              );
            }}
          >
            Save
          </SubmitButton>
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default EmailSendCard;
