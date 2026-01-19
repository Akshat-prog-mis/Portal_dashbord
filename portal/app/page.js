// app/page.js - CLEANED VERSION
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Theme-aware category gradients
const getCategoryGradient = (category, isDark) => {
  const light = {
    "Google Sheets": "from-blue-400 to-blue-600",
    "Looker Studio": "from-emerald-400 to-emerald-600",
    Forms: "from-rose-400 to-rose-600",
    Miscellaneous: "from-violet-400 to-violet-600",
    Dashboard: "from-amber-400 to-amber-600",
  };
  const dark = {
    "Google Sheets": "from-blue-500 to-blue-700",
    "Looker Studio": "from-emerald-500 to-emerald-700",
    Forms: "from-rose-500 to-rose-700",
    Miscellaneous: "from-violet-500 to-violet-700",
    Dashboard: "from-amber-500 to-amber-700",
  };
  return (isDark ? dark : light)[category] || (isDark ? "from-gray-500 to-gray-700" : "from-gray-400 to-gray-600");
};

function CategoryCard({ category, links, isDark }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const gradient = getCategoryGradient(category, isDark);
  const safeLinks = Array.isArray(links) ? links : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl overflow-hidden border ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-white/80 border-neutral-200"
        } backdrop-blur-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]`}
    >
      <div
        className={`bg-gradient-to-r ${gradient} p-4 cursor-pointer flex items-center justify-between`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-white rounded-full opacity-70"></div>
          <h3 className="text-white font-semibold text-lg tracking-tight">{category}</h3>
          <span className="text-white/90 text-xs px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm">
            {safeLinks.length}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-white transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5">
              {safeLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeLinks
                    .filter(link => link && link.url) // Optional: ensure minimal validity
                    .map((link, idx) => {
                      // Generate a stable, unique key: prefer id, fallback to URL (which should be unique), then index (last resort)
                      const key = link.id ?? link.url ?? `link-${idx}`;

                      return (
                        <motion.a
                          key={key}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`group block rounded-lg p-4 transition-all duration-200 hover:-translate-y-0.5 ${isDark
                              ? "bg-gray-800/50 border border-gray-700 hover:border-gray-600"
                              : "bg-white border border-neutral-200 hover:border-neutral-300"
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4
                              className={`font-medium line-clamp-1 ${isDark ? "text-gray-100 group-hover:text-gray-200" : "text-gray-900 group-hover:text-gray-700"
                                }`}
                            >
                              {link.title || "Untitled Link"}
                            </h4>
                            <div className={`w-2 h-2 bg-gradient-to-r ${gradient} rounded-full`}></div>
                          </div>
                          <p
                            className={`text-xs mb-3 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"
                              }`}
                          >
                            {link.description || "No description"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] truncate max-w-32 ${isDark ? "text-gray-500" : "text-gray-500"
                                }`}
                            >
                              {link.url ? link.url.replace(/https?:\/\//, "") : "Invalid URL"}
                            </span>
                            <span
                              className={`text-[11px] font-medium whitespace-nowrap px-2 py-1 rounded ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              Open →
                            </span>
                          </div>
                        </motion.a>
                      );
                    })}
                </div>
              ) : (
                <p className={`text-center text-sm py-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  No links in this category
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- Dark Mode Logic ---
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = useCallback(() => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  }, [isDark]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme === "dark" || (savedTheme === "system" && systemPrefersDark);
    setIsDark(initialTheme);
    if (initialTheme) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // --- Auth & Data ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const apiEndpoint =
    session?.user?.role === "admin" ? "/api/links?grouped=true" : "/api/links/user-assigned";

  const { data: categorizedLinks, error } = useSWR(session ? apiEndpoint : null, fetcher);

  if (status === "loading" || !categorizedLinks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-700 dark:border-gray-300 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-3">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Failed to load links</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm bg-gray-800 dark:bg-gray-700 text-white px-4 py-1.5 rounded hover:bg-black dark:hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const safeCategorizedLinks = typeof categorizedLinks === "object" ? categorizedLinks : {};
  const categories = Object.keys(safeCategorizedLinks).sort();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-neutral-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg font-semibold">
                {session.user.role === "admin" ? "Admin Dashboard" : "Your Links"}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${session.user.role === "admin"
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
                  }`}
              >
                {session.user.role === "admin" ? "Admin" : "User"} · {session.user.username}
              </span>

              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-xs bg-gray-800 dark:bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-black dark:hover:bg-gray-600 transition-colors"
                >
                  Admin Panel
                </Link>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">
            {session.user.role === "admin" ? "Link Dashboard" : "Your Assigned Links"}
          </h2>
          {session.user.role !== "admin" && (
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
              Access the tools assigned to you by your administrator.
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {categories.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-6"
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category}
                  category={category}
                  links={safeCategorizedLinks[category]}
                  isDark={isDark}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h3 className="font-medium">
                {session.user.role === "admin" ? "No links yet" : "No assigned links"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {session.user.role === "admin"
                  ? "Add your first link in the Admin Panel."
                  : "Contact your admin to assign links."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-10 rounded-xl p-5 backdrop-blur-sm ${isDark ? "bg-gray-800/60 border border-gray-700" : "bg-white/70 border border-neutral-200"
              }`}
          >
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold">{Object.values(safeCategorizedLinks).flat().length}</div>
                <div className={isDark ? "text-gray-400" : "text-gray-600"}>Total Links</div>
              </div>
              <div>
                <div className="font-semibold">{categories.length}</div>
                <div className={isDark ? "text-gray-400" : "text-gray-600"}>Categories</div>
              </div>
              <div>
                <div className="font-semibold capitalize">{session.user.role}</div>
                <div className={isDark ? "text-gray-400" : "text-gray-600"}>Role</div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}