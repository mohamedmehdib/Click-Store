import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, email, phone, address');

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAllEmails = () => {
    const allEmails = users.map((user) => user.email).join(', ');
    navigator.clipboard
      .writeText(allEmails)
      .then(() => {
        alert('All emails copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy emails:', err);
        alert('Failed to copy emails. Please try again.');
      });
  };

  if (loading) return <div className="text-center text-lg text-gray-600">Loading...</div>;
  if (!users.length) return <div className="text-center text-lg text-gray-600">No users found</div>;

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Users</h1>
      <button
        onClick={copyAllEmails}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 mb-6"
      >
        Copy All Emails
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Phone:</span> {user.phone}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Address:</span> {user.address}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}