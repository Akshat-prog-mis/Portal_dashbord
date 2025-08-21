// pages/api/assignments/index.js
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { 
  assignLinkToUser, 
  unassignLinkFromUser, 
  getAllAssignments 
} from '../../../lib/data-access'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' })
  }

  if (req.method === 'GET') {
    try {
      const assignments = await getAllAssignments()
      res.status(200).json(assignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      res.status(500).json({ error: 'Failed to fetch assignments' })
    }
  } else if (req.method === 'POST') {
    const { userId, linkId } = req.body

    if (!userId || !linkId) {
      return res.status(400).json({ error: 'userId and linkId are required' })
    }

    try {
      const assignment = await assignLinkToUser(userId, linkId)
      res.status(201).json(assignment)
    } catch (error) {
      console.error('Error creating assignment:', error)
      res.status(400).json({ error: error.message || 'Failed to assign link to user' })
    }
  } else if (req.method === 'DELETE') {
    const { userId, linkId } = req.body

    if (!userId || !linkId) {
      return res.status(400).json({ error: 'userId and linkId are required' })
    }

    try {
      await unassignLinkFromUser(userId, linkId)
      res.status(200).json({ message: 'Link unassigned successfully' })
    } catch (error) {
      console.error('Error removing assignment:', error)
      res.status(500).json({ error: 'Failed to unassign link from user' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}