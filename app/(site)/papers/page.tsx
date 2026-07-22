import Link from "next/link";
import { db, papers } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { formatFriendlyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PapersPage() {
  // Query all published papers from Postgres
  const publishedPapers = await db
    .select()
    .from(papers)
    .where(eq(papers.status, "published"))
    .orderBy(desc(papers.publishedAt));

  return (
    <div className="relative overflow-hidden py-16">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-green-accent/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Page Header */}
        <div className="border-b border-border-muted pb-6">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text-primary">
            Research Publications
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Formal papers, mathematical formulations, and engineering reports.
          </p>
        </div>

        {/* Dense Publications List */}
        {publishedPapers.length === 0 ? (
          <div className="rounded-xl border border-border-muted bg-bg-surface p-12 text-center">
            <p className="font-mono text-sm text-text-secondary">
              No publications have been uploaded yet.
            </p>
          </div>
        ) : (
          <div className="border border-border-muted rounded-xl bg-bg-surface divide-y divide-border-muted">
            {publishedPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-6 flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-bg-hover/20 transition-colors duration-300"
              >
                <div className="space-y-3 flex-1">
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-secondary">
                    <span>
                      {formatFriendlyDate(paper.publishedAt)}
                    </span>
                    {paper.doi && (
                      <>
                        <span>&bull;</span>
                        <span className="text-green-accent">DOI: {paper.doi}</span>
                      </>
                    )}
                  </div>

                  {/* Title & Authors */}
                  <div>
                    <h2 className="font-sans text-lg font-bold text-text-primary hover:text-green-accent transition-colors duration-300">
                      <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                    </h2>
                    <p className="text-xs font-mono text-text-secondary mt-1">
                      Authors: {paper.authors.join(", ")}
                    </p>
                  </div>

                  {/* Abstract snippet */}
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {paper.abstract}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {paper.topics.map((topic) => (
                      <Link
                        key={topic}
                        href={`/topics/${topic}`}
                        className="rounded-md border border-border-muted bg-emerald-950/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 hover:bg-emerald-900/30 transition-colors duration-300"
                      >
                        #{topic}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Actions column */}
                <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                  <Link
                    href={`/papers/${paper.slug}`}
                    className="px-3.5 py-2 border border-green-accent bg-green-dark/10 text-green-accent hover:bg-green-accent hover:text-bg-base rounded text-xs font-mono font-medium transition-colors duration-300"
                  >
                    View Paper
                  </Link>
                  {paper.pdfUrl && (
                    <a
                      href={paper.pdfUrl}
                      download
                      className="p-2 border border-border-muted hover:border-green-accent hover:text-green-accent rounded text-text-secondary transition-colors duration-300"
                      title="Download PDF"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
