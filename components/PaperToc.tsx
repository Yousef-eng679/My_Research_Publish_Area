"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface PaperTocProps {
  toc: TocItem[];
}

export default function PaperToc({ toc }: PaperTocProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      toc.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [toc]);

  return (
    <nav className="space-y-2 text-xs font-mono">
      <span className="block text-[10px] uppercase tracking-widest text-text-secondary mb-3">
        Table of Contents
      </span>
      <div className="space-y-1.5 border-l border-border-muted pl-3">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block transition-all duration-300 ${
                item.level === 3 ? "pl-3 text-[11px]" : "font-semibold"
              } ${
                isActive
                  ? "text-green-accent text-glow-accent translate-x-1"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.text}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
