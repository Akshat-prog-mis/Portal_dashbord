// pages/api/links/user-assigned.js
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getUserAssignedLinks } from '../../../lib/data-access'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // For admin users, they can see all links (redirect to main API)
    if (session.user.role === 'admin') {
      return res.redirect('/api/links?grouped=true')
    }

    // For regular users, only show assigned links
    const assignedLinks = await getUserAssignedLinks(session.user.id)
    res.status(200).json(assignedLinks)
  } catch (error) {
    console.error('Error fetching user assigned links:', error)
    res.status(500).json({ error: 'Failed to fetch assigned links' })
  }
}