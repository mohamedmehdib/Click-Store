import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-blue-50 font-sans pt-16 pb-10 space-y-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://www.facebook.com/CyberstationSousse?mibextid=ZbWKwL" className="text-gray-600 hover:text-blue-500 transition">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/click.store0?igsh=MWs2aHo3cmM2dWc2dQ==" className="text-gray-600 hover:text-blue-500 transition">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Phone: <span className="font-medium">73 213 065 / 55 008 585</span></li>
              <li>Email: clickstoretunisie@gmail.com</li>
              <li>Adresse : Imm Rahma Rue Mongi Bali korniche Sousse 4056</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-300 mt-10" />

        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0 mt-6">
          <span className="text-gray-500">
            © 2025 <span className="font-semibold text-blue-700">Click Store</span>. All rights reserved.
          </span>
          <span className="text-gray-500">
            Powered by{' '}
            <span className="font-medium text-blue-700 hover:text-blue-500 transition">
              Click Store
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}