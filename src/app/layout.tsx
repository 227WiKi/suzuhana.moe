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
  description: "An archive of X and Instagram posts from 22/7 members.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Next 16 can emit this helper reference in next-themes' inline
            bootstrap after the Workers production transform. */}
        <script dangerouslySetInnerHTML={{ __html: themeScriptCompatibility }} />
      </head>
      <body className="font-sans antialiased bg-background dark:bg-black text-foreground">
        <AppProviders>
          {children}
          <FloatingActions />
        </AppProviders>
      </body>
    </html>
  );
}
