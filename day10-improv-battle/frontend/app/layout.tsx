import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Improv Battle - Voice Game Show",
  description: "Test your improv skills with an AI host",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
