'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  user_id: string;
  email: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  created_at: string;
  name?: string;
  phone?: string;
  address?: string;
}

interface User {
  email: string;
  name: string;
  phone: string;
  address: string;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchOrdersAndUsers();
  }, []);

  const fetchOrdersAndUsers = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*");

      if (ordersError) throw new Error(`Orders fetch error: ${ordersError.message}`);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("email, name, phone, address");

      if (usersError) throw new Error(`Users fetch error: ${usersError.message}`);

      const formattedOrders = ordersData?.map((order) => {
        const user = usersData?.find((u: User) => u.email === order.email);

        return {
          ...order,
          items: JSON.parse(order.items),
          name: user?.name || "Unknown",
          phone: user?.phone || "Unknown",
          address: user?.address || "Unknown",
        };
      }) as Order[];

      const sortedOrders = formattedOrders?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(sortedOrders || []);
    } catch (error) {
      console.error("Error fetching orders or users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Error deleting order:", error.message);
    } else {
      fetchOrdersAndUsers();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-center">Orders Management</h2>

      {loading ? (
        <div className="text-center my-6">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border-b py-3 px-2 sm:px-4 text-left text-sm sm:text-base">Client Name</th>
                <th className="border-b py-3 px-2 sm:px-4 text-left text-sm sm:text-base">Phone</th>
                <th className="border-b py-3 px-2 sm:px-4 text-left text-sm sm:text-base">Address</th>
                <th className="border-b py-3 px-2 sm:px-4 text-left text-sm sm:text-base">Products</th>
                <th className="border-b py-3 px-2 sm:px-4 text-left text-sm sm:text-base">Date</th>
                <th className="border-b py-3 px-2 sm:px-4 text-left text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border-b py-2 px-2 sm:px-4 text-sm">{order.name}</td>
                  <td className="border-b py-2 px-2 sm:px-4 text-sm">{order.phone}</td>
                  <td className="border-b py-2 px-2 sm:px-4 text-sm">{order.address}</td>
                  <td className="border-b py-2 px-2 sm:px-4 text-sm">
                    <ul className="list-disc pl-4">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name} (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border-b py-2 px-2 sm:px-4 text-sm">{formatDate(order.created_at)}</td>
                  <td className="border-b py-2 px-2 sm:px-4 flex flex-col sm:flex-row sm:space-x-2">
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
