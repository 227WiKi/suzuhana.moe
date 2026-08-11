import type { Metadata } from "next";
import "./globals.css";
import FloatingActions from "@/components/FloatingActions";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Suzuhana Moe Archive",
  description: "A comprehensive archive of tweets and media.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white">
        <AppProviders>
          {children}
          <FloatingActions />
        </AppProviders>
      </body>
    </html>
  );
}
