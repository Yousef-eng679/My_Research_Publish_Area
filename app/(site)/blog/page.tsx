import Link from "next/link";
import { db, blogs } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import SpotlightCard from "@/components/SpotlightCard";
import { formatFriendlyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  // Query all published blogs from Postgres
  const publishedBlogs = await db
    .select()
    .from(blogs)
    .where(eq(blogs.status, "published"))
    .orderBy(desc(blogs.publishedAt));

  return (
    <div className="relative overflow-hidden py-16">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-green-accent/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Page Header */}
        <div className="border-b border-border-muted pb-6">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text-primary">
            The Blog Stream
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Chronological notes, design reviews, and essays on systems architecture.
          </p>
        </div>

        {/* List of posts */}
        {publishedBlogs.length === 0 ? (
          <div className="rounded-xl border border-border-muted bg-bg-surface p-12 text-center">
            <p className="font-mono text-sm text-text-secondary">
              No blog posts have been published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
            {publishedBlogs.map((post) => (
              <SpotlightCard key={post.id} className="p-6 flex flex-col justify-between min-h-[240px]">
                <div className="space-y-4">
                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                    <span>{formatFriendlyDate(post.publishedAt)}</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </div>

                  {/* Title & summary */}
                  <div className="space-y-2">
                    <h2 className="font-sans text-xl font-bold text-text-primary hover:text-green-accent transition-colors duration-300">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </div>

                {/* Topics & Read more */}
                <div className="mt-6 flex flex-col gap-4 border-t border-border-muted/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.topics.map((topic) => (
                      <Link
                        key={topic}
                        href={`/topics/${topic}`}
                        className="rounded-md border border-border-muted bg-emerald-950/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 hover:bg-emerald-900/30 transition-colors duration-300"
                      >
                        #{topic}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-mono text-green-accent hover:underline flex items-center gap-1 font-medium whitespace-nowrap self-end sm:self-center"
                  >
                    Read article &rarr;
                  </Link>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
