'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function AdminLinks() {
  const { data: links, error } = useSWR('/api/links', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: '',
    description: ''
  })

  const predefinedCategories = [
    'Official', 'Internal', 'Support', 'Resources', 
    'Tools', 'Social', 'Development', 'Finance'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const method = editingLink ? 'PUT' : 'POST'
      const url = editingLink ? `/api/links/${editingLink.id}` : '/api/links'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        mutate('/api/links')
        mutate('/api/links?grouped=true')
        setShowForm(false)
        setEditingLink(null)
        setFormData({ title: '', url: '', category: '', description: '' })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to save link'}`)
      }
    } catch (error) {
      console.error('Error saving link:', error)
      alert('Error saving link')
    }
  }

  const handleEdit = (link) => {
    setEditingLink(link)
    setFormData({
      title: link.title,
      url: link.url,
      category: link.category,
      description: link.description
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        const response = await fetch(`/api/links/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          mutate('/api/links')
          mutate('/api/links?grouped=true')
        } else {
          alert('Error deleting link')
        }
      } catch (error) {
        console.error('Error deleting link:', error)
        alert('Error deleting link')
      }
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingLink(null)
    setFormData({ title: '', url: '', category: '', description: '' })
  }

  if (error) return <div className="text-center py-12 text-red-600">Failed to load links</div>
  if (!links) return <div className="text-center py-12 text-gray-600">Loading...</div>

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Links</h2>
          <p className="text-gray-600 mt-2">Add, edit, and organize your company links</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Link
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {editingLink ? 'Edit Link' : 'Add New Link'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter link title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {predefinedCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Brief description of this link..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 font-medium"
              >
                {editingLink ? 'Update Link' : 'Create Link'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {link.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {link.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {link.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 text-sm break-all"
                    >
                      {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(link)}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:text-red-900 font-medium text-sm hover:underline"
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
      
      {links.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mt-4">No links found</h3>
          <p className="text-gray-600 mt-2">Get started by adding your first link.</p>
        </div>
      )}
    </div>
  )
}
