"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

const PREDEFINED_CATEGORIES = [
  "Google Sheets",
  "Looker Studio", 
  "Forms",
  "Miscellaneous",
  "Dashboard"
];

const INITIAL_FORM_DATA = {
  title: "",
  url: "",
  category: ""
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-12 bg-gray-300 rounded w-36"></div>
      </div>
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <div className="divide-y divide-gray-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error boundary component
const ErrorState = ({ onRetry }) => (
  <div className="px-4 py-6 sm:px-0">
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load links</h3>
      <p className="mt-1 text-sm text-gray-500">There was an error loading your links. Please try again.</p>
      <div className="mt-6">
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ onAddNew }) => (
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
    <h3 className="text-xl font-medium text-gray-900 mt-4">No links found</h3>
    <p className="text-gray-600 mt-2 mb-6">Get started by adding your first link.</p>
    <button
      onClick={onAddNew}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Your First Link
    </button>
  </div>
);

// Form validation function
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.title.trim()) {
    errors.title = "Title is required";
  }
  
  if (!formData.url.trim()) {
    errors.url = "URL is required";
  } else {
    try {
      new URL(formData.url);
    } catch {
      errors.url = "Please enter a valid URL";
    }
  }
  
  if (!formData.category.trim()) {
    errors.category = "Category is required";
  }
  
  return errors;
};

// Form component with proper validation
const LinkForm = ({ editingLink, formData, setFormData, onSubmit, onCancel, isSubmitting }) => {
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit();
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {editingLink ? "Edit Link" : "Add New Link"}
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter link title"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
              }}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.category}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, category: e.target.value }));
                if (errors.category) setErrors(prev => ({ ...prev, category: null }));
              }}
            >
              <option value="">Select a category</option>
              {PREDEFINED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
        </div>
        
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            id="url"
            type="url"
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
              errors.url ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://example.com"
            value={formData.url}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, url: e.target.value }));
              if (errors.url) setErrors(prev => ({ ...prev, url: null }));
            }}
          />
          {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
        </div>
        
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? "Saving..." : (editingLink ? "Update Link" : "Create Link")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Category badge component
const CategoryBadge = ({ category }) => {
  const colorMap = {
    "Google Sheets": "bg-green-100 text-green-800",
    "Looker Studio": "bg-purple-100 text-purple-800", 
    "Forms": "bg-yellow-100 text-yellow-800",
    "Miscellaneous": "bg-gray-100 text-gray-800",
    "Dashboard": "bg-blue-100 text-blue-800",
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorMap[category] || "bg-blue-100 text-blue-800"}`}>
      {category}
    </span>
  );
};

// Main component
export default function AdminLinks() {
  const { data: links, error, mutate: mutateLinks } = useSWR("/api/links", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Filtered links based on search and category
  const filteredLinks = useMemo(() => {
    if (!links) return [];
    
    return links.filter(link => {
      const matchesFilter = !filter || 
        link.title.toLowerCase().includes(filter.toLowerCase()) ||
        link.url.toLowerCase().includes(filter.toLowerCase());
      
      const matchesCategory = !selectedCategory || link.category === selectedCategory;
      
      return matchesFilter && matchesCategory;
    });
  }, [links, filter, selectedCategory]);

  // Get unique categories from existing links
  const availableCategories = useMemo(() => {
    if (!links) return PREDEFINED_CATEGORIES;
    const existingCategories = [...new Set(links.map(link => link.category))];
    return [...new Set([...PREDEFINED_CATEGORIES, ...existingCategories])];
  }, [links]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);

    try {
      const method = editingLink ? "PUT" : "POST";
      const url = editingLink ? `/api/links/${editingLink.id}` : "/api/links";

      const payload = {
      ...formData,
      description: " akshat"
      };


      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Promise.all([
          mutate("/api/links"),
          mutate("/api/links?grouped=true")
        ]);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Error: ${errorData.error || "Failed to save link"}`);
      }
    } catch (error) {
      console.error("Error saving link:", error);
      alert("Error saving link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingLink, formData, isSubmitting]); // Added isSubmitting to deps

  const handleEdit = useCallback((link) => {
    setEditingLink(link);
    setFormData({
      title: link.title || "",
      url: link.url || "",
      category: link.category || "",
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const response = await fetch(`/api/links/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await Promise.all([
            mutate("/api/links"),
            mutate("/api/links?grouped=true")
          ]);
        } else {
          alert("Error deleting link");
        }
      } catch (error) {
        console.error("Error deleting link:", error);
        alert("Error deleting link. Please try again.");
      }
    }
  }, []);

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditingLink(null);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const handleRetry = useCallback(() => {
    mutateLinks();
  }, [mutateLinks]);

  const handleAddNew = useCallback(() => {
    setShowForm(true);
  }, []);

  // Loading state
  if (!links && !error) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Links</h2>
          <p className="text-gray-600 mt-2">
            Add, edit, and organize your company links ({links?.length || 0} total)
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 font-medium flex items-center whitespace-nowrap"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Link
        </button>
      </div>

      {/* Search and Filter Controls */}
      {links && links.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search links</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search"
                  type="text"
                  placeholder="Search links by title, or URL..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="category-filter" className="sr-only">Filter by category</label>
              <select
                id="category-filter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(filter || selectedCategory) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {filteredLinks.length} of {links.length} links
              </span>
              <button
                onClick={() => {
                  setFilter("");
                  setSelectedCategory("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <LinkForm
          editingLink={editingLink}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isSubmitting={isSubmitting}
        />
      )}

      {filteredLinks.length > 0 ? (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Link Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{link.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={link.category} />
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 text-sm break-all hover:underline flex items-center"
                        title={link.url}
                      >
                        {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                        <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(link)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm hover:underline transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(link.id, link.title)}
                          className="text-red-600 hover:text-red-900 font-medium text-sm hover:underline transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : links && links.length === 0 ? (
        <EmptyState onAddNew={handleAddNew} />
      ) : (
        <div className="bg-white shadow-xl rounded-2xl p-12 border border-gray-200">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No links match your search</h3>
            <p className="text-gray-600 mt-2">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => {
                setFilter("");
                setSelectedCategory("");
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}