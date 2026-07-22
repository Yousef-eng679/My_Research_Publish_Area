"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveBlog } from "../actions";
import { generateSlug } from "@/lib/utils";
import { parseMarkdownWithFrontmatter } from "@/lib/parser";

interface BlogFormProps {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    summary: string;
    body: string;
    topics: string[];
    status: "draft" | "published" | "archived";
    coverImage?: string;
    readingTimeMinutes?: number;
  };
  onCancel: () => void;
}

export default function BlogForm({ initialData, onCancel }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [topicsInput, setTopicsInput] = useState(initialData?.topics.join(", ") || "");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(initialData?.status || "draft");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [readingTime, setReadingTime] = useState(initialData?.readingTimeMinutes || 0);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData?.id) {
      // only auto-generate slug for new posts
      setSlug(generateSlug(val));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Read and parse markdown file
  const handleMdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { metadata, body: parsedBody } = parseMarkdownWithFrontmatter(text);
      
      if (metadata.title) setTitle(metadata.title);
      if (metadata.summary) setSummary(metadata.summary);
      if (metadata.topics) setTopicsInput(metadata.topics.join(", "));
      setBody(parsedBody);
      
      if (!initialData?.id && metadata.title) {
        setSlug(generateSlug(metadata.title));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Upload file API call
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Upload failed");
    }

    const data = await res.json();
    return data.url;
  };

  // Upload image and insert it
  const handleImageBtnUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await uploadFile(file);
      const imageMarkdown = `\n![${file.name.split(".")[0]}](${url})\n`;

      const textarea = document.getElementById("blog-body-textarea") as HTMLTextAreaElement | null;
      if (textarea) {
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const val = textarea.value;
        const newVal = val.substring(0, selectionStart) + imageMarkdown + val.substring(selectionEnd);
        setBody(newVal);
      } else {
        setBody((prev) => prev + imageMarkdown);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleTextAreaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    e.preventDefault();
    setLoading(true);
    try {
      const url = await uploadFile(file);
      const imageMarkdown = `![${file.name.split(".")[0]}](${url})`;

      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const val = textarea.value;

      const newVal = val.substring(0, selectionStart) + imageMarkdown + val.substring(selectionEnd);
      setBody(newVal);
    } catch (err: any) {
      setError(err.message || "Failed to upload dropped image.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextAreaDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Process topics
    const topics = topicsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== "");

    try {
      await saveBlog({
        id: initialData?.id,
        title,
        slug,
        summary,
        body,
        topics,
        status,
        coverImage: coverImage || undefined,
        readingTimeMinutes: readingTime > 0 ? readingTime : undefined,
      });

      router.push("/admin/blog");
      router.refresh();
      onCancel();
    } catch (err: any) {
      setError(err.message || "Failed to save blog post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-muted p-6 rounded-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border-muted pb-3">
        <h3 className="font-sans font-bold text-text-primary text-lg">
          {initialData?.id ? "Edit Blog Post" : "Create New Blog Post"}
        </h3>
        <button
          onClick={onCancel}
          className="text-xs font-mono text-text-secondary hover:text-text-primary"
        >
          [Cancel]
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-900/30 bg-red-950/20 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* MD file upload loader */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border-muted bg-bg-base/30">
        <div>
          <h4 className="text-xs font-mono font-bold text-text-primary">
            Import Markdown (.md)
          </h4>
          <p className="text-[10px] text-text-secondary">
            Select an .md file to automatically fill in the title, summary, tags, and body.
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".md"
            onChange={handleMdUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded border border-border-muted text-xs font-mono hover:border-green-accent hover:text-green-accent transition-colors duration-300"
          >
            Choose File
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="Post title..."
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
            Slug
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="my-post-slug"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
            Summary
          </label>
          <textarea
            required
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="Short 1-2 sentence description..."
          />
        </div>

        {/* Body (Markdown) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Body (Markdown)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageBtnUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-2.5 py-1 text-[10px] font-mono border border-border-muted rounded text-text-secondary hover:border-green-accent hover:text-green-accent transition-colors duration-300"
              >
                + Upload & Insert Image
              </button>
              <span className="text-[9px] font-mono text-text-secondary hidden sm:inline">
                (or drag & drop images below)
              </span>
            </div>
          </div>
          <textarea
            id="blog-body-textarea"
            required
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onDrop={handleTextAreaDrop}
            onDragOver={handleTextAreaDragOver}
            className="w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary font-mono focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="# Write content here..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Topics */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
              placeholder="nextjs, react, webdev"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Cover Image */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Cover Image URL (optional)
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
              placeholder="e.g. /images/cover.jpg"
            />
          </div>

          {/* Reading Time */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Reading Time Minutes (0 to auto-calculate)
            </label>
            <input
              type="number"
              value={readingTime}
              onChange={(e) => setReadingTime(Number(e.target.value))}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 border-t border-border-muted pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border-muted rounded text-xs font-mono hover:bg-bg-hover transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-green-accent bg-green-dark/20 text-green-accent rounded text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
