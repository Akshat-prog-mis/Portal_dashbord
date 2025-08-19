// pages/api/users/index.js
// ====================
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getUsers, createUser } from '../../../lib/data-access'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const users = await getUsers()
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await createUser(req.body)
      res.status(201).json(user)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
}