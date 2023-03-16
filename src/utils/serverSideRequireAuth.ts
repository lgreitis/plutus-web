import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  PreviewData,
} from "next";
import type { ParsedUrlQuery } from "querystring";
import { getServerAuthSession } from "src/server/auth";

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

  return { props: {} };
};
