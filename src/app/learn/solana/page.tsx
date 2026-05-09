import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Article } from "@/components/learn/article";

export default function SolanaBasicsPage() {
  const section = SECTIONS.find((s) => s.href === "/learn")!;
  return (
    <SectionShell
      title="Solana Basics"
      description="Slot, leader schedule, accounts, transactions — everything an aggregator user should know."
      badge="Foundations"
      baseHref="/learn"
    >
      <Article
        level="Beginner"
        readTime="7 min"
        title="A quick tour of how Solana works"
        subtitle="Solana is a high-throughput, single-shard chain with sub-second blocks. Understanding its building blocks makes DeFi much less mysterious."
        sections={[
          {
            heading: "1. Accounts, not balances",
            body:
              "Everything on Solana is an account: your wallet, an SPL token holding, a program, a market. Each account has an owner program that controls how it can be modified. Token balances live in associated token accounts (ATAs) tied to your wallet.",
          },
          {
            heading: "2. Transactions and instructions",
            body:
              "A transaction is a bundle of instructions that must succeed atomically. Jupiter swaps are typically single-transaction multi-instruction operations: route hops, ATA creation, and the final transfer all packed together.",
          },
          {
            heading: "3. Slots and finality",
            body:
              "Solana produces ~2 blocks/second. After ~32 slots a transaction is considered finalized. Lumen displays optimistic confirmation as soon as the validator processes your tx — usually under a second.",
          },
          {
            heading: "4. Fees on Solana",
            body:
              "Base fee is 5000 lamports plus an optional priority fee bid. During congestion, raising the priority fee increases your inclusion probability. Lumen's fee estimator shows real-time stats so you can tune wisely.",
          },
        ]}
      />
    </SectionShell>
  );
}
