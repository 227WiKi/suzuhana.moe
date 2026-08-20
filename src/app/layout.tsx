import type { Metadata } from "next";
import "./globals.css";
import FloatingActions from "@/components/FloatingActions";
import AppProviders from "@/components/AppProviders";

const themeScriptCompatibility = `
  globalThis.__name ||= ((target, value) =>
    Object.defineProperty(target, "name", { value, configurable: true }));
`;

export const metadata: Metadata = {
  title: "Suzuhana Moe Archive",
  description: "A comprehensive archive of tweets and media.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Next 16 can emit this helper reference in next-themes' inline
            bootstrap after the Workers production transform. */}
        <script dangerouslySetInnerHTML={{ __html: themeScriptCompatibility }} />
      </head>
      <body className="font-sans antialiased bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white">
        <AppProviders>
          {children}
          <FloatingActions />
        </AppProviders>
      </body>
    </html>
  );
}
