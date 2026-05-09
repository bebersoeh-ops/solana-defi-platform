import {
  Activity,
  ArrowLeftRight,
  BadgeDollarSign,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Bug,
  ChartBar,
  ChartLine,
  CircleDollarSign,
  ClipboardList,
  Coins,
  Compass,
  Cpu,
  Crosshair,
  Database,
  Eye,
  FileText,
  Flame,
  Gauge,
  Globe,
  GraduationCap,
  Hash,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LineChart,
  ListTree,
  Lock,
  Network,
  PieChart,
  Receipt,
  Repeat,
  Route,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  badge?: string;
  external?: boolean;
}

export interface NavSection {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  accent: "mint" | "purple" | "blue" | "pink" | "orange";
  items: NavItem[];
}

export const TOP_NAV: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
];

export const SECTIONS: NavSection[] = [
  {
    title: "Trade",
    href: "/trade",
    icon: Repeat,
    description: "Swap and trade across every Solana DEX through Jupiter",
    accent: "mint",
    items: [
      { title: "Swap", href: "/trade/swap", icon: ArrowLeftRight, description: "Instant best-route swaps" },
      { title: "Advanced Swap", href: "/trade/advanced", icon: Sparkles, description: "Pro execution controls" },
      { title: "DCA Simulator", href: "/trade/dca", icon: ChartLine, description: "Plan recurring orders" },
      { title: "Limit Preview", href: "/trade/limit", icon: Crosshair, description: "Preview limit-style flows" },
      { title: "Route Analyzer", href: "/trade/routes", icon: Route, description: "Compare every route plan" },
      { title: "Token Explorer", href: "/trade/tokens", icon: Compass, description: "Browse the full token universe" },
      { title: "Liquidity Visualizer", href: "/trade/liquidity", icon: Layers, description: "Visualize pool depth" },
      { title: "Slippage Manager", href: "/trade/slippage", icon: Gauge, description: "Tune slippage policy" },
      { title: "Fee Estimator", href: "/trade/fees", icon: Receipt, description: "Estimate priority + fees" },
    ],
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: Briefcase,
    description: "Track every wallet across the Solana ecosystem",
    accent: "purple",
    items: [
      { title: "Assets", href: "/portfolio/assets", icon: Coins, description: "Token holdings" },
      { title: "PnL Tracker", href: "/portfolio/pnl", icon: TrendingUp, description: "Profit and loss by token" },
      { title: "Wallet Overview", href: "/portfolio/overview", icon: Wallet, description: "Aggregated dashboard" },
      { title: "Token Allocation", href: "/portfolio/allocation", icon: PieChart, description: "Allocation breakdown" },
      { title: "Risk Monitor", href: "/portfolio/risk", icon: ShieldAlert, description: "Concentration + drawdown" },
      { title: "NFT Overview", href: "/portfolio/nft", icon: ImageIcon, description: "NFT holdings" },
      { title: "Transaction History", href: "/portfolio/history", icon: Activity, description: "All on-chain activity" },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Deep market analytics for the Solana ecosystem",
    accent: "blue",
    items: [
      { title: "Trending Tokens", href: "/analytics/trending", icon: Flame, description: "Hot tokens right now" },
      { title: "Volume Tracker", href: "/analytics/volume", icon: ChartBar, description: "Realtime volume" },
      { title: "Whale Activity", href: "/analytics/whales", icon: Eye, description: "Smart-money flows" },
      { title: "Ecosystem Heatmap", href: "/analytics/heatmap", icon: Globe, description: "Sector performance map" },
      { title: "Top Gainers", href: "/analytics/gainers", icon: TrendingUp, description: "Best performers" },
      { title: "Top Losers", href: "/analytics/losers", icon: ChartLine, description: "Worst performers" },
      { title: "Meme Coin Radar", href: "/analytics/memes", icon: Sparkles, description: "Meme coin pulse" },
    ],
  },
  {
    title: "Tools",
    href: "/tools",
    icon: Wrench,
    description: "Utility-grade research tooling for builders + traders",
    accent: "pink",
    items: [
      { title: "Wallet Analyzer", href: "/tools/wallet-analyzer", icon: Wallet, description: "Inspect any wallet" },
      { title: "Address Lookup", href: "/tools/lookup", icon: Search, description: "Resolve any address" },
      { title: "Token Security", href: "/tools/security", icon: Shield, description: "Audit token authorities" },
      { title: "Rug Risk Checker", href: "/tools/rug-risk", icon: Bug, description: "Score rug risk vectors" },
      { title: "Holder Distribution", href: "/tools/holders", icon: Users, description: "Top holder concentration" },
      { title: "LP Burn Checker", href: "/tools/lp-burn", icon: Flame, description: "Verify LP burn proofs" },
      { title: "Dev Wallet Tracker", href: "/tools/dev-tracker", icon: Crosshair, description: "Follow deployer wallets" },
      { title: "Token Metadata", href: "/tools/metadata", icon: FileText, description: "View token metadata" },
    ],
  },
  {
    title: "Learn",
    href: "/learn",
    icon: BookOpen,
    description: "Education and reference material for Solana DeFi",
    accent: "orange",
    items: [
      { title: "Beginner Guides", href: "/learn/beginner", icon: GraduationCap, description: "Start here" },
      { title: "Jupiter Integration", href: "/learn/jupiter", icon: Network, description: "Integration docs" },
      { title: "Solana Basics", href: "/learn/solana", icon: Cpu, description: "Solana primer" },
      { title: "Wallet Safety", href: "/learn/safety", icon: Lock, description: "Self-custody best practices" },
      { title: "Slippage Education", href: "/learn/slippage", icon: Gauge, description: "Slippage explained" },
      { title: "DeFi Glossary", href: "/learn/glossary", icon: BookOpen, description: "Common DeFi terms" },
    ],
  },
];

export const UTILITY_SECTIONS: NavSection[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Internal admin dashboard",
    accent: "mint",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard, description: "Operations overview" },
      { title: "User Activity", href: "/dashboard/users", icon: Users, description: "User analytics" },
      { title: "API Logs", href: "/dashboard/logs", icon: Terminal, description: "Recent API calls" },
      { title: "Routing Health", href: "/dashboard/routing", icon: Activity, description: "Route latency + fail rate" },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Customize the Lumen experience",
    accent: "purple",
    items: [
      { title: "Appearance", href: "/settings/appearance", icon: Sparkles, description: "Theme + motion" },
      { title: "Wallets", href: "/settings/wallets", icon: Wallet, description: "Manage wallets" },
      { title: "Notifications", href: "/settings/notifications", icon: Bell, description: "Alert preferences" },
      { title: "Network", href: "/settings/network", icon: Network, description: "RPC + endpoints" },
      { title: "Shortcuts", href: "/settings/shortcuts", icon: Hash, description: "Keyboard shortcuts" },
    ],
  },
];

export const ALL_SECTIONS = [...SECTIONS, ...UTILITY_SECTIONS];

export function flattenNav(): NavItem[] {
  const out: NavItem[] = [];
  for (const sec of ALL_SECTIONS) {
    out.push({
      title: sec.title,
      href: sec.href,
      icon: sec.icon,
      description: sec.description,
    });
    for (const item of sec.items) {
      out.push(item);
    }
  }
  return out;
}
