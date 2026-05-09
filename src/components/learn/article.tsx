"use client";

import { type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";

export interface ArticleSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export function Article({
  title,
  subtitle,
  level,
  readTime,
  sections,
  cta,
}: {
  title: string;
  subtitle: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  sections: ArticleSection[];
  cta?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <article className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="info" className="text-[10px]">{level}</Badge>
              <Badge variant="secondary" className="text-[10px] inline-flex items-center gap-1">
                <Clock className="size-2.5" /> {readTime}
              </Badge>
            </div>
            <CardTitle className="text-2xl mt-2">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{subtitle}</CardDescription>
          </CardHeader>
        </Card>
        {sections.map((s, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-lg">{s.heading}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>{s.body}</p>
              {s.bullets ? (
                <ul className="space-y-1.5 mt-2">
                  {s.bullets.map((b, k) => (
                    <li key={k} className="flex items-start gap-2 pl-1">
                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </article>
      <aside className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" /> Outline
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1.5">
            {sections.map((s, i) => (
              <div
                key={i}
                className="rounded-md hover:bg-white/[0.03] px-2 py-1.5 cursor-default text-muted-foreground hover:text-foreground"
              >
                {i + 1}. {s.heading}
              </div>
            ))}
          </CardContent>
        </Card>
        {cta}
      </aside>
    </div>
  );
}
