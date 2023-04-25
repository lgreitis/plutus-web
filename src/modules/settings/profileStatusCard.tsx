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

const ProfileStatusCard = () => {
  const { data, isLoading } = api.settings.profileVisibility.useQuery();
  const { mutate, isLoading: isMutationLoading } =
    api.settings.toggleProfileVisibility.useMutation();
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    if (data) {
      setToggled(data.public);
    }
  }, [data]);

  return (
    <CardContainer>
      <CardHeader>Profile visiblity</CardHeader>
      <CardSubheader>
        The profile visibility setting allows you to choose whether or not your
        profile is visible to others on this website.
      </CardSubheader>
      {(isLoading || !data) && <Loader />}
      {data && (
        <div className="flex items-center gap-2 px-4">
          <Toggle
            toggled={toggled}
            onChange={setToggled}
            srOnly="Toggle profile visibility"
          />{" "}
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {toggled ? "Public" : "Private"}
          </span>
        </div>
      )}
      <CardFooter>
        <SubmitButton
          loading={isMutationLoading}
          onClick={() => {
            mutate(
              { public: toggled },
              {
                onSuccess: () => {
                  toast.success("Your preferences have been saved.");
                },
              }
            );
          }}
        >
          Save
        </SubmitButton>
      </CardFooter>
    </CardContainer>
  );
};

export default ProfileStatusCard;
