"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Chapter {
  slug: string;
  title: string;
  orderIndex: number;
  status: string;
}

interface ContinueReadingButtonProps {
  bookSlug: string;
  chapters: Chapter[];
  pdfUrl?: string | null;
}

export default function ContinueReadingButton({ bookSlug, chapters, pdfUrl }: ContinueReadingButtonProps) {
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  // Filter for published chapters only
  const publishedChapters = chapters
    .filter((c) => c.status === "published")
    .sort((a, b) => a.orderIndex - b.orderIndex);

  useEffect(() => {
    if (publishedChapters.length === 0) return;
    
    const lastReadSlug = localStorage.getItem(`last_read_${bookSlug}`);
    if (lastReadSlug) {
      const match = publishedChapters.find((c) => c.slug === lastReadSlug);
      if (match) {
        setTargetSlug(match.slug);
        setIsResuming(true);
        return;
      }
    }
    
    // Default to the first chapter
    setTargetSlug(publishedChapters[0].slug);
    setIsResuming(false);
  }, [bookSlug, chapters]);

  if (publishedChapters.length === 0) {
    if (pdfUrl) {
      return (
        <a
          href="#volume-reader"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-green-accent bg-green-dark/20 text-green-accent font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-green-accent hover:text-bg-base transition-all duration-300"
        >
          Read Full Volume &rarr;
        </a>
      );
    }
    return (
      <span className="inline-flex justify-center px-6 py-3 rounded-lg border border-border-muted bg-bg-surface text-text-secondary text-xs font-mono">
        Coming Soon
      </span>
    );
  }

  if (!targetSlug) return null;

  return (
    <Link
      href={`/books/${bookSlug}/${targetSlug}`}
      className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-green-accent bg-green-dark/20 text-green-accent font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-green-accent hover:text-bg-base transition-all duration-300"
    >
      {isResuming ? "Continue Reading" : "Start Reading"} &rarr;
    </Link>
  );
}
