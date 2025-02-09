"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "../Navbar";
import Footer from "../Footer";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

const Success = () => {
  const { user } = useAuth();
  const [cartUpdated, setCartUpdated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [orderProcessed, setOrderProcessed] = useState<boolean>(false);

  const sendAdminEmail = async (email: string, cart: CartItem[], totalPrice: number) => {
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          cart,
          totalPrice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error sending email:", data.error);
      } else {
        console.log("Email sent successfully:", data.success);
      }
    } catch (error) {
      console.error("Error while sending email:", error);
    }
  };

  useEffect(() => {
    const handleOrderSuccess = async () => {
      if (user && !orderProcessed && !loading) {
        setLoading(true);
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("email, cart")
            .eq("email", user.email)
            .single();

          if (userError) {
            console.error("Error fetching user's cart:", userError.message);
            setLoading(false);
            return;
          }

          const { email, cart } = userData || {};

          if (cart && cart.length > 0) {
            const totalPrice = cart.reduce(
              (sum: number, item: CartItem) =>
                sum + item.price * item.quantity,
              0
            );

            const { error: orderError } = await supabase
              .from("orders")
              .insert([
                {
                  email,
                  items: JSON.stringify(cart),
                  total_price: totalPrice,
                  status: "pending",
                },
              ]);

            if (orderError) {
              console.error("Error adding order to orders table:", orderError.message);
              setLoading(false);
              return;
            } else {
              console.log("Order added successfully.");
              setOrderProcessed(true);
            }

            await sendAdminEmail(email, cart, totalPrice);
          } else {
            console.log("Cart is empty or not valid.");
          }

          const { error: clearCartError } = await supabase
            .from("users")
            .update({ cart: null })
            .eq("email", user.email);

          if (clearCartError) {
            console.error("Error clearing cart:", clearCartError.message);
          } else {
            console.log("Cart cleared successfully.");
          }

          setTimeout(() => {
            setCartUpdated(true);
            setLoading(false);
          }, 2000);
        } catch (error) {
          console.error("Unexpected error:", error);
          setLoading(false);
        }
      }
    };

    handleOrderSuccess();
  }, [user, orderProcessed, loading]);

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <Navbar cartUpdated={cartUpdated} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600">Success!</h1>
          <p className="text-xl text-gray-600">The order was confirmed!</p>
          <div>
            <Link
              href="/"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Success;
