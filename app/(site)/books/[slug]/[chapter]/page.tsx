import Link from "next/link";
import { notFound } from "next/navigation";
import { db, books, chapters } from "@/lib/db";
import { eq, asc, and } from "drizzle-orm";
import { compileMarkdown } from "@/lib/markdown";
import TrackProgress from "@/components/TrackProgress";
import ChapterScrollProgress from "@/components/ChapterScrollProgress";

export const dynamic = "force-dynamic";

interface ChapterReaderPageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export default async function ChapterReaderPage({ params }: ChapterReaderPageProps) {
  const resolvedParams = await params;
  const { slug: bookSlug, chapter: chapterSlug } = resolvedParams;

  // 1. Fetch book details
  const fetchedBooks = await db
    .select()
    .from(books)
    .where(eq(books.slug, bookSlug))
    .limit(1);

  if (fetchedBooks.length === 0 || fetchedBooks[0].status !== "published") {
    notFound();
  }

  const book = fetchedBooks[0];

  // 2. Fetch all chapters belonging to the book
  const allChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.bookId, book.id))
    .orderBy(asc(chapters.orderIndex));

  // 3. Find the current active chapter
  const currentChapterIndex = allChapters.findIndex((c) => c.slug === chapterSlug);
  if (currentChapterIndex === -1) {
    notFound();
  }

  const currentChapter = allChapters[currentChapterIndex];

  // Protect draft chapters from direct access
  if (currentChapter.status !== "published") {
    notFound();
  }

  // 4. Define prev/next chapter navigation targets (skipping drafts)
  let prevChapter = null;
  for (let i = currentChapterIndex - 1; i >= 0; i--) {
    if (allChapters[i].status === "published") {
      prevChapter = allChapters[i];
      break;
    }
  }

  let nextChapter = null;
  for (let i = currentChapterIndex + 1; i < allChapters.length; i++) {
    if (allChapters[i].status === "published") {
      nextChapter = allChapters[i];
      break;
    }
  }

  // 5. Compile markdown body
  const bodyHtml = compileMarkdown(currentChapter.body);

  return (
    <div className="relative min-h-screen">
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

      {/* Scroll indicator */}
      <ChapterScrollProgress />

      {/* Track progress in local storage */}
      <TrackProgress bookSlug={book.slug} chapterSlug={currentChapter.slug} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Left Column: Chapters TOC Sidebar */}
          <aside className="lg:col-span-3 lg:block sticky top-24 self-start space-y-4 order-2 lg:order-1">
            <div className="border border-border-muted/50 rounded-xl bg-bg-surface/50 p-5 backdrop-blur space-y-4">
              <div className="space-y-1">
                <Link
                  href={`/books/${book.slug}`}
                  className="text-[10px] font-mono uppercase tracking-widest text-text-secondary hover:text-green-accent"
                >
                  &larr; Book Landing
                </Link>
                <h4 className="font-sans font-bold text-text-primary text-sm line-clamp-1 mt-1">
                  {book.title}
                </h4>
              </div>

              <nav className="border-l border-border-muted pl-3 space-y-2 text-xs font-mono">
                {allChapters.map((ch) => {
                  const isCurrent = ch.id === currentChapter.id;
                  const isPub = ch.status === "published";
                  
                  return isPub ? (
                    <Link
                      key={ch.id}
                      href={`/books/${book.slug}/${ch.slug}`}
                      className={`block py-1 hover:text-text-primary transition-colors duration-300 ${
                        isCurrent
                          ? "text-green-accent text-glow-accent font-semibold"
                          : "text-text-secondary"
                      }`}
                    >
                      Ch {ch.orderIndex}. {ch.title}
                    </Link>
                  ) : (
                    <span
                      key={ch.id}
                      className="block py-1 text-text-secondary/40 cursor-not-allowed select-none flex items-center space-x-1"
                      title="Coming Soon"
                    >
                      <span>Ch {ch.orderIndex}. {ch.title}</span>
                      <svg
                        className="h-2.5 w-2.5 inline"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </span>
                  );
                })}
              </nav>
            </div>

            {/* Actions Card */}
            {currentChapter.pdfUrl && (
              <div className="border border-border-muted/50 rounded-xl bg-bg-surface/50 p-5 backdrop-blur space-y-4">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                  Actions
                </span>
                <div className="flex flex-col gap-2">
                  <a
                    href={currentChapter.pdfUrl}
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
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: Reading Body */}
          <main className="lg:col-span-9 space-y-12 order-1 lg:order-2">
            
            {/* Header info */}
            <div className="space-y-3 border-b border-border-muted pb-6">
              <span className="font-mono text-xs uppercase tracking-widest text-green-accent">
                Chapter {currentChapter.orderIndex}
              </span>
              <h1 className="font-sans text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl leading-tight">
                {currentChapter.title}
              </h1>
            </div>

            {/* Reading copy */}
            <div
              className="serif-reading prose prose-invert prose-emerald max-w-none"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* Interactive Document Viewer (PDF) */}
            {currentChapter.pdfUrl && (
              <section className="border-t border-border-muted pt-8 space-y-4">
                <div className="flex items-center justify-between border-b border-border-muted pb-3">
                  <h3 className="font-sans text-xl font-bold text-text-primary">
                    Document Viewer (PDF)
                  </h3>
                  <a
                    href={currentChapter.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-green-accent hover:underline flex items-center gap-1"
                  >
                    Open in New Tab <span>&rarr;</span>
                  </a>
                </div>
                <div className="relative aspect-[4/3] w-full rounded-xl border border-border-muted bg-bg-surface overflow-hidden shadow-2xl">
                  <iframe
                    src={currentChapter.pdfUrl}
                    className="absolute inset-0 h-full w-full border-none"
                    title={`PDF viewer for ${currentChapter.title}`}
                  />
                </div>
              </section>
            )}

            {/* Pagination Navigation */}
            <div className="border-t border-border-muted pt-8 flex items-center justify-between gap-4 font-mono text-xs">
              {prevChapter ? (
                <Link
                  href={`/books/${book.slug}/${prevChapter.slug}`}
                  className="p-4 rounded-xl border border-border-muted bg-bg-surface/50 hover:border-green-accent hover:text-green-accent text-left transition-colors duration-300 max-w-[45%] flex-1"
                >
                  <span className="block text-[10px] text-text-secondary">Previous</span>
                  <span className="font-sans font-bold text-text-primary text-sm line-clamp-1 mt-1 group-hover:text-green-accent">
                    Ch {prevChapter.orderIndex}. {prevChapter.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1 max-w-[45%]" />
              )}

              {nextChapter ? (
                <Link
                  href={`/books/${book.slug}/${nextChapter.slug}`}
                  className="p-4 rounded-xl border border-border-muted bg-bg-surface/50 hover:border-green-accent hover:text-green-accent text-right transition-colors duration-300 max-w-[45%] flex-1"
                >
                  <span className="block text-[10px] text-text-secondary">Next</span>
                  <span className="font-sans font-bold text-text-primary text-sm line-clamp-1 mt-1 group-hover:text-green-accent">
                    Ch {nextChapter.orderIndex}. {nextChapter.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1 max-w-[45%]" />
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
