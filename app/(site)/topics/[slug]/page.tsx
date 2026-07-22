import Link from "next/link";
import { db, blogs, papers, books } from "@/lib/db";
import { sql, and, eq } from "drizzle-orm";
import SpotlightCard from "@/components/SpotlightCard";
import { formatFriendlyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface TopicDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Query blogs, papers, and books matching this tag
  const matchingBlogs = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.status, "published"), sql`${slug} = ANY(${blogs.topics})`));

  const matchingPapers = await db
    .select()
    .from(papers)
    .where(and(eq(papers.status, "published"), sql`${slug} = ANY(${papers.topics})`));

  const matchingBooks = await db
    .select()
    .from(books)
    .where(and(eq(books.status, "published"), sql`${slug} = ANY(${books.topics})`));

  const totalCount = matchingBlogs.length + matchingPapers.length + matchingBooks.length;

  return (
    <div className="relative overflow-hidden py-16">
      {/* Background soft lighting */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-green-accent/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Navigation back */}
        <div>
          <Link
            href="/topics"
            className="text-xs font-mono text-text-secondary hover:text-green-accent transition-colors duration-300"
          >
            &larr; Back to topics
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-border-muted pb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text-primary">
              #{slug}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Everything tagged with <span className="text-green-accent font-mono">#{slug}</span> across the library.
            </p>
          </div>
          <span className="text-xs font-mono text-green-accent bg-green-dark/30 border border-green-accent/20 px-3 py-1 rounded-full w-fit">
            {totalCount} {totalCount === 1 ? "publication" : "publications"}
          </span>
        </div>

        {totalCount === 0 ? (
          <div className="rounded-xl border border-border-muted bg-bg-surface p-12 text-center">
            <p className="font-mono text-sm text-text-secondary">
              No matching published items found for this topic.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. Research Papers Group */}
            {matchingPapers.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-text-primary border-l-2 border-green-accent pl-3">
                  Research Papers
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {matchingPapers.map((paper) => (
                    <SpotlightCard key={paper.id} className="p-5 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="font-mono text-[10px] text-text-secondary">
                          {formatFriendlyDate(paper.publishedAt)}
                        </span>
                        <h3 className="font-sans text-base font-bold text-text-primary mt-1 hover:text-green-accent line-clamp-2">
                          <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                        </h3>
                        <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                          {paper.abstract}
                        </p>
                      </div>
                      <Link
                        href={`/papers/${paper.slug}`}
                        className="text-xs font-mono text-green-accent mt-4 hover:underline self-end"
                      >
                        Read paper &rarr;
                      </Link>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Blog Posts Group */}
            {matchingBlogs.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-text-primary border-l-2 border-green-accent pl-3">
                  Blog Posts
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {matchingBlogs.map((post) => (
                    <SpotlightCard key={post.id} className="p-5 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="font-mono text-[10px] text-text-secondary">
                          {formatFriendlyDate(post.publishedAt)}
                        </span>
                        <h3 className="font-sans text-base font-bold text-text-primary mt-1 hover:text-green-accent line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-mono text-green-accent mt-4 hover:underline self-end"
                      >
                        Read article &rarr;
                      </Link>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Books Group */}
            {matchingBooks.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-text-primary border-l-2 border-green-accent pl-3">
                  Books & Serialized Volumes
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {matchingBooks.map((book) => (
                    <SpotlightCard key={book.id} className="p-5 flex flex-col justify-between min-h-[160px]">
                      <div className="flex gap-4">
                        <div className="h-16 w-12 bg-bg-base border border-border-muted rounded flex-shrink-0 overflow-hidden">
                          {book.coverImage && (
                            <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="font-mono text-[10px] text-text-secondary">Book Shelf</span>
                          <h3 className="font-sans text-base font-bold text-text-primary hover:text-green-accent line-clamp-2">
                            <Link href={`/books/${book.slug}`}>{book.title}</Link>
                          </h3>
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {book.description}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/books/${book.slug}`}
                        className="text-xs font-mono text-green-accent mt-4 hover:underline self-end"
                      >
                        Start reading &rarr;
                      </Link>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
