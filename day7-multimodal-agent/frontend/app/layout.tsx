import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickMart Express - Voice Grocery Ordering",
  description: "Order your groceries with voice commands powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  );
}
