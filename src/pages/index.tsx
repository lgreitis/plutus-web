import { type NextPage } from "next";
import Hero from "../components/hero/hero";
import LandingLayout from "../components/landingLayout";
import Navbar from "../components/navbar/navbar";

const Home: NextPage = () => {
  return (
    <LandingLayout>
      <Navbar />
      <Hero />
    </LandingLayout>
  );
};

export default Home;
