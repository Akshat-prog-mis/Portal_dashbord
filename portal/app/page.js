// app/page.js - CLEANED VERSION
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Category color mapping
const categoryColors = {
  "Google Sheets": "bg-blue-500",
  "Looker Studio": "bg-green-500",
  Forms: "bg-red-500",
  Miscellaneous: "bg-purple-500",
  Dashboard: "bg-yellow-500",
};

function CategoryCard({ category, links }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const bgColor = categoryColors[category] || "bg-gray-500";

  // Safety check: Ensure links is always an array
  const safeLinks = Array.isArray(links) ? links : [];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Category Header */}
      <div className={`${bgColor} p-4 cursor-pointer`} onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full opacity-75"></div>
            <h3 className="text-white text-xl font-bold">{category}</h3>
            <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
              {safeLinks.length} links
            </span>
          </div>
          <div
            className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      <div
        className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-full" : "max-h-0"}`}
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeLinks.map((link) => (
              <div
                key={link.id}
                className="group relative bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h4>
                  <div className={`w-3 h-3 ${bgColor} rounded-full opacity-60`}></div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{link.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 truncate max-w-40">
                    {link.url.replace(/https?:\/\//, "")}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-4 py-2 ${bgColor} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity group-hover:scale-105 transform duration-200`}
                  >
                    Open
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Show message if no links */}
          {safeLinks.length === 0 && (
            <div className="text-center py-8 text-gray-500">No links in this category</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Different API endpoints for admin vs user
  const apiEndpoint =
    session?.user?.role === "admin" ? "/api/links?grouped=true" : "/api/links/user-assigned";

  const { data: categorizedLinks, error } = useSWR(session ? apiEndpoint : null, fetcher);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Failed to load links
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!categorizedLinks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your links...</p>
        </div>
      </div>
    );
  }

  // SAFETY CHECK: Ensure categorizedLinks is an object
  const safeCategorizedLinks =
    categorizedLinks && typeof categorizedLinks === "object" ? categorizedLinks : {};
  const categories = Object.keys(safeCategorizedLinks).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* NAVIGATION HEADER */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {session.user.role === "admin" ? "Company Links Dashboard" : "My Assigned Links"}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  session.user.role === "admin"
                    ? "text-red-700 bg-red-100"
                    : "text-gray-700 bg-gray-100"
                }`}
              >
                {session.user.role === "admin" ? "Admin" : "User"}: {session.user.username}
              </span>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {session.user.role === "admin" ? "All Company Links" : "Your Assigned Links"}
            </h2>
            <p className="text-gray-600">
              {session.user.role === "admin"
                ? "Browse and manage all company resources"
                : "Access the links assigned to you by your administrator"}
            </p>
          </div>

          {/* Categories */}
          {categories.length > 0 ? (
            <div className="space-y-8">
              {categories.map((category) => (
                <CategoryCard
                  key={category}
                  category={category}
                  links={safeCategorizedLinks[category]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-24 w-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mt-4">
                {session.user.role === "admin" ? "No links found" : "No links assigned to you yet"}
              </h3>
              <p className="text-gray-600 mt-2">
                {session.user.role === "admin"
                  ? "Get started by adding your first link."
                  : "Contact your administrator to get links assigned to your account."}
              </p>
            </div>
          )}

          {/* Stats */}
          {categories.length > 0 && (
            <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {Object.values(safeCategorizedLinks).flat().length}
                  </div>
                  <div className="text-gray-600">
                    {session.user.role === "admin" ? "Total Links" : "Assigned Links"}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{categories.length}</div>
                  <div className="text-gray-600">Categories</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {session.user.role === "admin" ? "Admin" : "User"}
                  </div>
                  <div className="text-gray-600">Access Level</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
