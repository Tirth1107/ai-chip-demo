import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tirth Joshi — A Demo By Tirth Joshi",
  description:
    "A Demo By Tirth Joshi — Experience the NeuralCore X1: 256 billion parameters, built for speed, designed for scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[#0a0a0a]`}>
        {children}
      </body>
    </html>
  );
}
