import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";
import CardContainer from "src/components/card/cardContainer";
import CardHeader from "src/components/card/cardHeader";
import CardSubheader from "src/components/card/cardSubheader";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

const DiscordCard = () => {
  const { data, isLoading } = api.settings.isDiscordlinked.useQuery();

  return (
    <CardContainer>
      <CardHeader>Link your Discord account</CardHeader>
      <CardSubheader>
        Linking your Discord account will enable you to use Discord bot commands
        and login to the website using your Discord credentials.
      </CardSubheader>
      {!isLoading && data && !data.linked && (
        <div className="max-w-xs px-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => void signIn("discord", { callbackUrl: "/" })}
          >
            <FontAwesomeIcon icon={faDiscord} className="h-6 w-6" />
            Link Discord account
          </button>
        </div>
      )}
      {!isLoading && data && data.linked && (
        <span className="px-4 font-semibold text-green-400">
          Your Discord account is linked!
        </span>
      )}
      {isLoading && <Loader />}
      <div></div>
    </CardContainer>
  );
};

export default DiscordCard;
