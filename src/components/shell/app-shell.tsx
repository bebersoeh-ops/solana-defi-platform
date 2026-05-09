"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ActivityWidget } from "./activity-widget";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-3 sm:px-5 py-5 pb-24 md:pb-6 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
      <ActivityWidget />
    </div>
  );
}
