"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { swrFetcher } from "@/lib/api-client";

interface SwrProviderProps {
  children: ReactNode;
}

export function SwrProvider({ children }: SwrProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (key) => swrFetcher(key as string),
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

