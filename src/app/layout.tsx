import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suzuhana Moe Archive",
  description: "A comprehensive archive of tweets and media.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 dark:bg-black text-black dark:text-white antialiased">
        {children}
      </body>
    </html>
  );
}