"use client";

import { type ReactNode } from "react";
import { AppShell } from "./app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTabs } from "./section-tabs";
import type { NavItem } from "@/lib/navigation";

export interface SectionShellProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  baseHref?: string;
  items?: NavItem[];
  children: ReactNode;
}

export function SectionShell({
  title,
  description,
  badge,
  actions,
  baseHref,
  children,
}: SectionShellProps) {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={title}
          description={description}
          badge={badge}
          actions={actions}
        />
        <SectionTabs baseHref={baseHref} />
        <div>{children}</div>
      </div>
    </AppShell>
  );
}
