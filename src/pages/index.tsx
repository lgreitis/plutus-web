import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import LandingLayout from "src/components/layouts/landingLayout";
import Footer from "src/modules/footer/footer";
import DiscordSection from "src/modules/hero/discordSecrion";
import Hero from "src/modules/hero/hero";
import Navbar from "src/modules/navbar/navbar";
import { getServerAuthSession } from "src/server/auth";

// We redirect authed users straight to the dashboard
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerAuthSession(context);

    if (session) {
      return {
        redirect: {
          destination: "/overview",
          permanent: false,
        },
      };
    }

    return { props: {} };
  } catch {
    return {
      redirect: {
        destination: "/offline",
        permanent: false,
      },
    };
  }
};

const Home: NextPage = () => {
  return (
    <LandingLayout>
      <Navbar />
      <Hero />
      <DiscordSection />
      <Footer />
    </LandingLayout>
  );
};

export default Home;
