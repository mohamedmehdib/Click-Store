"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../Navbar";
import Footer from "../Footer";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      const fetchCartItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("cart")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching cart items:", error.message);
        } else if (data?.cart) {
          setCartItems(data.cart);
        }
        setIsLoading(false);
      };

      fetchCartItems();
    }
  }, [user]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    updateCartInDb(updatedCart);
  };

  const handleRemoveItem = (itemId: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    updateCartInDb(updatedCart);
  };

  const updateCartInDb = async (updatedCart: CartItem[]) => {
    if (user) {
      const { error } = await supabase
        .from("users")
        .update({ cart: updatedCart })
        .eq("email", user.email);

      if (error) {
        console.error("Error updating cart in database:", error.message);
      }
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = 8;
  const finalPrice = totalPrice + deliveryFee;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar cartUpdated={true} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Your Cart
        </h1>

        {!user ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl text-gray-600 py-5">
              You need to be logged in to view your cart.
            </p>
            <Link
              href="/SignIn"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl text-gray-600 py-5">Loading cart items...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl text-gray-600 py-5">Your cart is empty.</p>
            <Link
              href="/"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4"
                >
                  <div className="w-full sm:w-1/4 lg:w-1/5 aspect-square relative">
                    <Image
                      src={item.image_url || "/default-image.png"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-gray-600">Price: {item.price} Dt</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value))
                      }
                    />
                    <div className="text-lg font-semibold text-gray-800">
                      {(item.price * item.quantity).toFixed(2)} Dt
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600 text-sm"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center text-lg font-semibold text-gray-800">
              <h2>Total</h2>
              <p>{totalPrice.toFixed(2)} Dt</p>
            </div>

            <div className="mt-2 flex justify-between items-center text-lg font-semibold text-gray-800">
              <h2>Delivery Fee</h2>
              <p>{deliveryFee} Dt</p>
            </div>

            <div className="mt-6 flex justify-between items-center text-lg font-semibold text-gray-800">
              <h2>Final Total</h2>
              <p>{finalPrice.toFixed(2)} Dt</p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/Success"
                className={`px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${
                  isPaymentLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setIsPaymentLoading(true)}
              >
                {isPaymentLoading
                  ? "Processing Payment..."
                  : "Confirm the order"}
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
