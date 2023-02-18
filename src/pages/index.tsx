import { type NextPage } from "next";
import Head from "next/head";
import { CirclesBottom, CirclesTop } from "../components/hero/circles";
import Hero from "../components/hero/hero";
import Navbar from "../components/navbar/navbar";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Plutus</title>
        {/* <meta name="description" content="Plutus" /> */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="isolate h-screen min-h-screen dark:bg-bg-dark">
        <CirclesTop />
        <CirclesBottom />
        <Navbar />
        <Hero />
      </div>
    </>
  );
};

export default Home;
