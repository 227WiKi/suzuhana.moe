"use client";

import { ThemeProvider } from "next-themes";
import { LightboxProvider } from "./LightboxProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <LightboxProvider>{children}</LightboxProvider>
    </ThemeProvider>
  );
}
