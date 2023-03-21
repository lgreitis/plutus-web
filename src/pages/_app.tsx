// import localFont from "@next/font/local";
import { Inter } from "@next/font/google";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import { api } from "../utils/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Head>
      <meta property="og:title" content="Plutus" />
        <meta
          property="og:description"
          content="The ultimate tool for CS:GO players and investors"
        />
        <meta
          property="og:image"
          content="https://plutus.lukasgreicius.com/plutus-banner.png"
        />
      </Head>
      <ThemeProvider enableSystem={true} attribute="class">
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ThemeProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
