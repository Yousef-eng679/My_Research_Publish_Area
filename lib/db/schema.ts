import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Blogs Table
export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  topics: text("topics").array().notNull().default([]),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  coverImage: text("cover_image"),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),
  relatedContent: jsonb("related_content").default([]), // slugs list
});

// 2. Research Papers Table
export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  abstract: text("abstract").notNull(),
  authors: text("authors").array().notNull().default(["Admin"]),
  body: text("body").notNull(),
  citations: jsonb("citations").default([]), // array of { author, year, title, url }
  pdfUrl: text("pdf_url"),
  doi: text("doi"),
  citeAs: text("cite_as"),
  topics: text("topics").array().notNull().default([]),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  coverImage: text("cover_image"),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),
});

// 3. Books Table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image").notNull(),
  topics: text("topics").array().notNull().default([]),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  pdfUrl: text("pdf_url"),
});

// 4. Book Chapters Table
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  orderIndex: integer("order_index").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  pdfUrl: text("pdf_url"),
});

// Relations definitions
export const booksRelations = relations(books, ({ many }) => ({
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  book: one(books, {
    fields: [chapters.bookId],
    references: [books.id],
  }),
}));
