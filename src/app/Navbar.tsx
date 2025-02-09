"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  cartUpdated: boolean;
}

interface CartItem {
  quantity: number;
}

export default function Navbar({ cartUpdated }: NavbarProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isAccountDisabled, setIsAccountDisabled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCartItemsCount = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("cart")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching cart items:", error.message);
        } else if (data?.cart) {
          const totalItems = (data.cart as CartItem[]).reduce(
            (acc, item) => acc + item.quantity,
            0
          );
          setCartItemsCount(totalItems);
        }
      };

      fetchCartItemsCount();
    }
  }, [user?.email, cartUpdated, user]);

  const handleAccountClick = () => {
    setIsAccountDisabled(true);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full transition-shadow duration-300 z-50 bg-blue-50 ${
        isScrolled ? "shadow-xl" : ""
      }`}
    >
      <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.8/css/line.css"></link>
      <div className="flex justify-between items-center h-20 px-5">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={100} height={100} className="h-16 w-16" />
        </Link>

        <div className="md:hidden cursor-pointer z-50" onClick={toggleMenu}>
          {!isOpen ? (
            <i className="uil uil-bars text-2xl"></i>
          ) : (
            <i className="uil uil-multiply text-2xl"></i>
          )}
        </div>

        <div className="space-x-3 hidden md:flex items-center">
          <Link href="/Cart" className="flex items-center space-x-2">
            <i className="uil uil-shopping-cart-alt text-2xl"></i>
            <span className="bg-blue-500 text-white flex rounded-full h-8 w-8 justify-center items-center font-sans font-semibold">
              {cartItemsCount}
            </span>
          </Link>
          <Link
            href="/Account"
            className={`bg-blue-500 text-white p-4 rounded-lg ${
              isAccountDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={isAccountDisabled ? (e) => e.preventDefault() : handleAccountClick}
          >
            Account
          </Link>
        </div>
      </div>

      <div
        className={`fixed space-y-5 top-0 left-0 bg-blue-50 w-full h-screen flex flex-col items-center justify-center transition-transform duration-300 ease-in-out z-40 md:hidden ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="text-xl font-semibold hover:text-blue-500"
        >
          Home
        </Link>
        <Link href="/Cart" onClick={() => setIsOpen(false)} className="text-xl font-semibold hover:text-blue-500">
          Cart
        </Link>
        <Link
          href="/Account"
          onClick={() => setIsOpen(false)}
          className="text-xl font-semibold hover:text-blue-500"
        >
          Account
        </Link>
      </div>
    </div>
  );
}
