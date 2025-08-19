import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getLinks, getLinksByCategory, createLink } from '../../../lib/data-access'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { grouped } = req.query
      
      if (grouped === 'true') {
        const categorizedLinks = await getLinksByCategory()
        res.status(200).json(categorizedLinks)
      } else {
        const links = await getLinks()
        res.status(200).json(links)
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch links' })
    }
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const link = await createLink(req.body)
      res.status(201).json(link)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create link' })
    }
  }
}