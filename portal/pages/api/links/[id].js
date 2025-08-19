// pages/api/links/[id].js
// ====================
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { updateLink, deleteLink } from '../../../lib/data-access'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method === 'PUT') {
    try {
      const link = await updateLink(id, req.body)
      res.status(200).json(link)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update link' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteLink(id)
      res.status(200).json({ message: 'Link deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete link' })
    }
  }
}