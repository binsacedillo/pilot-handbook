"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

type Props = { children: React.ReactNode };

export default function ClerkProviderClient({ children }: Props) {
  const isE2E = process.env.NEXT_PUBLIC_E2E === "true";

  if (isE2E) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
