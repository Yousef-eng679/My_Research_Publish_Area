import Link from "next/link";
import SpotlightCard from "@/components/SpotlightCard";
import { db, blogs, papers, books } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { formatFriendlyDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Query latest published items from Neon Postgres
  let latestBlog = null;
  let latestPaper = null;
  let latestBook = null;

  try {
    const fetchedBlogs = await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, "published"))
      .orderBy(desc(blogs.publishedAt))
      .limit(1);
    if (fetchedBlogs.length > 0) latestBlog = fetchedBlogs[0];

    const fetchedPapers = await db
      .select()
      .from(papers)
      .where(eq(papers.status, "published"))
      .orderBy(desc(papers.publishedAt))
      .limit(1);
    if (fetchedPapers.length > 0) latestPaper = fetchedPapers[0];

    const fetchedBooks = await db
      .select()
      .from(books)
      .where(eq(books.status, "published"))
      .orderBy(desc(books.publishedAt))
      .limit(1);
    if (fetchedBooks.length > 0) latestBook = fetchedBooks[0];
  } catch (err) {
    console.error("Failed to query homepage items:", err);
  }

  return (
    <div className="relative overflow-hidden py-20 sm:py-32">
      {/* Background Radial Lights */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-green-accent/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-green-glow/5 blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center md:text-left max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-green-accent/30 bg-green-dark/20 text-xs font-mono text-green-accent">
            <span className="h-2 w-2 rounded-full bg-green-accent animate-pulse"></span>
            <span>Hi, I'm Yousef</span>
          </div>

          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl md:text-6xl leading-tight">
            A digital archive of <br />
            <span className="text-green-accent text-glow-accent">thoughts, research &amp; books</span>.
          </h1>

          <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
            Welcome to my personal digital archive for research. I'm Yousef — applying AI &amp; software engineering skills, working hard in researching and publishing deep-dive articles, academic papers, and serialized books.
          </p>

          <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
            <Link
              href="/papers"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-green-accent bg-green-dark/20 text-green-accent font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-green-accent hover:text-bg-base transition-all duration-300"
            >
              Explore Papers
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border-muted bg-bg-surface text-text-primary font-medium hover:border-green-accent hover:text-green-accent transition-all duration-300"
            >
              Read Books
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border-muted bg-bg-surface text-text-secondary font-medium hover:border-green-accent hover:text-green-accent transition-all duration-300"
            >
              About Yousef &rarr;
            </Link>
          </div>
        </div>

        {/* Featured Content Grid */}
        <div className="mt-24 sm:mt-32">
          <div className="flex items-center justify-between border-b border-border-muted pb-4">
            <h2 className="font-sans text-xl font-bold tracking-wider uppercase text-text-primary">
              Featured Library Pick
            </h2>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {/* Blog Post Spotlight Card */}
            <SpotlightCard className="p-6 flex flex-col justify-between min-h-[220px]">
              {latestBlog ? (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-secondary font-mono mb-4">
                      <span className="text-green-accent uppercase">Blog</span>
                      <span>{latestBlog.readingTimeMinutes} min read</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-text-primary mb-2 line-clamp-2">
                      {latestBlog.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-3">
                      {latestBlog.summary}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {formatFriendlyDate(latestBlog.publishedAt)}
                    </span>
                    <Link
                      href={`/blog/${latestBlog.slug}`}
                      className="text-xs text-green-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      Read post <span>&rarr;</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-secondary font-mono mb-4">
                      <span className="text-green-accent uppercase">Blog</span>
                      <span>Upcoming</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-text-primary mb-2">
                      Blog Stream
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Insights on software architecture, compiler loops, and technical thoughts will appear here.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <span className="text-[10px] font-mono text-text-secondary">Coming Soon</span>
                  </div>
                </>
              )}
            </SpotlightCard>

            {/* Research Paper Spotlight Card */}
            <SpotlightCard className="p-6 flex flex-col justify-between min-h-[220px]">
              {latestPaper ? (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-secondary font-mono mb-4">
                      <span className="text-green-accent uppercase">Paper</span>
                      <span>PDF Available</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-text-primary mb-2 line-clamp-2">
                      {latestPaper.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-3">
                      {latestPaper.abstract}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {latestPaper.doi || "No DOI"}
                    </span>
                    <Link
                      href={`/papers/${latestPaper.slug}`}
                      className="text-xs text-green-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      View abstract <span>&rarr;</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-secondary font-mono mb-4">
                      <span className="text-green-accent uppercase">Paper</span>
                      <span>Upcoming</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-text-primary mb-2">
                      Research Papers
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Technical reports, research articles, and math formulations will appear here upon publication.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <span className="text-[10px] font-mono text-text-secondary">In Preparation</span>
                  </div>
                </>
              )}
            </SpotlightCard>

            {/* Book Spotlight Card */}
            <SpotlightCard className="p-6 flex flex-col justify-between min-h-[220px]">
              {latestBook ? (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-secondary font-mono mb-4">
                      <span className="text-green-accent uppercase">Book</span>
                      <span>Ongoing</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-text-primary mb-2 line-clamp-2">
                      {latestBook.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-3">
                      {latestBook.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Published</span>
                    <Link
                      href={`/books/${latestBook.slug}`}
                      className="text-xs text-green-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      Start reading <span>&rarr;</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-secondary font-mono mb-4">
                      <span className="text-green-accent uppercase">Book</span>
                      <span>Upcoming</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-text-primary mb-2">
                      Serialized Volumes
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Long-form textbook volumes, guides, and serialized serials will be published in this section.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <span className="text-[10px] font-mono text-text-secondary">In Preparation</span>
                  </div>
                </>
              )}
            </SpotlightCard>
          </div>
        </div>

        {/* Navigation Shortcuts Section */}
        <div className="mt-20 border-t border-border-muted pt-16 grid grid-cols-2 gap-4 md:grid-cols-4 text-center">
          <Link href="/blog" className="p-4 rounded-lg bg-bg-surface border border-border-muted hover:border-green-accent hover:text-green-accent transition-colors duration-300">
            <h4 className="font-sans font-bold">Blog Stream</h4>
            <p className="text-xs text-text-secondary mt-1">Chronological Notes</p>
          </Link>
          <Link href="/papers" className="p-4 rounded-lg bg-bg-surface border border-border-muted hover:border-green-accent hover:text-green-accent transition-colors duration-300">
            <h4 className="font-sans font-bold">Research Papers</h4>
            <p className="text-xs text-text-secondary mt-1">Academic Publications</p>
          </Link>
          <Link href="/books" className="p-4 rounded-lg bg-bg-surface border border-border-muted hover:border-green-accent hover:text-green-accent transition-colors duration-300">
            <h4 className="font-sans font-bold">Book Shelf</h4>
            <p className="text-xs text-text-secondary mt-1">Serialized Volumes</p>
          </Link>
          <Link href="/topics" className="p-4 rounded-lg bg-bg-surface border border-border-muted hover:border-green-accent hover:text-green-accent transition-colors duration-300">
            <h4 className="font-sans font-bold">Topics</h4>
            <p className="text-xs text-text-secondary mt-1">Browse Taxonomy</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
