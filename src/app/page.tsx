"use client";

import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "./Footer";
import Hero from "./Hero";
import Presentation from "./Presentation";
import Store from "./Store";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Click Store TN - Best Deals on Films, Consoles & Anti-casse</title>
        <meta name="description" content="Shop the best deals on films, consoles, and anti-casse in Tunisia. Fast delivery and top-notch customer service!" />
        <meta name="keywords" content="Click Store TN, buy films, gaming consoles, anti-casse, Tunisia, best prices, electronics store" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Main Content */}
      <div className="min-h-screen">
        <Hero />
        <Store />
        <Presentation />
        <Map />
        <Footer />
      </div>
    </>
  );
}
