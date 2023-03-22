import Link from "next/link";
import LandingLayout from "src/components/layouts/landingLayout";
const Offline = () => {
  return (
    <LandingLayout>
      <main className="flex min-h-full items-center justify-center">
        <div className="max-w-lg text-center">
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            We&apos;re offline :(
          </h1>
          <p className="mt-6 text-2xl leading-7 text-neutral-700 dark:text-neutral-400">
            We apologize, but the service is currently offline.
          </p>
          <p className="mt-6 leading-7 text-neutral-700 dark:text-neutral-400">
            To keep our servers running smoothly, please consider making a
            donation to my{" "}
            <Link
              className="text-black dark:text-white"
              href="https://ko-fi.com/lgreitis"
            >
              ko-fi
            </Link>{" "}
            page.
          </p>
        </div>
      </main>
    </LandingLayout>
  );
};

export default Offline;
