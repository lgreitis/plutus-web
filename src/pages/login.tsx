import { faDiscord, faSteam } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowSmallLeftIcon } from "@heroicons/react/24/outline";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Link from "next/link";
import LandingLayout from "src/components/layouts/landingLayout";

const Login: NextPage = () => {
  return (
    <LandingLayout>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <h1 className="pb-6 text-center text-3xl font-semibold">
            Log in to Plutus
          </h1>
          <button
            type="button"
            className=" flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-stone-700 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-600 focus:ring-offset-2"
            onClick={() => void signIn("steam", { callbackUrl: "/" })}
          >
            <FontAwesomeIcon icon={faSteam} className="h-6 w-6" />
            Continue with Steam
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => void signIn("discord", { callbackUrl: "/" })}
          >
            <FontAwesomeIcon icon={faDiscord} className="h-6 w-6" />
            Continue with Discord
          </button>
          <Link
            href="/"
            className="flex w-fit items-center justify-center gap-2 pt-4 hover:cursor-pointer"
          >
            <ArrowSmallLeftIcon className="h-4 w-4 [&>path]:stroke-[2.5]" />
            Back
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Login;
