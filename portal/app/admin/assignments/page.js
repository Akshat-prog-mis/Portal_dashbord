"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Detect system theme for initial state
function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (saved === "system" && systemDark);
    setIsDark(initial);
  }, []);

  return isDark;
}

// Custom Searchable Dropdown Component
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  displayKey = "name",
  valueKey = "id",
  searchKey = "name",
  required = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isDark = useTheme();

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchKey]);

  const selectedOption = options.find((option) => option[valueKey] === value);

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer ${
          isDark
            ? "bg-gray-800 border border-gray-700 text-gray-100"
            : "bg-white border border-gray-300 text-gray-900"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <span className={selectedOption ? (isDark ? "text-gray-100" : "text-gray-900") : "text-gray-500 dark:text-gray-400"}>
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""} ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg max-h-60 overflow-hidden ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"
          }`}
        >
          <div className={`p-2 ${isDark ? "border-b border-gray-700" : "border-b border-gray-200"}`}>
            <input
              type="text"
              placeholder="Search..."
              className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className={`px-4 py-3 cursor-pointer text-sm last:border-b-0 ${
                    isDark
                      ? "hover:bg-gray-700 border-b border-gray-700 text-gray-100"
                      : "hover:bg-gray-50 border-b border-gray-100 text-gray-900"
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="font-medium">{option[displayKey]}</div>
                  {option.subtitle && (
                    <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {option.subtitle}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={`px-4 py-3 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      <input type="hidden" value={value} required={required} />
    </div>
  );
}

export default function AdminAssignments() {
  const isDark = useTheme();
  const { data: users, error: usersError } = useSWR("/api/users", fetcher);
  const { data: links, error: linksError } = useSWR("/api/links", fetcher);
  const { data: assignments, error: assignmentsError } = useSWR("/api/assignments", fetcher);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLink, setSelectedLink] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("user");

  const handleAssignLink = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedLink) {
      alert("Please select both user and link");
      return;
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, linkId: selectedLink }),
      });

      if (response.ok) {
        mutate("/api/assignments");
        setSelectedUser("");
        setSelectedLink("");
        setSelectedCategory("");
        alert("Link assigned successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to assign link"}`);
      }
    } catch (error) {
      console.error("Error assigning link:", error);
      alert("Error assigning link");
    }
  };

  const handleUnassignLink = async (userId, linkId) => {
    if (confirm("Are you sure you want to remove this assignment?")) {
      try {
        const response = await fetch(`/api/assignments/${userId}/${linkId}`, { method: "DELETE" });
        if (response.ok) {
          mutate("/api/assignments");
          alert("Assignment removed successfully!");
        } else {
          alert("Error removing assignment");
        }
      } catch (error) {
        console.error("Error removing assignment:", error);
        alert("Error removing assignment");
      }
    }
  };

  if (usersError || linksError || assignmentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center text-red-600 dark:text-red-400">Failed to load data</div>
      </div>
    );
  }

  if (!users || !links || !assignments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const usersList = Array.isArray(users) ? users : [];
  const linksList = Array.isArray(links) ? links : [];
  const assignmentsList = Array.isArray(assignments) ? assignments : [];
  const regularUsers = usersList.filter((user) => user.role !== "admin");
  const categories = [...new Set(linksList.map((link) => link.category))].sort();
  const filteredLinks = selectedCategory
    ? linksList.filter((link) => link.category === selectedCategory)
    : linksList;

  const userOptions = regularUsers.map((user) => ({
    id: user.id,
    name: user.username,
    subtitle: `${user.role} • ${new Date(user.created_at).toLocaleDateString()}`,
  }));

  const linkOptions = filteredLinks.map((link) => ({
    id: link.id,
    name: link.title,
    subtitle: `${link.category} • ${link.url.replace(/https?:\/\//, "").substring(0, 30)}...`,
  }));

  // Group assignments
  const assignmentsByUser = {};
  assignmentsList.forEach((assignment) => {
    const user = usersList.find((u) => u.id === assignment.userId);
    const link = linksList.find((l) => l.id === assignment.linkId);
    if (user && link) {
      if (!assignmentsByUser[user.id]) {
        assignmentsByUser[user.id] = { user, links: [] };
      }
      assignmentsByUser[user.id].links.push(link);
    }
  });

  const assignmentsByLink = {};
  assignmentsList.forEach((assignment) => {
    const link = linksList.find((l) => l.id === assignment.linkId);
    const user = usersList.find((u) => u.id === assignment.userId);
    if (link && user) {
      if (!assignmentsByLink[link.id]) {
        assignmentsByLink[link.id] = { link, users: [] };
      }
      assignmentsByLink[link.id].users.push(user);
    }
  });

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Link Assignments</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Assign links to individual users with advanced search
          </p>
        </div>
        <div className="flex space-x-2">
          {["user", "link"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                viewMode === mode
                  ? "bg-blue-600 text-white"
                  : isDark
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              By {mode === "user" ? "User" : "Link"}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Form */}
      <div
        className={`rounded-xl p-6 mb-8 backdrop-blur-sm ${
          isDark ? "bg-gray-800/50 border border-gray-700" : "bg-white/80 border border-gray-200"
        }`}
      >
        <h3 className="text-xl font-semibold mb-5">Assign New Link</h3>
        <form onSubmit={handleAssignLink}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Select User *
              </label>
              <SearchableDropdown
                options={userOptions}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Search and select user..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Filter by Category
              </label>
              <select
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-white"
                    : "bg-white border border-gray-300 text-gray-900"
                }`}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedLink("");
                }}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Select Link *
                {selectedCategory && (
                  <span className="text-blue-600 dark:text-blue-400 text-xs ml-1">
                    ({filteredLinks.length} in {selectedCategory})
                  </span>
                )}
              </label>
              <SearchableDropdown
                options={linkOptions}
                value={selectedLink}
                onChange={setSelectedLink}
                placeholder={
                  selectedCategory
                    ? `Search links in ${selectedCategory}...`
                    : "First select a category or search all links..."
                }
                required
              />
            </div>
          </div>

          {selectedUser && selectedLink && (
            <div
              className={`rounded-lg p-4 mb-6 ${
                isDark ? "bg-blue-900/30 border border-blue-800/50" : "bg-blue-50 border border-blue-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Ready to assign:</strong>{" "}
                  {linksList.find((l) => l.id === selectedLink)?.title} →{" "}
                  {usersList.find((u) => u.id === selectedUser)?.username}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium text-sm"
            >
              Assign Link
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedUser("");
                setSelectedLink("");
                setSelectedCategory("");
              }}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm ${
                isDark
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
            >
              Clear Selection
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div
        className={`rounded-xl p-5 mb-8 ${
          isDark ? "bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30" : "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200"
        }`}
      >
        <h3 className="font-semibold mb-4">💡 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const count = linksList.filter((l) => l.category === category).length;
            return (
              <div
                key={category}
                className={`rounded-lg p-4 ${
                  isDark ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{category}</h4>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {count} links
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className="w-full bg-purple-600 text-white py-1.5 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  Filter by {category}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignments Display */}
      <div
        className={`rounded-xl overflow-hidden mb-8 ${
          isDark ? "bg-gray-800/50 border border-gray-700" : "bg-white/80 border border-gray-200"
        }`}
      >
        {viewMode === "user" ? (
          <div>
            <div className={`px-6 py-4 ${isDark ? "bg-gray-800 border-b border-gray-700" : "bg-gray-50 border-b border-gray-200"}`}>
              <h3 className="font-semibold">Assignments by User</h3>
            </div>
            <div className={isDark ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}>
              {Object.values(assignmentsByUser).map((ua) => (
                <div key={ua.user.id} className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">
                          {ua.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{ua.user.username}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ua.links.length} links assigned
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(ua.user.id)}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm"
                    >
                      Assign More
                    </button>
                  </div>

                  {Object.entries(
                    ua.links.reduce((acc, link) => {
                      if (!acc[link.category]) acc[link.category] = [];
                      acc[link.category].push(link);
                      return acc;
                    }, {})
                  ).map(([cat, catLinks]) => (
                    <div key={cat} className="mb-4 ml-2">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center text-sm mb-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {cat} ({catLinks.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {catLinks.map((link) => (
                          <div
                            key={link.id}
                            className={`p-3 rounded-lg ${
                              isDark ? "bg-gray-800/50 border border-gray-700" : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between">
                              <div className="text-sm font-medium">{link.title}</div>
                              <button
                                onClick={() => handleUnassignLink(ua.user.id, link.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {link.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {regularUsers
                .filter((u) => !assignmentsByUser[u.id])
                .map((user) => (
                  <div key={user.id} className="p-5 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.username}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-500 italic">No links assigned</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(user.id)}
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded text-sm"
                    >
                      Assign Links
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div>
            <div className={`px-6 py-4 ${isDark ? "bg-gray-800 border-b border-gray-700" : "bg-gray-50 border-b border-gray-200"}`}>
              <h3 className="font-semibold">Assignments by Link</h3>
            </div>
            <div className={isDark ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}>
              {Object.values(assignmentsByLink).map((la) => (
                <div key={la.link.id} className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{la.link.title}</h4>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                          {la.link.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{la.link.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {la.users.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center px-3 py-1.5 rounded-full ${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <span className="text-sm font-medium mr-2">{user.username}</span>
                        <button
                          onClick={() => handleUnassignLink(user.id, la.link.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Users", value: regularUsers.length, icon: "👥" },
          { label: "Total Links", value: linksList.length, icon: "🔗" },
          { label: "Total Assignments", value: assignmentsList.length, icon: "✅" },
          { label: "Categories", value: categories.length, icon: "📁" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-5 ${
              isDark ? "bg-gray-800/50 border border-gray-700" : "bg-white/80 border border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-lg ${
                  isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"
                }`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}