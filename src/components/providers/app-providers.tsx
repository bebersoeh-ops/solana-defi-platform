"use client";

import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { SolanaWalletProvider } from "./wallet-provider";
import { CommandPalette } from "@/components/shell/command-palette";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SolanaWalletProvider>
      {children}
      <CommandPalette />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "!bg-[#0a0c12]/90 !backdrop-blur-xl !border !border-white/10 !text-foreground !shadow-2xl",
            description: "!text-muted-foreground",
          },
        }}
      />
    </SolanaWalletProvider>
  );
}
