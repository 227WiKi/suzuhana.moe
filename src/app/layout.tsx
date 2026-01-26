import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Suzuhana Moe Archive",
  description: "A comprehensive archive of tweets and media.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}