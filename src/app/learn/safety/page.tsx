import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Article } from "@/components/learn/article";

export default function SafetyPage() {
  const section = SECTIONS.find((s) => s.href === "/learn")!;
  return (
    <SectionShell
      title="Wallet Safety"
      description="Avoid the most common ways people lose funds in Solana DeFi."
      badge="Security"
      baseHref="/learn"
    >
      <Article
        level="Beginner"
        readTime="5 min"
        title="A practical safety checklist"
        subtitle="The Solana ecosystem is fast and cheap — which also means scams move fast. Use this checklist before every trade."
        sections={[
          {
            heading: "1. Verify the URL",
            body:
              "Always check the URL bar. Phishing copies look identical. Bookmark Lumen and trusted apps. Never click drop links from DMs.",
          },
          {
            heading: "2. Inspect what you sign",
            body:
              "Wallet adapters now show simulation results. Read them. Watch for: 'set authority', 'transfer all SOL', 'arbitrary CPI'. Reject if uncertain.",
          },
          {
            heading: "3. Use a hot/cold split",
            body:
              "Keep a small hot wallet for trading and a cold wallet (Ledger) for long-term holdings. Never sign large authorities with the cold wallet.",
            bullets: [
              "Rotate hot wallets monthly.",
              "Revoke unused token approvals via Solscan / Solana FM.",
              "Never paste your seed into any website. Ever.",
            ],
          },
          {
            heading: "4. When in doubt, walk away",
            body:
              "Pressure tactics are a red flag. Real opportunities don't expire in 60 seconds. Take 10 minutes, ask in a trusted Discord, then decide.",
          },
        ]}
      />
    </SectionShell>
  );
}
