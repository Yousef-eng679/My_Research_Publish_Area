import Link from "next/link";
import { notFound } from "next/navigation";
import { db, books, chapters } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import ContinueReadingButton from "@/components/ContinueReadingButton";
import SpotlightCard from "@/components/SpotlightCard";
import { getBookProgressText } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface BookLandingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookLandingPage({ params }: BookLandingPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Query book details
  const fetchedBooks = await db
    .select()
    .from(books)
    .where(eq(books.slug, slug))
    .limit(1);

  if (fetchedBooks.length === 0) {
    notFound();
  }

  const book = fetchedBooks[0];

  // Protect draft books
  if (book.status !== "published") {
    notFound();
  }

  // Fetch chapters for this book
  const bookChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.bookId, book.id))
    .orderBy(asc(chapters.orderIndex));

  const totalCount = bookChapters.length;
  const publishedCount = bookChapters.filter((c) => c.status === "published").length;
  const progressText = getBookProgressText(publishedCount, totalCount);

  return (
    <div className="relative overflow-hidden py-16">
      {/* Background Soft Lights */}
      <div className="absolute top-[10%] left-[50%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-green-accent/3 blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/books"
            className="text-xs font-mono text-text-secondary hover:text-green-accent transition-colors duration-300"
          >
            &larr; Back to shelf
          </Link>
        </div>

        {/* Book Header Split */}
        <div className="grid gap-8 md:grid-cols-4 items-start border-b border-border-muted pb-10">
          {/* Cover Column */}
          <div className="md:col-span-1 flex justify-center">
            <div className="relative aspect-[3/4] w-40 md:w-full rounded bg-bg-base border border-border-muted/50 overflow-hidden shadow-2xl">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-text-secondary">
                  NO COVER
                </div>
              )}
              <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-3 space-y-6">
            <div className="space-y-3">
              <h1 className="font-sans text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
                {book.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                {book.topics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/topics/${topic}`}
                    className="rounded-md border border-border-muted bg-emerald-950/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 hover:bg-emerald-900/30 transition-colors duration-300"
                  >
                    #{topic}
                  </Link>
                ))}
              </div>
              <div className="text-xs font-mono text-green-accent">
                {progressText}
              </div>
            </div>

            <p className="text-base text-text-secondary leading-relaxed">
              {book.description}
            </p>


            <div className="pt-2 flex flex-wrap items-center gap-4">
              <ContinueReadingButton bookSlug={book.slug} chapters={bookChapters} pdfUrl={book.pdfUrl} />
              {bookChapters.some((c) => c.status === "published") && (
                <a
                  href={`/api/books/${book.slug}/epub`}
                  download
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border-muted bg-bg-surface text-text-secondary hover:border-green-accent hover:text-green-accent text-sm font-medium transition-all duration-300"
                >
                  <svg
                    className="mr-2 h-4 w-4"
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
                  <span>Download EPUB</span>
                </a>
              )}
              {book.pdfUrl && (
                <a
                  href={book.pdfUrl}
                  download
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-green-accent bg-green-dark/20 text-green-accent hover:bg-green-accent hover:text-bg-base text-sm font-medium transition-all duration-300"
                >
                  <svg
                    className="mr-2 h-4 w-4"
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
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="space-y-6">
          <h2 className="font-sans text-xl font-bold tracking-wider uppercase text-text-primary">
            Chapter Directory
          </h2>

          {bookChapters.length === 0 ? (
            <div className="rounded-xl border border-border-muted bg-bg-surface p-12 text-center">
              <p className="font-mono text-sm text-text-secondary">
                No chapters have been released for this volume yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bookChapters.map((chapter) => {
                const isPublished = chapter.status === "published";
                return isPublished ? (
                  <Link key={chapter.id} href={`/books/${book.slug}/${chapter.slug}`}>
                    <SpotlightCard className="p-5 flex flex-col justify-between h-full hover:border-green-accent transition-colors duration-300">
                      <div>
                        <span className="font-mono text-[10px] text-green-accent">
                          Chapter {chapter.orderIndex}
                        </span>
                        <h3 className="font-sans font-bold text-text-primary text-base mt-1 line-clamp-1">
                          {chapter.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-text-secondary mt-4 block self-end">
                        Read Chapter &rarr;
                      </span>
                    </SpotlightCard>
                  </Link>
                ) : (
                  <div
                    key={chapter.id}
                    className="p-5 border border-border-muted bg-bg-surface/30 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed select-none"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-text-secondary">
                        Chapter {chapter.orderIndex}
                      </span>
                      <h3 className="font-sans font-bold text-text-secondary text-base mt-1">
                        {chapter.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-text-secondary">
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>Coming Soon</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interactive Book Viewer (PDF) */}
        {book.pdfUrl && (
          <div id="volume-reader" className="space-y-6 pt-10 border-t border-border-muted scroll-mt-24">
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <h2 className="font-sans text-xl font-bold tracking-wider uppercase text-text-primary">
                Full Volume Reader
              </h2>
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-green-accent hover:underline flex items-center gap-1"
              >
                Open in New Tab <span>&rarr;</span>
              </a>
            </div>
            <div className="relative aspect-[4/3] w-full rounded-xl border border-border-muted bg-bg-surface overflow-hidden shadow-2xl">
              <iframe
                src={book.pdfUrl}
                className="absolute inset-0 h-full w-full border-none"
                title={`Full volume reader for ${book.title}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
