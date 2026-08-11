"use client";

import { useContext, useState } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePresence } from "framer-motion";

export function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const [frozenContext] = useState(context);
  const [isPresent] = usePresence();

  if (!context) return <>{children}</>;

  return (
    <LayoutRouterContext.Provider value={isPresent ? context : frozenContext}>
      {children}
    </LayoutRouterContext.Provider>
  );
}
