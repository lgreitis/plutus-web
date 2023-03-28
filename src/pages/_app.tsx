// import localFont from "@next/font/local";
import { Inter } from "@next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
        <title>Plutus</title>
        <meta property="og:site_name" content="Plutus"></meta>
        <meta
          property="og:description"
          content="The ultimate tool for CS:GO players and investors."
        />
        <meta
          property="og:image"
          content="https://plutus.lukasgreicius.com/plutus-banner.png"
        />
        <meta property="og:image:width" content="1280"></meta>
        <meta property="og:image:height" content="640"></meta>
        <meta
          name="description"
          content="The ultimate tool for CS:GO players and investors."
        ></meta>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        ></meta>
        <meta
          name="theme-color"
          content="#101214"
          media="(prefers-color-scheme: dark)"
        ></meta>
      </Head>
      <ThemeProvider enableSystem={true} attribute="class">
        <SessionProvider session={session}>
          <Component {...pageProps} />
          <Analytics />
        </SessionProvider>
      </ThemeProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
