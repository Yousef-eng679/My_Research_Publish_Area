import Link from "next/link";
import { notFound } from "next/navigation";
import { db, blogs, papers } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";
import { compileMarkdown } from "@/lib/markdown";
import { formatFriendlyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Query blog post from Neon
  const fetchedBlogs = await db
    .select()
    .from(blogs)
    .where(eq(blogs.slug, slug))
    .limit(1);

  if (fetchedBlogs.length === 0) {
    notFound();
  }

  const post = fetchedBlogs[0];

  // Protect draft states
  if (post.status !== "published") {
    notFound();
  }

  // Compile markdown body on the server
  const bodyHtml = compileMarkdown(post.body);

  // Fetch related content
  let relatedContentList: Array<{ type: "blog" | "paper"; title: string; slug: string }> = [];
  const relatedSlugs = (post.relatedContent as string[]) || [];

  if (relatedSlugs.length > 0) {
    try {
      const relatedBlogs = await db
        .select()
        .from(blogs)
        .where(and(eq(blogs.status, "published"), inArray(blogs.slug, relatedSlugs)));

      const relatedPapers = await db
        .select()
        .from(papers)
        .where(and(eq(papers.status, "published"), inArray(papers.slug, relatedSlugs)));

      relatedContentList = [
        ...relatedBlogs.map((b) => ({ type: "blog" as const, title: b.title, slug: b.slug })),
        ...relatedPapers.map((p) => ({ type: "paper" as const, title: p.title, slug: p.slug })),
      ];
    } catch (err) {
      console.error("Failed to query related content items:", err);
    }
  }

  return (
    <article className="relative overflow-hidden py-16">
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

      {/* Background radial soft light */}
      <div className="absolute top-[10%] left-[50%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-green-accent/3 blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 relative z-10 space-y-8">
        {/* Navigation back */}
        <div>
          <Link
            href="/blog"
            className="text-xs font-mono text-text-secondary hover:text-green-accent transition-colors duration-300"
          >
            &larr; Back to blog stream
          </Link>
        </div>

        {/* Post Header */}
        <div className="space-y-4 border-b border-border-muted pb-8">
          <div className="flex items-center space-x-4 text-xs font-mono text-text-secondary">
            <span>{formatFriendlyDate(post.publishedAt)}</span>
            <span>&bull;</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>

          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <p className="text-base text-text-secondary leading-relaxed italic border-l-2 border-green-accent pl-4">
            {post.summary}
          </p>

          {/* Topics */}
          <div className="flex flex-wrap gap-2 pt-2">
            {post.topics.map((topic) => (
              <Link
                key={topic}
                href={`/topics/${topic}`}
                className="rounded-md border border-border-muted bg-emerald-950/20 px-2.5 py-0.5 text-xs font-mono text-emerald-400 hover:bg-emerald-900/30 transition-colors duration-300"
              >
                #{topic}
              </Link>
            ))}
          </div>
        </div>

        {/* Post Body (Serif Long-Form Reading Area) */}
        <div
          className="serif-reading prose prose-invert prose-emerald max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Related Reading Section */}
        {relatedContentList.length > 0 && (
          <div className="border-t border-border-muted pt-8 mt-12 space-y-4">
            <h3 className="font-sans text-lg font-bold text-text-primary">
              Related Reading
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedContentList.map((item) => (
                <Link
                  key={`${item.type}-${item.slug}`}
                  href={item.type === "blog" ? `/blog/${item.slug}` : `/papers/${item.slug}`}
                  className="block p-4 rounded-xl border border-border-muted bg-bg-surface hover:border-green-accent transition-colors duration-300"
                >
                  <span className="font-mono text-[9px] uppercase tracking-wider text-green-accent block">
                    {item.type}
                  </span>
                  <span className="font-sans font-bold text-text-primary text-sm mt-1 block hover:text-green-accent">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
