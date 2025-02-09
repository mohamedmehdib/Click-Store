import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Click Store",
  description: "The ultimate destination for all your shopping needs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}
