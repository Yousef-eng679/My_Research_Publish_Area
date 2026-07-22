"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import SpotlightCard from "@/components/SpotlightCard";
import { escapeSearchQuery } from "@/lib/securityUtils";

interface SearchResult {
  type: "blog" | "paper" | "book" | "chapter";
  slug: string;
  title: string;
  description: string;
  subtitle: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
        if (!res.ok) {
          throw new Error("Failed to query search results.");
        }
        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || "An error occurred during search.");
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  // Route resolver helper
  const getHref = (result: SearchResult) => {
    switch (result.type) {
      case "blog":
        return `/blog/${result.slug}`;
      case "paper":
        return `/papers/${result.slug}`;
      case "book":
        return `/books/${result.slug}`;
      case "chapter":
        return `/books/${result.subtitle}/${result.slug}`;
      default:
        return "/";
    }
  };

  return (
    <div className="relative overflow-hidden py-16">
      {/* Background soft radial light */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-green-accent/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text-primary">
            Search the Library
          </h1>
          <p className="max-w-xl mx-auto text-sm text-text-secondary">
            Find articles, academic research papers, serialized books, and chapters matching any keywords instantly.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border-muted bg-bg-surface px-5 py-4 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent transition-all duration-300 shadow-xl"
            placeholder="Type keywords (e.g. Next.js, quantum, routing)..."
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-accent border-t-transparent" />
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="space-y-6 max-w-3xl mx-auto pt-6">
          {error && (
            <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-4 text-xs text-red-400 font-mono text-center">
              {error}
            </div>
          )}

          {!loading && query.trim() !== "" && results.length === 0 && (
            <div className="rounded-xl border border-border-muted bg-bg-surface p-12 text-center">
              <p className="font-mono text-sm text-text-secondary">
                No matching publications found for "{escapeSearchQuery(query)}".
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-text-secondary border-b border-border-muted/50 pb-2 mb-4">
                <span>Search Results</span>
                <span>{results.length} found</span>
              </div>

              <div className="space-y-4">
                {results.map((result, idx) => (
                  <Link key={`${result.type}-${result.slug}-${idx}`} href={getHref(result)} className="block group">
                    <SpotlightCard className="p-5 flex flex-col justify-between hover:border-green-accent transition-colors duration-300">
                      <div>
                        {/* Header metadata row */}
                        <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                          <span
                            className={`px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                              result.type === "paper"
                                ? "bg-purple-950/20 border-purple-900/30 text-purple-400"
                                : result.type === "blog"
                                ? "bg-blue-950/20 border-blue-900/30 text-blue-400"
                                : result.type === "book"
                                ? "bg-amber-950/20 border-amber-900/30 text-amber-400"
                                : "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
                            }`}
                          >
                            {result.type}
                          </span>
                          {result.subtitle && result.type === "paper" && (
                            <span className="text-text-secondary">Authors: {result.subtitle}</span>
                          )}
                          {result.subtitle && result.type === "chapter" && (
                            <span className="text-text-secondary">Book: {result.subtitle}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-sans text-base font-bold text-text-primary group-hover:text-green-accent transition-colors duration-300">
                          {result.title}
                        </h3>

                        {/* Description snippet */}
                        <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                          {result.description.replace(/[#*`]/g, "")}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-green-accent mt-3 self-end hover:underline">
                        Navigate to {result.type} &rarr;
                      </span>
                    </SpotlightCard>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
