import Link from "next/link";
import React from "react";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-base text-text-body">
      {/* Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border-muted bg-bg-surface md:block">
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-2 px-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-green-accent text-bg-base font-bold font-mono text-xs shadow-[0_0_8px_#10b981]">
                AD
              </div>
              <span className="font-sans font-bold tracking-tight text-text-primary">
                Library Portal
              </span>
            </div>

            {/* Menu */}
            <nav className="space-y-1 font-mono text-xs uppercase tracking-wider">
              <Link
                href="/admin"
                className="flex items-center px-3 py-2.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-green-accent transition-colors duration-300"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/blog"
                className="flex items-center px-3 py-2.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-green-accent transition-colors duration-300"
              >
                Manage Blogs
              </Link>
              <Link
                href="/admin/papers"
                className="flex items-center px-3 py-2.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-green-accent transition-colors duration-300"
              >
                Manage Papers
              </Link>
              <Link
                href="/admin/books"
                className="flex items-center px-3 py-2.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-green-accent transition-colors duration-300"
              >
                Manage Books
              </Link>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="space-y-4 border-t border-border-muted pt-6">
            <Link
              href="/"
              className="flex items-center justify-center w-full py-2 text-xs font-mono font-medium rounded border border-border-muted text-text-secondary hover:border-green-accent hover:text-green-accent transition-colors duration-300"
            >
              &larr; View Library
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border-muted bg-bg-surface px-4 md:hidden">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-green-accent text-bg-base font-bold font-mono text-xs">
              AD
            </div>
            <span className="font-sans font-bold tracking-tight text-text-primary text-sm">
              Library Portal
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/admin/blog"
              className="text-xs text-text-secondary hover:text-green-accent"
            >
              Blogs
            </Link>
            <Link
              href="/admin/papers"
              className="text-xs text-text-secondary hover:text-green-accent"
            >
              Papers
            </Link>
            <Link
              href="/admin/books"
              className="text-xs text-text-secondary hover:text-green-accent"
            >
              Books
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
