"use client"
import Footer from "./Footer";
import Hero from "./Hero";
import Presentation from "./Presentation";
import Store from "./Store";

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-">
      <Hero />
      <Store />
      <Presentation />
      <Map />
      <Footer/>
    </div>
  );
}
