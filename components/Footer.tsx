import Link from "next/link";
import { cookies } from "next/headers";

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("admin_session");

  return (
    <footer className="w-full border-t border-border-muted bg-bg-base py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-secondary">
                Yousef's Library
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              &copy; {currentYear} Yousef. All rights reserved.
            </p>
          </div>

          {/* Socials / Actions */}
          <div className="flex items-center space-x-6 text-xs text-text-secondary">
            <Link
              href="/blog/rss.xml"
              className="flex items-center gap-1 transition-colors duration-300 hover:text-green-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="h-3 w-3 text-green-accent"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3.328 17.582c-.896 0-1.625-.729-1.625-1.625 0-.895.729-1.625 1.625-1.625.897 0 1.625.73 1.625 1.625 0 .896-.728 1.625-1.625 1.625zm5.721.011c-.006-2.617-1.127-5.064-3.159-6.885-.164-.148-.225-.386-.145-.597.079-.212.285-.353.51-.353h1.085c.198 0 .383.109.479.285 2.115 3.864 1.849 8.236-.37 11.55h-1.074c-.226 0-.432-.142-.511-.354-.079-.212-.017-.45.148-.598 1.942-1.745 3.033-4.101 3.037-6.648zm4.498-.011c-.007-4.85-2.288-9.317-6.26-12.247-.168-.124-.247-.336-.196-.543.05-.206.223-.356.436-.356h1.139c.2 0 .385.111.48.288 4.382 7.822 3.197 16.32-.931 22.858h-1.12c-.214 0-.387-.15-.437-.356-.05-.207.029-.419.197-.543 3.655-2.697 5.759-6.818 5.692-11.098z" />
              </svg>
              RSS Feed
            </Link>
            <span className="h-3 w-[1px] bg-border-muted" />
            <Link
              href="/about"
              className="transition-colors duration-300 hover:text-green-accent"
            >
              About Author
            </Link>
            {isAuthenticated && (
              <>
                <span className="h-3 w-[1px] bg-border-muted" />
                <Link
                  href="/admin"
                  className="transition-colors duration-300 hover:text-green-accent font-semibold"
                >
                  Admin Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Status Badge - Subtle Clean Mode */}
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-accent/40"></span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-text-secondary">
              System Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
