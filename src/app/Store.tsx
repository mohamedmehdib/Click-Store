"use client";

import React, { useState, useEffect, useRef } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import Navbar from "./Navbar";

const poppins = Poppins({ subsets: ["latin"], weight: "400" });

interface Items {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface Category {
  name: string;
  subcategories: string[];
}

export default function TopSeller() {
  const { user } = useAuth();
  const [items, setItems] = useState<Items[]>([]);
  const [filteredIems, setFilteredItems] = useState<Items[]>([]);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cartUpdated, setCartUpdated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(1);

  const itemsPerPage = columns * 6;
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) console.error("Error fetching categories:", error.message);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSneakers = async () => {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
      if (selectedCategory !== "All") query = query.eq("category", selectedCategory);
      if (selectedSubcategory !== "All") query = query.eq("subcategory", selectedSubcategory);

      const { data, error } = await query;
      if (error) console.error("Error fetching items:", error.message);
      else {
        setItems(data || []);
        setCurrentPage(1);
      }
    };
    fetchSneakers();
  }, [searchQuery, selectedCategory, selectedSubcategory]);

  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    setFilteredItems(items.slice(start, start + itemsPerPage));
  }, [items, currentPage, itemsPerPage]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setColumns(3);
      else if (window.innerWidth >= 640) setColumns(2);
      else setColumns(1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddToCart = async (item: Items) => {
    if (!user) return alert("Please sign in to add items to your cart.");
    setAddedItems((prev) => new Set(prev).add(item.name));

    const { data: userData, error } = await supabase
      .from("users")
      .select("id, cart")
      .eq("email", user.email)
      .single();

    if (error) {
      console.error("Error fetching user's data:", error.message);
      return;
    }

    const updatedCart: CartItem[] = userData.cart || [];
    const existingItem = updatedCart.find((cartItem) => cartItem.name === item.name);
    if (existingItem) existingItem.quantity += 1;
    else updatedCart.push({ name: item.name, quantity: 1, price: item.price, image_url: item.image_url });

    const { error: updateError } = await supabase
      .from("users")
      .update({ cart: updatedCart })
      .eq("id", userData.id);

    if (updateError) console.error("Error updating user's cart:", updateError.message);
    else setCartUpdated((prev) => !prev);
  };

  return (
    <div className="bg-blue-50 min-h-screen py-10" ref={topRef}>
      <h1 className="sr-only">Top Sellers at Click Store TN - Best Deals on Films, PS5 Consoles, Games, and Accessories in Tunisia</h1>
      <Navbar cartUpdated={cartUpdated} />
      <h1 className={`${poppins.className} text-4xl md:text-5xl text-center text-blue-600 mb-8`}>
        Boutique
      </h1>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 px-4 md:px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden mb-4 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            {isSidebarOpen ? "Close Filters" : "Open Filters"}
          </button>
          <div
            className={`flex flex-col gap-4 ${
              isSidebarOpen ? "block" : "hidden"
            } md:block border-r border-gray-600 h-full p-6`}
          >
            <div>
              <h3 className="font-semibold mb-2">Recherche</h3>
              <input
                type="text"
                placeholder="Recherche des articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Catégories</h3>
              <ul className="space-y-2">
                <li
                  className={`cursor-pointer p-2 rounded-md hover:bg-blue-200 transition ${
                    selectedCategory === "All" ? "bg-blue-100 font-bold" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedSubcategory("All");
                  }}
                >
                  All
                </li>
                {categories.map((category) => (
                  <li key={category.name}>
                    <div
                      className={`cursor-pointer flex justify-between p-2 rounded-md hover:bg-blue-200 transition ${
                        selectedCategory === category.name ? "bg-blue-100 font-bold" : ""
                      }`}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setSelectedSubcategory("All");
                      }}
                    >
                      {category.name}
                    </div>
                    {selectedCategory === category.name && (
                      <ul className="pl-6 mt-2 space-y-1">
                        {category.subcategories.map((sub) => (
                          <li
                            key={sub}
                            className={`cursor-pointer p-1 rounded-md hover:bg-blue-100 transition ${
                              selectedSubcategory === sub ? "bg-blue-100 font-bold" : ""
                            }`}
                            onClick={() => setSelectedSubcategory(sub)}
                          >
                            {sub}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12 px-8">
          {filteredIems.map((item) => (
            <div
              key={item.id}
              className="bg-white h-fit rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
            >
              <div className="relative aspect-square">
                <Image
                  src={item.image_url || "/default-image.png"}
                  alt={`${item.name} - Available at Click Store TN for ${item.price} Dt`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="pt-4 text-center">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-blue-500 mt-2">{item.price} Dt</p>
                {!item.is_available ? (
                  <div className="p-4 text-red-500">
                    <button
                      className={`w-full py-2 cursor-default }`}
                    >
                      Pas disponible
                    </button>
                  </div>
                ) : (
                  <div className="p-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-full py-2 rounded-md text-white transition ${
                        addedItems.has(item.name)
                          ? "bg-green-500"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {addedItems.has(item.name) ? "Ajouté au panier" : "Ajouter au panier"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredIems.length === 0 && (
            <p className="text-center text-gray-500 text-xl col-span-full">
              No items available at the moment.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: Math.ceil(items.length / itemsPerPage) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            } transition`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}