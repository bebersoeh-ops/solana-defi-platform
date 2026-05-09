import { AppShell } from "@/components/shell/app-shell";
import { Hero } from "@/components/home/hero";
import { FloatingStats } from "@/components/home/floating-stats";
import { TrendingMarquee } from "@/components/home/trending-marquee";
import { MainCards } from "@/components/home/main-cards";
import { MarketPulse } from "@/components/home/market-pulse";
import { LiveActivity } from "@/components/home/live-activity";
import { LeaderboardTeaser } from "@/components/home/leaderboard-teaser";
import { AiInsight } from "@/components/home/ai-insight";
import { HomeFooter } from "@/components/home/home-footer";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-10 md:space-y-14">
        <Hero />
        <TrendingMarquee />
        <FloatingStats />
        <MainCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <MarketPulse />
          <LiveActivity />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <LeaderboardTeaser />
          <AiInsight />
        </div>
        <HomeFooter />
      </div>
    </AppShell>
  );
}
