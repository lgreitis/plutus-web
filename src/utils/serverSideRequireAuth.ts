import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  PreviewData,
} from "next";
import type { ParsedUrlQuery } from "querystring";
import { getServerAuthSession } from "src/server/auth";
import { prisma } from "src/server/db";

export const serverSideRequireAuth: GetServerSideProps = async (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const steamAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "steam" },
  });

  if (!steamAccount || !steamAccount.steamid) {
    // console.log(session.user);
    return {
      redirect: {
        destination: "/link-steam-account",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
