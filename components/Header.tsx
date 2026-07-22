"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load and apply the stored theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const navLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Papers", href: "/papers" },
    { name: "Books", href: "/books" },
    { name: "Topics", href: "/topics" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-muted bg-bg-base/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Home link */}
        <Link href="/" className="group flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-accent bg-green-dark/30 text-green-accent shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105">
            <span className="font-mono text-sm font-bold">Y</span>
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-text-primary transition-all duration-300 group-hover:text-glow-accent group-hover:text-green-accent">
            Yousef's <span className="text-xs font-normal text-text-secondary">Library</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative py-2 text-sm font-medium transition-colors duration-300 hover:text-text-primary ${
                  isActive ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded bg-green-accent shadow-[0_0_8px_#10b981]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search, Theme & Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-muted bg-bg-surface text-text-secondary transition-all duration-300 hover:border-green-accent hover:text-green-accent hover:shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer"
            aria-label="Toggle theme mode"
          >
            {theme === "dark" ? (
              // Sun icon (displayed in Dark mode to switch to Light)
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"
                />
              </svg>
            ) : (
              // Moon icon (displayed in Light mode to switch to Dark)
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Search Button */}
          <Link
            href="/search"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border-muted bg-bg-surface text-text-secondary transition-all duration-300 hover:border-green-accent hover:text-green-accent hover:shadow-[0_0_8px_rgba(16,185,129,0.2)] ${
              pathname === "/search" ? "border-green-accent text-green-accent" : ""
            }`}
            aria-label="Search content"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
