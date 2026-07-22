"use client";

import { useState } from "react";
import BlogForm from "./BlogForm";
import { deleteBlog } from "../actions";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  topics: string[];
  status: "draft" | "published" | "archived";
  coverImage: string | null;
  readingTimeMinutes: number;
  publishedAt: Date;
}

interface BlogManagerProps {
  initialPosts: BlogPost[];
}

export default function BlogManager({ initialPosts }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, slug: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setDeletingId(id);
    try {
      await deleteBlog(id, slug);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border-muted pb-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-text-primary">
            Manage Blog Posts
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Write, review drafts, and delete chronological articles.
          </p>
        </div>
        {!isCreating && !editingPost && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 border border-green-accent bg-green-dark/20 text-green-accent rounded text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-all duration-300"
          >
            + Create New Post
          </button>
        )}
      </div>

      {/* Creation / Edit State */}
      {isCreating && (
        <BlogForm onCancel={() => setIsCreating(false)} />
      )}

      {editingPost && (
        <BlogForm
          initialData={{
            id: editingPost.id,
            title: editingPost.title,
            slug: editingPost.slug,
            summary: editingPost.summary,
            body: editingPost.body,
            topics: editingPost.topics,
            status: editingPost.status,
            coverImage: editingPost.coverImage || undefined,
            readingTimeMinutes: editingPost.readingTimeMinutes,
          }}
          onCancel={() => setEditingPost(null)}
        />
      )}

      {/* List View */}
      {!isCreating && !editingPost && (
        <div className="border border-border-muted rounded-xl bg-bg-surface overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary font-mono">
              No blog posts found. Click "+ Create New Post" to write your first article.
            </div>
          ) : (
            <div className="divide-y divide-border-muted">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-6 flex flex-col justify-between sm:flex-row sm:items-center gap-4 hover:bg-bg-hover/30 transition-colors duration-300"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                          post.status === "published"
                            ? "bg-green-dark/30 border-green-accent/30 text-green-accent"
                            : post.status === "draft"
                            ? "bg-bg-base border-border-muted text-text-secondary"
                            : "bg-red-950/20 border-red-900/30 text-red-400"
                        }`}
                      >
                        {post.status}
                      </span>
                      <span className="text-xs text-text-secondary font-mono">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-sans font-bold text-text-primary text-base">
                      {post.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 max-w-2xl">
                      {post.summary}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="px-3 py-1.5 border border-border-muted text-text-primary hover:border-green-accent hover:text-green-accent rounded text-xs font-mono transition-colors duration-300"
                    >
                      Edit
                    </button>
                    <button
                      disabled={deletingId === post.id}
                      onClick={() => handleDelete(post.id, post.slug)}
                      className="px-3 py-1.5 border border-red-950/30 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded text-xs font-mono transition-colors duration-300 disabled:opacity-50"
                    >
                      {deletingId === post.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
