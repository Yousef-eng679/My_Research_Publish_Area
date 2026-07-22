"use client";

import { useState } from "react";
import BookForm from "./BookForm";
import ChapterForm from "./ChapterForm";
import { deleteBook, deleteChapter } from "../actions";

interface Chapter {
  id: number;
  bookId: number;
  slug: string;
  title: string;
  body: string;
  orderIndex: number;
  status: "draft" | "published";
  publishedAt: Date;
}

interface Book {
  id: number;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  topics: string[];
  status: "draft" | "published";
  publishedAt: Date;
  chapters: Chapter[];
}

interface BookManagerProps {
  initialBooks: Book[];
}

export default function BookManager({ initialBooks }: BookManagerProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  
  // State for active editors
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  
  // State for chapter editors
  const [editingChapter, setEditingChapter] = useState<{ chapter: Chapter; bookSlug: string } | null>(null);
  const [creatingChapterFor, setCreatingChapterFor] = useState<{ bookId: number; bookSlug: string } | null>(null);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDeleteBook = async (id: number, slug: string) => {
    if (!confirm("Are you sure you want to delete this book? This will delete all chapters!")) return;
    setLoadingId(`book-${id}`);
    try {
      await deleteBook(id, slug);
      setBooks(books.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete book.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteChapter = async (chapterId: number, bookId: number, bookSlug: string, chapterSlug: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    setLoadingId(`chapter-${chapterId}`);
    try {
      await deleteChapter(chapterId, bookSlug, chapterSlug);
      // update state
      setBooks(
        books.map((b) => {
          if (b.id === bookId) {
            return {
              ...b,
              chapters: b.chapters.filter((c) => c.id !== chapterId),
            };
          }
          return b;
        })
      );
    } catch (err: any) {
      alert(err.message || "Failed to delete chapter.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border-muted pb-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-text-primary">
            Manage Books & Chapters
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Organize serialized content, edit book parameters, and write chapters.
          </p>
        </div>
        {!isCreatingBook && !editingBook && !creatingChapterFor && !editingChapter && (
          <button
            onClick={() => setIsCreatingBook(true)}
            className="px-4 py-2 border border-green-accent bg-green-dark/20 text-green-accent rounded text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-all duration-300"
          >
            + Create New Book
          </button>
        )}
      </div>

      {/* Book Editors */}
      {isCreatingBook && (
        <BookForm onCancel={() => setIsCreatingBook(false)} />
      )}

      {editingBook && (
        <BookForm
          initialData={editingBook}
          onCancel={() => setEditingBook(null)}
        />
      )}

      {/* Chapter Editors */}
      {creatingChapterFor && (
        <ChapterForm
          bookId={creatingChapterFor.bookId}
          bookSlug={creatingChapterFor.bookSlug}
          onCancel={() => setCreatingChapterFor(null)}
        />
      )}

      {editingChapter && (
        <ChapterForm
          bookId={editingChapter.chapter.bookId}
          bookSlug={editingChapter.bookSlug}
          initialData={editingChapter.chapter}
          onCancel={() => setEditingChapter(null)}
        />
      )}

      {/* Main List */}
      {!isCreatingBook && !editingBook && !creatingChapterFor && !editingChapter && (
        <div className="space-y-6">
          {books.length === 0 ? (
            <div className="border border-border-muted rounded-xl bg-bg-surface p-8 text-center text-sm text-text-secondary font-mono">
              No books found. Click "+ Create New Book" to start serializing.
            </div>
          ) : (
            books.map((book) => {
              const isExpanded = expandedBookId === book.id;
              return (
                <div
                  key={book.id}
                  className="border border-border-muted rounded-xl bg-bg-surface overflow-hidden transition-all duration-300"
                >
                  {/* Book header bar */}
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-bg-hover/10 transition-colors duration-300">
                    <div className="flex items-start gap-4">
                      {/* Book Cover Mini */}
                      <div className="relative h-16 w-12 bg-bg-base border border-border-muted rounded overflow-hidden flex-shrink-0">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[8px] font-mono text-text-secondary">
                            COVER
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                              book.status === "published"
                                ? "bg-green-dark/30 border-green-accent/30 text-green-accent"
                                : "bg-bg-base border-border-muted text-text-secondary"
                            }`}
                          >
                            {book.status}
                          </span>
                          <span className="text-xs text-text-secondary font-mono">
                            {book.chapters.length} chapters
                          </span>
                        </div>
                        <h3 className="font-sans font-bold text-text-primary text-lg">
                          {book.title}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-1 max-w-xl">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-center">
                      <button
                        onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                        className="px-3 py-1.5 border border-border-muted text-text-secondary hover:border-green-accent hover:text-green-accent rounded text-xs font-mono transition-colors duration-300"
                      >
                        {isExpanded ? "Collapse" : "Chapters"}
                      </button>
                      <button
                        onClick={() => setEditingBook(book)}
                        className="px-3 py-1.5 border border-border-muted text-text-primary hover:border-green-accent hover:text-green-accent rounded text-xs font-mono transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        disabled={loadingId === `book-${book.id}`}
                        onClick={() => handleDeleteBook(book.id, book.slug)}
                        className="px-3 py-1.5 border border-red-950/30 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded text-xs font-mono transition-colors duration-300 disabled:opacity-50"
                      >
                        {loadingId === `book-${book.id}` ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded chapters list */}
                  {isExpanded && (
                    <div className="border-t border-border-muted bg-bg-base/40 p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-border-muted/50 pb-2">
                        <h4 className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                          Book Chapters
                        </h4>
                        <button
                          onClick={() =>
                            setCreatingChapterFor({ bookId: book.id, bookSlug: book.slug })
                          }
                          className="px-2.5 py-1 border border-green-accent/30 bg-green-dark/10 text-green-accent text-[10px] font-mono hover:bg-green-dark/30 rounded"
                        >
                          + Add Chapter
                        </button>
                      </div>

                      {book.chapters.length === 0 ? (
                        <p className="text-xs text-text-secondary italic font-mono text-center py-4">
                          No chapters written yet. Click "+ Add Chapter" to write the first one.
                        </p>
                      ) : (
                        <div className="divide-y divide-border-muted/50 border border-border-muted/50 rounded-lg overflow-hidden bg-bg-surface">
                          {book.chapters
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((chapter) => (
                              <div
                                key={chapter.id}
                                className="p-4 flex items-center justify-between gap-4 hover:bg-bg-hover/20"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-[10px] text-green-accent">
                                      Chapter {chapter.orderIndex}
                                    </span>
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono border ${
                                        chapter.status === "published"
                                          ? "bg-green-dark/30 border-green-accent/30 text-green-accent"
                                          : "bg-bg-base border-border-muted text-text-secondary"
                                      }`}
                                    >
                                      {chapter.status}
                                    </span>
                                  </div>
                                  <h5 className="font-sans font-bold text-text-primary text-sm">
                                    {chapter.title}
                                  </h5>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      setEditingChapter({ chapter, bookSlug: book.slug })
                                    }
                                    className="px-2.5 py-1 border border-border-muted text-text-primary hover:border-green-accent hover:text-green-accent rounded text-[10px] font-mono transition-colors duration-300"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    disabled={loadingId === `chapter-${chapter.id}`}
                                    onClick={() =>
                                      handleDeleteChapter(
                                        chapter.id,
                                        book.id,
                                        book.slug,
                                        chapter.slug
                                      )
                                    }
                                    className="px-2.5 py-1 border border-red-950/30 text-red-400 hover:bg-red-950/20 rounded text-[10px] font-mono transition-colors duration-300 disabled:opacity-50"
                                  >
                                    {loadingId === `chapter-${chapter.id}` ? "..." : "Delete"}
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
            })
          )}
        </div>
      )}
    </div>
  );
}
