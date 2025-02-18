"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => setScrollY(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="md:h-screen flex md:flex-row flex-col-reverse items-center md:justify-around justify-center bg-[#060606] relative overflow-hidden pt-10 md:py-10">
      <h1 className="sr-only">Click Store TN - Best Deals on Films, PS5 Consoles, Games, and Accessories in Tunisia</h1>
      <Image
        src="/click.bmp"
        alt="Click Store TN - Best Deals on Films, PS5 Consoles, Games, and Accessories in Tunisia"
        width={1000}
        height={1000}
        style={{ transform: `translateY(${scrollY * 3}px)` }}
        loading="lazy"
      />
    </section>
  );
}