"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

type Props = { children: React.ReactNode };

export default function ClerkProviderClient({ children }: Props) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (!publishableKey) {
    return <>{children}</>;
  }
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
