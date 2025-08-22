// pages/api/assignments/[userId]/[linkId].js
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { unassignLinkFromUser } from '../../../../lib/data-access'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { userId, linkId } = req.query

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' })
  }

  if (req.method === 'DELETE') {
    if (!userId || !linkId) {
      return res.status(400).json({ error: 'userId and linkId are required' })
    }

    try {
      await unassignLinkFromUser(userId, linkId)
      res.status(200).json({ message: 'Assignment removed successfully' })
    } catch (error) {
      console.error('Error removing assignment:', error)
      res.status(500).json({ error: 'Failed to unassign link from user' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}