import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import LandingLayout from "src/components/layouts/landingLayout";

const SteamUserExists: NextPage = () => {
  return (
    <LandingLayout>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-semibold">
            Couldn&apos;t link your account with Steam!
          </h1>
          <h2>You already have a Plutus account using Steam. </h2>
          <h2>
            Connect to your Steam account and connect Discord in user settings
            window.
          </h2>
          <button
            type="button"
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-md border border-transparent bg-stone-700 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-600 focus:ring-offset-2"
            onClick={() => void signIn("steam", { callbackUrl: "/" })}
          >
            <FontAwesomeIcon icon={faSteam} className="h-6 w-6" />
            Continue with Steam
          </button>
        </div>
      </div>
    </LandingLayout>
  );
};

export default SteamUserExists;
