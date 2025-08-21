'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function AdminAssignments() {
  const { data: users, error: usersError } = useSWR('/api/users', fetcher)
  const { data: links, error: linksError } = useSWR('/api/links', fetcher)
  const { data: assignments, error: assignmentsError } = useSWR('/api/assignments', fetcher)
  
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedLink, setSelectedLink] = useState('')
  const [viewMode, setViewMode] = useState('user') // 'user' or 'link'

  // Add async keyword here
  const handleAssignLink = async (e) => {
    e.preventDefault()
    
    if (!selectedUser || !selectedLink) {
      alert('Please select both user and link')
      return
    }

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          linkId: selectedLink
        }),
      })

      if (response.ok) {
        mutate('/api/assignments')
        setSelectedUser('')
        setSelectedLink('')
        alert('Link assigned successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to assign link'}`)
      }
    } catch (error) {
      console.error('Error assigning link:', error)
      alert('Error assigning link')
    }
  }

  // Add async keyword here
  const handleUnassignLink = async (userId, linkId) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      try {
        const response = await fetch(`/api/assignments/${userId}/${linkId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          mutate('/api/assignments')
          alert('Assignment removed successfully!')
        } else {
          alert('Error removing assignment')
        }
      } catch (error) {
        console.error('Error removing assignment:', error)
        alert('Error removing assignment')
      }
    }
  }

  if (usersError || linksError || assignmentsError) {
    return <div className="text-center py-12 text-red-600">Failed to load data</div>
  }

  if (!users || !links || !assignments) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>
  }

  // Safety checks and data processing
  const usersList = Array.isArray(users) ? users : []
  const linksList = Array.isArray(links) ? links : []
  const assignmentsList = Array.isArray(assignments) ? assignments : []

  // Filter out admin users for assignments
  const regularUsers = usersList.filter(user => user.role !== 'admin')

  // Group assignments by user
  const assignmentsByUser = {}
  assignmentsList.forEach(assignment => {
    if (!assignmentsByUser[assignment.userId]) {
      const user = usersList.find(u => u.id === assignment.userId)
      if (user) {
        assignmentsByUser[assignment.userId] = {
          user: user,
          links: []
        }
      }
    }
    if (assignmentsByUser[assignment.userId]) {
      const link = linksList.find(l => l.id === assignment.linkId)
      if (link) {
        assignmentsByUser[assignment.userId].links.push(link)
      }
    }
  })

  // Group assignments by link
  const assignmentsByLink = {}
  assignmentsList.forEach(assignment => {
    if (!assignmentsByLink[assignment.linkId]) {
      const link = linksList.find(l => l.id === assignment.linkId)
      if (link) {
        assignmentsByLink[assignment.linkId] = {
          link: link,
          users: []
        }
      }
    }
    if (assignmentsByLink[assignment.linkId]) {
      const user = usersList.find(u => u.id === assignment.userId)
      if (user) {
        assignmentsByLink[assignment.linkId].users.push(user)
      }
    }
  })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Link Assignments</h2>
          <p className="text-gray-600 mt-2">Assign links to individual users</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('user')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            By User
          </button>
          <button
            onClick={() => setViewMode('link')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'link'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            By Link
          </button>
        </div>
      </div>

      {/* Assignment Form */}
      <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Assign New Link</h3>
        <form onSubmit={handleAssignLink}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select User *
              </label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {regularUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Link *
              </label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedLink}
                onChange={(e) => setSelectedLink(e.target.value)}
              >
                <option value="">Choose a link...</option>
                {linksList.map(link => (
                  <option key={link.id} value={link.id}>{link.title}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            Assign Link
          </button>
        </form>
      </div>

      {/* Assignments Display */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {viewMode === 'user' ? (
          <div>
            <div className="bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Assignments by User</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.values(assignmentsByUser).map(userAssignment => (
                <div key={userAssignment.user.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-sm">
                          {userAssignment.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {userAssignment.user.username}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {userAssignment.links.length} links assigned
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {userAssignment.links.map(link => (
                      <div key={link.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">{link.title}</h5>
                            <p className="text-xs text-gray-600 mb-2">{link.category}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{link.description}</p>
                          </div>
                          <button
                            onClick={() => handleUnassignLink(userAssignment.user.id, link.id)}
                            className="text-red-600 hover:text-red-800 ml-2 p-1"
                            title="Unassign link"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {userAssignment.links.length === 0 && (
                    <p className="text-gray-500 italic">No links assigned to this user</p>
                  )}
                </div>
              ))}
              {regularUsers.filter(user => !assignmentsByUser[user.id]).map(user => (
                <div key={user.id} className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{user.username}</h4>
                      <p className="text-sm text-gray-500 italic">No links assigned</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Assignments by Link</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.values(assignmentsByLink).map(linkAssignment => (
                <div key={linkAssignment.link.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {linkAssignment.link.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {linkAssignment.link.category}
                        </span>
                        <span>{linkAssignment.users.length} users assigned</span>
                      </div>
                      <p className="text-sm text-gray-600">{linkAssignment.link.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {linkAssignment.users.map(user => (
                      <div key={user.id} className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white font-bold text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 mr-2">{user.username}</span>
                        <button
                          onClick={() => handleUnassignLink(user.id, linkAssignment.link.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Unassign from user"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
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
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignmentsList.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}