import Head from "next/head";
import { CirclesBottom, CirclesTop } from "./hero/circles";

type Props = {
  children?: React.ReactNode;
};

const LandingLayout = (props: Props) => {
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
        {props.children}
      </div>
    </>
  );
};
export default LandingLayout;
