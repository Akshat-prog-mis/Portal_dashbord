// pages/api/users/[id].js
// ====================
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { deleteUser } from '../../../lib/data-access'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method === 'DELETE') {
    try {
      await deleteUser(id)
      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' })
    }
  }
}