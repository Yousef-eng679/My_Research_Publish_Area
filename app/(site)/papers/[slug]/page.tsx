import Link from "next/link";
import { notFound } from "next/navigation";
import { db, papers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { compileMarkdownWithCitations, generateToc } from "@/lib/markdown";
import PaperToc from "@/components/PaperToc";
import CopyCitationButton from "@/components/CopyCitationButton";
import { formatFriendlyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Citation {
  author: string;
  year: string;
  title: string;
  url?: string;
}

interface PaperPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PaperPage({ params }: PaperPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Query paper from Neon
  const fetchedPapers = await db
    .select()
    .from(papers)
    .where(eq(papers.slug, slug))
    .limit(1);

  if (fetchedPapers.length === 0) {
    notFound();
  }

  const paper = fetchedPapers[0];

  // Protect draft states
  if (paper.status !== "published") {
    notFound();
  }

  const citationsList = (paper.citations as Citation[]) || [];

  // Compile body and generate table of contents
  const bodyHtml = compileMarkdownWithCitations(paper.body, citationsList);
  const toc = generateToc(paper.body);

  // Generate APA Citation string
  const year = new Date(paper.publishedAt).getFullYear();
  const authorsList = paper.authors.map((a) => {
    const parts = a.split(",");
    if (parts.length > 1) {
      return `${parts[0].trim()}, ${parts[1].trim()}`;
    }
    const nameParts = a.split(" ");
    if (nameParts.length > 1) {
      const lastName = nameParts[nameParts.length - 1];
      const initials = nameParts.slice(0, -1).map((n) => `${n[0]}.`).join(" ");
      return `${lastName}, ${initials}`;
    }
    return a;
  });
  const formattedAuthors =
    authorsList.length > 1
      ? authorsList.slice(0, -1).join(", ") + " & " + authorsList[authorsList.length - 1]
      : authorsList[0];

  const citationText =
    paper.citeAs ||
    `${formattedAuthors} (${year}). ${paper.title}. Antigravity Library.`;

  // ScholarlyArticle JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": paper.title,
    "description": paper.abstract,
    "author": paper.authors.map((name) => ({
      "@type": "Person",
      "name": name,
    })),
    "datePublished": paper.publishedAt instanceof Date ? paper.publishedAt.toISOString() : new Date(paper.publishedAt).toISOString(),
    "dateModified": paper.updatedAt instanceof Date ? paper.updatedAt.toISOString() : new Date(paper.updatedAt).toISOString(),
    "image": paper.coverImage || undefined,
    "identifier": paper.doi || undefined,
  };

  return (
    <div className="relative overflow-hidden py-16">
      {/* KaTeX Math Formatting support */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var interval = setInterval(function() {
                if (typeof renderMathInElement !== 'undefined') {
                  clearInterval(interval);
                  renderMathInElement(document.body, {
                    delimiters: [
                      {left: '$$', right: '$$', display: true},
                      {left: '$', right: '$', display: false}
                    ]
                  });
                }
              }, 50);
            })();
          `
        }}
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background Soft Lights */}
      <div className="absolute top-[15%] left-[50%] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-green-accent/3 blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation back */}
        <div className="mb-8">
          <Link
            href="/papers"
            className="text-xs font-mono text-text-secondary hover:text-green-accent transition-colors duration-300"
          >
            &larr; Back to publication index
          </Link>
        </div>

        {/* Paper split columns layout */}
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Left Column: TOC and paper actions (Desktop sticky sidebar) */}
          <aside className="lg:col-span-3 lg:block sticky top-24 self-start space-y-8 order-2 lg:order-1">
            {toc.length > 0 && (
              <div className="border border-border-muted/50 rounded-xl bg-bg-surface/50 p-5 backdrop-blur">
                <PaperToc toc={toc} />
              </div>
            )}

            {/* Actions Card */}
            <div className="border border-border-muted/50 rounded-xl bg-bg-surface/50 p-5 backdrop-blur space-y-4">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                Actions
              </span>
              <div className="flex flex-col gap-2">
                {paper.pdfUrl && (
                  <a
                    href={paper.pdfUrl}
                    download
                    className="flex items-center justify-center space-x-2 w-full py-2 text-xs font-mono font-medium rounded border border-green-accent bg-green-dark/20 text-green-accent hover:bg-green-accent hover:text-bg-base transition-all duration-300"
                  >
                    <svg
                      className="h-3.5 w-3.5"
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
                    <span>Download PDF</span>
                  </a>
                )}
                {paper.doi && (
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full py-2 text-xs font-mono font-medium rounded border border-border-muted text-text-secondary hover:border-green-accent hover:text-green-accent transition-colors duration-300"
                  >
                    <span>Resolver DOI</span>
                  </a>
                )}
              </div>
            </div>
          </aside>

          {/* Right Column: Paper text content */}
          <main className="lg:col-span-9 space-y-10 order-1 lg:order-2">
            
            {/* Title block */}
            <div className="space-y-4">
              <h1 className="font-sans text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl leading-tight">
                {paper.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-xs font-mono text-text-secondary">
                <span>Published: {formatFriendlyDate(paper.publishedAt)}</span>
                {paper.doi && (
                  <>
                    <span>&bull;</span>
                    <span className="text-green-accent">DOI: {paper.doi}</span>
                  </>
                )}
              </div>

              <div className="text-sm font-mono text-text-secondary border-t border-border-muted pt-2">
                Authors: <span className="text-text-primary font-sans">{paper.authors.join(", ")}</span>
              </div>
            </div>

            {/* Abstract Premium Card */}
            <div className="border border-border-muted/50 rounded-xl bg-bg-surface p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Highlight gradient edge */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-accent to-transparent" />
              
              <h3 className="font-mono text-xs uppercase tracking-widest text-green-accent mb-3">
                Abstract
              </h3>
              <p className="font-serif text-base text-text-body leading-relaxed italic">
                {paper.abstract}
              </p>
            </div>

            {/* Topics */}
            <div className="flex flex-wrap gap-2">
              {paper.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`/topics/${topic}`}
                  className="rounded-md border border-border-muted bg-emerald-950/20 px-2.5 py-0.5 text-xs font-mono text-emerald-400 hover:bg-emerald-900/30 transition-colors duration-300"
                >
                  #{topic}
                </Link>
              ))}
            </div>

            {/* Paper content */}
            <div
              className="serif-reading prose prose-invert prose-emerald max-w-none border-t border-border-muted pt-8"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* Interactive Document Viewer (PDF) */}
            {paper.pdfUrl && (
              <section className="border-t border-border-muted pt-8 space-y-4">
                <div className="flex items-center justify-between border-b border-border-muted pb-3">
                  <h3 className="font-sans text-xl font-bold text-text-primary">
                    Document Viewer (PDF)
                  </h3>
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-green-accent hover:underline flex items-center gap-1"
                  >
                    Open in New Tab <span>&rarr;</span>
                  </a>
                </div>
                <div className="relative aspect-[4/3] w-full rounded-xl border border-border-muted bg-bg-surface overflow-hidden shadow-2xl">
                  <iframe
                    src={paper.pdfUrl}
                    className="absolute inset-0 h-full w-full border-none"
                    title={`PDF viewer for ${paper.title}`}
                  />
                </div>
              </section>
            )}

            {/* Bibliography / Citations section */}
            {citationsList.length > 0 && (
              <section className="border-t border-border-muted pt-8 space-y-6">
                <h3 className="font-sans text-xl font-bold text-text-primary">
                  References
                </h3>
                <ol className="list-decimal pl-5 space-y-4 font-serif text-sm text-text-secondary leading-relaxed">
                  {citationsList.map((cite, index) => (
                    <li key={index} id={`reference-${index}`} className="target:text-green-accent target:bg-green-dark/10 p-1 rounded transition-all duration-500">
                      <span className="font-sans font-bold text-text-primary block sm:inline">
                        {cite.author} ({cite.year}).
                      </span>{" "}
                      <span className="italic">{cite.title}.</span>{" "}
                      {cite.url && (
                        <a
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-green-accent hover:underline block sm:inline sm:ml-2 truncate"
                        >
                          {cite.url}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* APA "Cite this" metadata block */}
            <section className="border-t border-border-muted pt-8">
              <div className="rounded-xl border border-border-muted bg-bg-surface p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 flex-1">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                    Cite as (APA Format)
                  </span>
                  <p className="font-mono text-xs text-text-primary bg-bg-base/50 p-3 rounded border border-border-muted/50 leading-relaxed select-all">
                    {citationText}
                  </p>
                </div>
                <div className="shrink-0 self-end sm:self-center">
                  <CopyCitationButton text={citationText} />
                </div>
              </div>
            </section>

          </main>
        </div>

      </div>
    </div>
  );
}
