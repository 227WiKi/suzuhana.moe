"use client";

import { useContext, useRef } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePresence } from "framer-motion";

export function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context);
  const [isPresent] = usePresence();


  if (isPresent) {
    frozen.current = context;
  }

  if (!context) {
    return <>{children}</>;
  }


  return (
    <LayoutRouterContext.Provider value={isPresent ? context : frozen.current}>
      {children}
    </LayoutRouterContext.Provider>
  );
}