// app/admin/page.js - UPDATED ADMIN DASHBOARD
"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  // --- Dark Mode ---
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (saved === "system" && systemDark);
    setIsDark(initial);
    if (initial) document.documentElement.classList.add("dark");
  }, []);

  const toggleDark = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  // --- Data ---
  const { data: links, error: linksError } = useSWR("/api/links", fetcher);
  const { data: users, error: usersError } = useSWR("/api/users", fetcher);
  const { data: assignments, error: assignmentsError } = useSWR("/api/assignments", fetcher);

  if (linksError || usersError || assignmentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="inline-block p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Failed to load dashboard</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {linksError && "Links • "}
            {usersError && "Users • "}
            {assignmentsError && "Assignments"}
          </p>
        </div>
      </div>
    );
  }

  if (!links || !users || !assignments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-700 dark:border-gray-300 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const linksByCategory = Array.isArray(links)
    ? links.reduce((acc, link) => {
        acc[link.category] = (acc[link.category] || 0) + 1;
        return acc;
      }, {})
    : {};

  const regularUsers = Array.isArray(users) ? users.filter((user) => user.role === "user") : [];
  const totalAssignments = Array.isArray(assignments) ? assignments.length : 0;
  const usersWithAssignments = Array.isArray(assignments) ? [...new Set(assignments.map((a) => a.userId))].length : 0;
  const linksWithAssignments = Array.isArray(assignments) ? [...new Set(assignments.map((a) => a.linkId))].length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your link management system with individual assignments
          </p>
        </div>
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Links", value: links.length, icon: "🔗", color: "blue" },
          { label: "Regular Users", value: regularUsers.length, icon: "👥", color: "green" },
          { label: "Total Assignments", value: totalAssignments, icon: "✅", color: "purple" },
          { label: "Categories", value: Object.keys(linksByCategory).length, icon: "📁", color: "amber" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-xl p-5 border backdrop-blur-sm ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white/80 border-gray-200"
            } shadow-sm`}
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-${stat.color}-600 bg-${stat.color}-50 dark:bg-${stat.color}-900/30`}
              >
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Overview & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Assignment Stats */}
        <div
          className={`rounded-xl p-6 border backdrop-blur-sm ${
            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white/80 border-gray-200"
          }`}
        >
          <h3 className="font-semibold mb-4">Assignment Overview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Users with assignments</span>
              <span className="font-medium">
                {usersWithAssignments} / {regularUsers.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Links assigned</span>
              <span className="font-medium">
                {linksWithAssignments} / {links.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg. per user</span>
              <span className="font-medium">
                {regularUsers.length > 0 ? (totalAssignments / regularUsers.length).toFixed(1) : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Links by Category */}
        <div
          className={`rounded-xl p-6 border backdrop-blur-sm ${
            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white/80 border-gray-200"
          }`}
        >
          <h3 className="font-semibold mb-4">Links by Category</h3>
          {Object.keys(linksByCategory).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(linksByCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-500 italic text-sm">No links created yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { href: "/admin/links", title: "Manage Links", desc: "Create, edit, and organize links", bg: "from-blue-600 to-blue-700" },
          { href: "/admin/users", title: "Manage Users", desc: "Add and remove users", bg: "from-green-600 to-green-700" },
          { href: "/admin/assignments", title: "Link Assignments", desc: "Assign links to users", bg: "from-purple-600 to-purple-700" },
          { href: "/", title: "View Dashboard", desc: "See user perspective", bg: "from-gray-600 to-gray-700" },
        ].map((action, i) => (
          <Link
            key={action.title}
            href={action.href}
            className={`block rounded-xl p-5 bg-gradient-to-r ${action.bg} text-white hover:opacity-90 transition-all duration-200 group`}
          >
            <h4 className="font-semibold mb-1">{action.title}</h4>
            <p className="text-white/80 text-sm">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* System Overview */}
      <div
        className={`rounded-xl p-6 border backdrop-blur-sm ${
          isDark ? "bg-gray-800/50 border-gray-700" : "bg-white/80 border-gray-200"
        }`}
      >
        <h3 className="font-semibold mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {regularUsers.length > 0 ? Math.round((usersWithAssignments / regularUsers.length) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Users with Access</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {links.length > 0 ? Math.round((linksWithAssignments / links.length) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Links in Use</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Object.keys(linksByCategory).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Categories</p>
          </div>
        </div>

        {totalAssignments === 0 && regularUsers.length > 0 && links.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 ml-3">
                You have <span className="font-medium">{regularUsers.length} users</span> and{" "}
                <span className="font-medium">{links.length} links</span> ready. Start assigning!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}