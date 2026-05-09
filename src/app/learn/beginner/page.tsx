import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Article } from "@/components/learn/article";

export default function BeginnerPage() {
  const section = SECTIONS.find((s) => s.href === "/learn")!;
  return (
    <SectionShell
      title="Beginner Guides"
      description="Brand new to Solana DeFi? Start here."
      badge="Start"
      baseHref="/learn"
    >
      <Article
        level="Beginner"
        readTime="6 min"
        title="Your first Solana swap, end to end"
        subtitle="Wallets, RPCs, slippage, and what actually happens when you click 'Swap'. No prior crypto knowledge required."
        sections={[
          {
            heading: "1. What is a wallet?",
            body:
              "A Solana wallet is just a keypair. The private key signs transactions; the public key is your address. Lumen never holds your keys — you sign locally with Phantom, Solflare, or any wallet adapter compatible app.",
            bullets: [
              "Never share your seed phrase. Lumen will never ask for it.",
              "Hardware wallets (Ledger) are recommended for large balances.",
              "You can connect multiple wallets in the topbar.",
            ],
          },
          {
            heading: "2. The role of RPC and Jupiter",
            body:
              "An RPC node lets your wallet talk to the Solana network. Jupiter is a price/route aggregator: it scans every DEX (Raydium, Orca, Phoenix, Meteora…) and finds the best multi-hop output for your trade.",
          },
          {
            heading: "3. Slippage and price impact",
            body:
              "Slippage tolerance is the maximum acceptable price movement between quote and execution. Price impact is the immediate hit your trade has on the pool. Lumen highlights when impact is high so you can split orders.",
          },
          {
            heading: "4. Confirming your swap",
            body:
              "After signing, the transaction is broadcast to a validator. Lumen shows real-time status: pending → confirmed → finalized. If a swap fails, your funds remain in your wallet — only the network fee is consumed.",
          },
        ]}
      />
    </SectionShell>
  );
}
