"use client";
import { useState, useEffect } from "react";
import Image from "next/image";


export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="md:h-screen flex md:flex-row flex-col-reverse items-center md:justify-around justify-center bg-[#060606] relative overflow-hidden pt-10 md:py-10">
      <Image src="/click.bmp" alt="Hero" width={1000} height={1000} style={{ transform: `translateY(${scrollY * 3}px)` }}/>
    </div>
  );
}
