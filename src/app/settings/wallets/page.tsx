"use client";

import { SectionShell } from "@/components/shell/section-shell";
import { UTILITY_SECTIONS } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink, Copy, Trash2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useMounted } from "@/hooks/use-mounted";
import { Badge } from "@/components/ui/badge";
import { shortenAddress } from "@/lib/utils";
import { toast } from "sonner";

export default function WalletsSettingsPage() {
  const section = UTILITY_SECTIONS.find((s) => s.href === "/settings")!;
  const mounted = useMounted();
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const tracked = usePortfolioStore((s) => s.trackedWallets);
  const removeWallet = usePortfolioStore((s) => s.removeWallet);

  return (
    <SectionShell
      title="Wallets"
      description="Connect a wallet and manage tracked addresses."
      badge="Multi-wallet"
      baseHref="/settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" /> Connected wallet
            </CardTitle>
            <CardDescription>Phantom, Solflare, Trust, and any wallet-adapter compatible app.</CardDescription>
          </CardHeader>
          <CardContent>
            {!mounted ? null : connected && publicKey ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-emerald-400/40 to-violet-500/30 grid place-items-center text-xs">
                      {wallet?.adapter.name?.slice(0, 2) ?? "SO"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{wallet?.adapter.name ?? "Wallet"}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {shortenAddress(publicKey.toBase58(), 6)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">CONNECTED</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(publicKey.toBase58());
                      toast.success("Address copied");
                    }}
                  >
                    <Copy className="size-3.5" /> Copy
                  </Button>
                  <Button variant="ghost" onClick={() => disconnect()}>
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted-foreground">
                  No wallet connected
                </div>
                <Button variant="gradient" onClick={() => setVisible(true)} className="w-full">
                  Connect a wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tracked wallets</CardTitle>
            <CardDescription>Read-only addresses you follow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!mounted || tracked.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted-foreground">
                Add tracked wallets in Portfolio → Wallet Overview.
              </div>
            ) : (
              tracked.map((w) => (
                <div
                  key={w}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                >
                  <span className="font-mono text-xs">{shortenAddress(w, 6)}</span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(w);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeWallet(w)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <a
              href="https://docs.solana.com/wallet-guide"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mt-3"
            >
              Solana wallet guide <ExternalLink className="size-3" />
            </a>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}
