import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LogoIcon } from "src/components/logo";
import ModalButton from "src/components/modal/modalButton";

const DiscordSection = () => {
  return (
    <div className="-mt-12 flex  w-full flex-col items-center justify-center gap-6 p-8 py-24">
      <div className="flex h-24 items-center gap-2 text-7xl">
        <FontAwesomeIcon icon={faDiscord} className="h-24 w-24" />
        {"+"}
        <LogoIcon className="w-24 dark:fill-white" />
      </div>
      <h1 className="flex items-center gap-3 text-center text-4xl font-bold">
        Discord bot.
      </h1>
      <h2 className="max-w-4xl text-center text-xl">
        You can incorporate certain Plutus features into your Discord server by
        simply adding our Discord bot.
      </h2>
      <ModalButton
        className="max-w-xs"
        onClick={() => {
          window.open(
            "https://discord.com/api/oauth2/authorize?client_id=1076127754375933992&permissions=2048&scope=bot",
            "_blank",
            "noreferrer"
          );
        }}
      >
        Add Discord bot
      </ModalButton>
    </div>
  );
};

export default DiscordSection;
