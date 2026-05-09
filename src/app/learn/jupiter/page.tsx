import { SectionShell } from "@/components/shell/section-shell";
import { SECTIONS } from "@/lib/navigation";
import { Article } from "@/components/learn/article";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import { JUPITER_API_BASE } from "@/lib/constants";

export default function JupiterDocsPage() {
  const section = SECTIONS.find((s) => s.href === "/learn")!;
  return (
    <SectionShell
      title="Jupiter Integration Docs"
      description="How Lumen integrates Jupiter's quote and swap API."
      badge="Reference"
      baseHref="/learn"
    >
      <Article
        level="Intermediate"
        readTime="8 min"
        title="Jupiter v6 quote → swap flow"
        subtitle="Lumen calls Jupiter's REST API to fetch quotes and build versioned transactions. Here's what each request does."
        sections={[
          {
            heading: "1. Fetch a quote",
            body: `GET ${JUPITER_API_BASE}/swap/v1/quote with inputMint, outputMint, amount (lamports), and slippageBps. The response includes the best route plan, expected output, and price impact.`,
            bullets: [
              "Lumen debounces inputs and refreshes every 12s by default.",
              "Use slippageBps=auto to defer to Jupiter's recommended slippage.",
              "Use restrictIntermediateTokens to reduce hops.",
            ],
          },
          {
            heading: "2. Build a swap transaction",
            body:
              "POST /swap/v1/swap with the previous quote and the user's public key. The response is a base64-encoded versioned transaction. Lumen never asks for or stores your private key.",
          },
          {
            heading: "3. Sign and broadcast",
            body:
              "Sign with your wallet adapter, send via your RPC, and confirm. Lumen surfaces pending → success → fail states in the toast and notifications drawer.",
          },
          {
            heading: "4. Error handling",
            body:
              "Common errors: stale quote (refresh), insufficient lamports (pre-fund SOL for fees), TooMuchPriceImpact (lower size or raise slippage). Lumen retries quotes automatically when a quote ages out.",
          },
        ]}
        cta={
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="size-4 text-primary" /> Quick endpoints
              </CardTitle>
              <CardDescription>Jupiter's lite API base</CardDescription>
            </CardHeader>
            <CardContent className="font-mono text-xs space-y-1.5 text-muted-foreground">
              <div>{JUPITER_API_BASE}/swap/v1/quote</div>
              <div>{JUPITER_API_BASE}/swap/v1/swap</div>
              <div>{JUPITER_API_BASE}/price/v2</div>
            </CardContent>
          </Card>
        }
      />
    </SectionShell>
  );
}
