import Link from "next/link";
import SpotlightCard from "@/components/SpotlightCard";

export const metadata = {
  title: "About Yousef - AI & Software Engineering Research",
  description: "Yousef is an AI and Software Engineering researcher building digital archives and open-access publications.",
};

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden py-16">
      {/* Background Soft Glows */}
      <div className="absolute top-[5%] left-[20%] h-[500px] w-[500px] rounded-full bg-green-accent/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] h-[400px] w-[400px] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 space-y-16">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="text-xs font-mono text-text-secondary hover:text-green-accent transition-colors duration-300"
          >
            &larr; Back to Home
          </Link>
        </div>

        {/* Profile Header Block */}
        <div className="grid gap-8 sm:grid-cols-3 items-center border-b border-border-muted pb-12">
          <div className="sm:col-span-1 flex justify-center sm:justify-start">
            <div className="relative h-44 w-44 rounded-2xl border border-border-muted/60 bg-bg-surface overflow-hidden shadow-2xl p-2">
              <div className="h-full w-full rounded-xl bg-gradient-to-br from-emerald-900/40 via-bg-base to-emerald-950/60 flex items-center justify-center border border-green-accent/20">
                <span className="font-mono text-5xl font-extrabold text-green-accent tracking-tighter">
                  Y
                </span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-green-accent">
                AI &amp; Software Engineering Researcher
              </span>
              <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Yousef
              </h1>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-serif">
              Hi, I am Yousef. I have applied skills in AI and software engineering, working hard in researching and building open-access technical articles, research papers, and serialized books. Welcome to my personal digital archive.
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
              <span className="px-2.5 py-0.5 rounded border border-border-muted bg-emerald-950/20 text-[10px] font-mono text-emerald-400">
                Applied AI
              </span>
              <span className="px-2.5 py-0.5 rounded border border-border-muted bg-emerald-950/20 text-[10px] font-mono text-emerald-400">
                Software Engineering
              </span>
              <span className="px-2.5 py-0.5 rounded border border-border-muted bg-emerald-950/20 text-[10px] font-mono text-emerald-400">
                AI Research
              </span>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <section className="space-y-6">
          <h2 className="font-sans text-xl font-bold tracking-wider uppercase text-text-primary">
            Platform Mission
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <SpotlightCard className="p-6 space-y-3">
              <h3 className="font-sans text-base font-bold text-text-primary text-green-accent">
                Open Access Research
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                All academic papers and monographs published on this library include full PDF downloads, interactive embedded document viewers, and standard citation metadata.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-3">
              <h3 className="font-sans text-base font-bold text-text-primary text-green-accent">
                Serialized Knowledge
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Long-form content is structured sequentially as multi-chapter digital volumes, with built-in reading progress tracking and downloadable EPUB editions.
              </p>
            </SpotlightCard>
          </div>
        </section>

        {/* Navigation & Contact Footer */}
        <section className="border-t border-border-muted pt-10 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="font-sans text-lg font-bold text-text-primary">
              Explore the Archive
            </h3>
            <p className="text-xs text-text-secondary">
              Browse by format or topic to dive into current publications.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono">
            <Link
              href="/papers"
              className="px-4 py-2 rounded-lg border border-border-muted bg-bg-surface hover:border-green-accent hover:text-green-accent transition-all duration-300"
            >
              Research Papers &rarr;
            </Link>
            <Link
              href="/books"
              className="px-4 py-2 rounded-lg border border-border-muted bg-bg-surface hover:border-green-accent hover:text-green-accent transition-all duration-300"
            >
              Serialized Books &rarr;
            </Link>
            <Link
              href="/blog"
              className="px-4 py-2 rounded-lg border border-border-muted bg-bg-surface hover:border-green-accent hover:text-green-accent transition-all duration-300"
            >
              Engineering Blog &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
