"use client";

import { useState, useMemo } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

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
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option[valueKey]}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(option)}
                >
                  <div className="font-medium text-gray-900">{option[displayKey]}</div>
                  {option.subtitle && (
                    <div className="text-xs text-gray-500 mt-1">{option.subtitle}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No options found</div>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      <input type="hidden" value={value} required={required} />
    </div>
  );
}

export default function AdminAssignments() {
  const { data: users, error: usersError } = useSWR("/api/users", fetcher);
  const { data: links, error: linksError } = useSWR("/api/links", fetcher);
  const { data: assignments, error: assignmentsError } = useSWR("/api/assignments", fetcher);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLink, setSelectedLink] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("user"); // 'user' or 'link'

  const handleAssignLink = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedLink) {
      alert("Please select both user and link");
      return;
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          linkId: selectedLink,
        }),
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
        const response = await fetch(`/api/assignments/${userId}/${linkId}`, {
          method: "DELETE",
        });

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
    return <div className="text-center py-12 text-red-600">Failed to load data</div>;
  }

  if (!users || !links || !assignments) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  // Safety checks and data processing
  const usersList = Array.isArray(users) ? users : [];
  const linksList = Array.isArray(links) ? links : [];
  const assignmentsList = Array.isArray(assignments) ? assignments : [];

  // Filter out admin users for assignments
  const regularUsers = usersList.filter((user) => user.role !== "admin");

  // Get unique categories from links
  const categories = [...new Set(linksList.map((link) => link.category))].sort();

  // Filter links by selected category
  const filteredLinks = selectedCategory
    ? linksList.filter((link) => link.category === selectedCategory)
    : linksList;

  // Prepare data for searchable dropdowns
  const userOptions = regularUsers.map((user) => ({
    id: user.id,
    name: user.username,
    subtitle: `${user.role} • Created ${new Date(user.created_at).toLocaleDateString()}`,
  }));

  const linkOptions = filteredLinks.map((link) => ({
    id: link.id,
    name: link.title,
    subtitle: `${link.category} • ${link.url.replace(/https?:\/\//, "").substring(0, 30)}...`,
  }));

  // Group assignments by user
  const assignmentsByUser = {};
  assignmentsList.forEach((assignment) => {
    if (!assignmentsByUser[assignment.userId]) {
      const user = usersList.find((u) => u.id === assignment.userId);
      if (user) {
        assignmentsByUser[assignment.userId] = {
          user: user,
          links: [],
        };
      }
    }
    if (assignmentsByUser[assignment.userId]) {
      const link = linksList.find((l) => l.id === assignment.linkId);
      if (link) {
        assignmentsByUser[assignment.userId].links.push(link);
      }
    }
  });

  // Group assignments by link
  const assignmentsByLink = {};
  assignmentsList.forEach((assignment) => {
    if (!assignmentsByLink[assignment.linkId]) {
      const link = linksList.find((l) => l.id === assignment.linkId);
      if (link) {
        assignmentsByLink[assignment.linkId] = {
          link: link,
          users: [],
        };
      }
    }
    if (assignmentsByLink[assignment.linkId]) {
      const user = usersList.find((u) => u.id === assignment.userId);
      if (user) {
        assignmentsByLink[assignment.linkId].users.push(user);
      }
    }
  });

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Link Assignments</h2>
          <p className="text-gray-600 mt-2">
            Assign links to individual users with advanced search
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("user")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            By User
          </button>
          <button
            onClick={() => setViewMode("link")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "link"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            By Link
          </button>
        </div>
      </div>

      {/* Enhanced Assignment Form */}
      <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Assign New Link</h3>
        <form onSubmit={handleAssignLink}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select User *
              </label>
              <SearchableDropdown
                options={userOptions}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Search and select user..."
                displayKey="name"
                valueKey="id"
                searchKey="name"
                required={true}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedLink(""); // Reset selected link when category changes
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

            {/* Link Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Link *
                {selectedCategory && (
                  <span className="text-blue-600 text-xs ml-1">
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
                displayKey="name"
                valueKey="id"
                searchKey="name"
                required={true}
              />
            </div>
          </div>

          {/* Quick Info */}
          {selectedUser && selectedLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                <div className="text-sm text-blue-800">
                  <strong>Ready to assign:</strong>{" "}
                  {linksList.find((l) => l.id === selectedLink)?.title}→{" "}
                  {usersList.find((u) => u.id === selectedUser)?.username}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 font-medium"
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
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Clear Selection
            </button>
          </div>
        </form>
      </div>

      {/* Quick Assignment by Category */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryLinks = linksList.filter((link) => link.category === category);
            const assignedInCategory = assignmentsList.filter((assignment) => {
              const link = linksList.find((l) => l.id === assignment.linkId);
              return link && link.category === category;
            }).length;

            return (
              <div key={category} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{category}</h4>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {categoryLinks.length} links
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {assignedInCategory} assignments made
                </div>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  Filter by {category}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignments Display */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {viewMode === "user" ? (
          <div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Assignments by User</h3>
              <span className="text-sm text-gray-600">
                {Object.keys(assignmentsByUser).length} users with assignments
              </span>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.values(assignmentsByUser).map((userAssignment) => (
                <div key={userAssignment.user.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">
                          {userAssignment.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {userAssignment.user.username}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {userAssignment.links.length} links assigned
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(userAssignment.user.id)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      Assign More
                    </button>
                  </div>

                  {/* Group user's links by category */}
                  {Object.entries(
                    userAssignment.links.reduce((acc, link) => {
                      if (!acc[link.category]) acc[link.category] = [];
                      acc[link.category].push(link);
                      return acc;
                    }, {})
                  ).map(([category, categoryLinks]) => (
                    <div key={category} className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {category} ({categoryLinks.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                        {categoryLinks.map((link) => (
                          <div key={link.id} className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900 text-sm mb-1">
                                  {link.title}
                                </h6>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {link.description}
                                </p>
                              </div>
                              <button
                                onClick={() => handleUnassignLink(userAssignment.user.id, link.id)}
                                className="text-red-600 hover:text-red-800 ml-2 p-1"
                                title="Unassign link"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {userAssignment.links.length === 0 && (
                    <p className="text-gray-500 italic">No links assigned to this user</p>
                  )}
                </div>
              ))}

              {regularUsers
                .filter((user) => !assignmentsByUser[user.id])
                .map((user) => (
                  <div key={user.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{user.username}</h4>
                          <p className="text-sm text-gray-500 italic">No links assigned</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(user.id)}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
                      >
                        Assign Links
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Assignments by Link</h3>
              <span className="text-sm text-gray-600">
                {Object.keys(assignmentsByLink).length} links assigned
              </span>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.values(assignmentsByLink).map((linkAssignment) => (
                <div key={linkAssignment.link.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {linkAssignment.link.title}
                        </h4>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {linkAssignment.link.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>{linkAssignment.users.length} users assigned</span>
                        <a
                          href={linkAssignment.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {linkAssignment.link.url.replace(/https?:\/\//, "").substring(0, 40)}...
                        </a>
                      </div>
                      <p className="text-sm text-gray-600">{linkAssignment.link.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {linkAssignment.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center bg-gray-50 px-3 py-2 rounded-lg border"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white font-bold text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {user.username}
                        </span>
                        <button
                          onClick={() => handleUnassignLink(user.id, linkAssignment.link.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Unassign from user"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {linkAssignment.users.length === 0 && (
                    <p className="text-gray-500 italic">No users assigned to this link</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{regularUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{linksList.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignmentsList.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
