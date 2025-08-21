// app/admin/page.js - UPDATED ADMIN DASHBOARD
'use client'

import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function AdminDashboard() {
  const { data: links, error: linksError } = useSWR('/api/links', fetcher)
  const { data: users, error: usersError } = useSWR('/api/users', fetcher)
  const { data: assignments, error: assignmentsError } = useSWR('/api/assignments', fetcher)

  // Handle errors
  if (linksError || usersError || assignmentsError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Failed to load dashboard data
        </div>
        <p className="text-gray-600">
          {linksError && 'Could not load links. '}
          {usersError && 'Could not load users. '}
          {assignmentsError && 'Could not load assignments.'}
        </p>
      </div>
    )
  }

  // Show loading state
  if (!links || !users || !assignments) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    )
  }

  const linksByCategory = Array.isArray(links) ? links.reduce((acc, link) => {
    acc[link.category] = (acc[link.category] || 0) + 1
    return acc
  }, {}) : {}

  // Filter regular users (non-admin) with safety check
  const regularUsers = Array.isArray(users) ? users.filter(user => user.role === 'user') : []
  
  // Calculate assignment stats with proper error handling
  const totalAssignments = assignments && Array.isArray(assignments) ? assignments.length : 0
  const usersWithAssignments = assignments && Array.isArray(assignments) ? 
    [...new Set(assignments.map(a => a.userId))].length : 0
  const linksWithAssignments = assignments && Array.isArray(assignments) ?
    [...new Set(assignments.map(a => a.linkId))].length : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your link management system with individual assignments</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{links?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold text-gray-900">{regularUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(linksByCategory).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Users with assignments</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">{usersWithAssignments}</span>
                <span className="text-xs text-gray-500">/ {regularUsers.length}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Links assigned to users</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">{linksWithAssignments}</span>
                <span className="text-xs text-gray-500">/ {links?.length || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average assignments per user</span>
              <span className="text-sm font-semibold text-gray-900">
                {regularUsers.length > 0 ? (totalAssignments / regularUsers.length).toFixed(1) : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Links by Category</h3>
          <div className="space-y-2">
            {Object.entries(linksByCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{category}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(linksByCategory).length === 0 && (
              <p className="text-gray-500 italic text-sm">No links created yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/admin/links"
          className="block bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Manage Links</h4>
              <p className="text-blue-100 text-sm">Create, edit, and organize links</p>
            </div>
            <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="block bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Manage Users</h4>
              <p className="text-green-100 text-sm">Add and remove users</p>
            </div>
            <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
        </Link>

        <Link
          href="/admin/assignments"
          className="block bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Link Assignments</h4>
              <p className="text-purple-100 text-sm">Assign links to users</p>
            </div>
            <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Link>

        <Link
          href="/"
          className="block bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">View Dashboard</h4>
              <p className="text-gray-100 text-sm">See user perspective</p>
            </div>
            <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Recent Activity / System Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {regularUsers.length > 0 ? Math.round((usersWithAssignments / regularUsers.length) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">Users with Access</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {links && links.length > 0 ? Math.round((linksWithAssignments / links.length) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">Links in Use</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Object.keys(linksByCategory).length}
            </div>
            <p className="text-sm text-gray-600">Active Categories</p>
          </div>
        </div>
        
        {totalAssignments === 0 && regularUsers.length > 0 && links && links.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Ready to assign links!
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You have {regularUsers.length} users and {links.length} links ready. 
                  Start assigning links to users to give them access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}