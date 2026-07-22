import Link from "next/link";
import { db, books, chapters } from "@/lib/db";
import { eq, desc, inArray } from "drizzle-orm";
import SpotlightCard from "@/components/SpotlightCard";
import { getBookProgressText } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  // Fetch all published books
  const publishedBooks = await db
    .select()
    .from(books)
    .where(eq(books.status, "published"))
    .orderBy(desc(books.publishedAt));

  // Fetch chapters to calculate progress text
  const bookIds = publishedBooks.map((b) => b.id);
  let allChapters: any[] = [];
  if (bookIds.length > 0) {
    allChapters = await db
      .select()
      .from(chapters)
      .where(inArray(chapters.bookId, bookIds));
  }

  const booksWithProgress = publishedBooks.map((book) => {
    const bookChapters = allChapters.filter((c) => c.bookId === book.id);
    const totalCount = bookChapters.length;
    const publishedCount = bookChapters.filter((c) => c.status === "published").length;
    return {
      ...book,
      progressText: getBookProgressText(publishedCount, totalCount),
    };
  });

  return (
    <div className="relative overflow-hidden py-16">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-green-accent/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="border-b border-border-muted pb-6">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text-primary">
            The Book Shelf
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Serialized volumes, compilations, and long-form textbook guides.
          </p>
        </div>

        {/* Books Shelf Grid */}
        {publishedBooks.length === 0 ? (
          <div className="rounded-xl border border-border-muted bg-bg-surface p-12 text-center">
            <p className="font-mono text-sm text-text-secondary">
              No books have been published on the shelf yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {booksWithProgress.map((book) => (
              <Link key={book.id} href={`/books/${book.slug}`} className="group block">
                <SpotlightCard className="p-5 flex flex-col justify-between h-full hover:border-green-accent transition-colors duration-300">
                  <div className="space-y-4">
                    {/* 3D Physical Book Cover Card */}
                    <div className="relative aspect-[3/4] w-full rounded bg-bg-base border border-border-muted/50 overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-[1.03] group-hover:-rotate-2 group-hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)]">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-text-secondary">
                          NO COVER
                        </div>
                      )}
                      {/* Spine shading overlay */}
                      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
                    </div>

                    {/* Book Metadata */}
                    <div className="space-y-1">
                      <h3 className="font-sans font-bold text-text-primary text-base leading-tight group-hover:text-green-accent transition-colors duration-300">
                        {book.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {book.description}
                      </p>
                      <p className="text-[10px] font-mono text-green-accent pt-1">
                        {book.progressText}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-1.5 border-t border-border-muted/30 pt-3">
                    {book.topics.slice(0, 2).map((topic) => (
                      <span
                        key={topic}
                        className="rounded border border-border-muted/50 bg-emerald-950/20 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
