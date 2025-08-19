import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const linksFilePath = path.join(process.cwd(), 'data', 'links.json')
const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

// Utility functions for file operations
function readJsonFile(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return []
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error)
    return false
  }
}

// Links CRUD operations
export async function getLinks() {
  return readJsonFile(linksFilePath)
}

export async function getLinksByCategory() {
  const links = readJsonFile(linksFilePath)
  const categories = {}
  
  links.forEach(link => {
    if (!categories[link.category]) {
      categories[link.category] = []
    }
    categories[link.category].push(link)
  })
  
  return categories
}

export async function createLink(linkData) {
  const links = readJsonFile(linksFilePath)
  const newLink = {
    id: uuidv4(),
    ...linkData,
    created_at: new Date().toISOString()
  }
  
  links.push(newLink)
  
  if (writeJsonFile(linksFilePath, links)) {
    return newLink
  } else {
    throw new Error('Failed to save link')
  }
}

export async function updateLink(id, linkData) {
  const links = readJsonFile(linksFilePath)
  const linkIndex = links.findIndex(link => link.id === id)
  
  if (linkIndex === -1) {
    throw new Error('Link not found')
  }
  
  links[linkIndex] = { ...links[linkIndex], ...linkData }
  
  if (writeJsonFile(linksFilePath, links)) {
    return links[linkIndex]
  } else {
    throw new Error('Failed to update link')
  }
}

export async function deleteLink(id) {
  const links = readJsonFile(linksFilePath)
  const filteredLinks = links.filter(link => link.id !== id)
  
  if (writeJsonFile(linksFilePath, filteredLinks)) {
    return true
  } else {
    throw new Error('Failed to delete link')
  }
}

// Users CRUD operations
export async function getUsers() {
  const users = readJsonFile(usersFilePath)
  return users.map(user => ({
    id: user.id,
    username: user.username,
    role: user.role,
    created_at: user.created_at
  }))
}

export async function getUserByUsername(username) {
  const users = readJsonFile(usersFilePath)
  return users.find(user => user.username === username)
}

export async function createUser(userData) {
  const users = readJsonFile(usersFilePath)
  const hashedPassword = await bcrypt.hash(userData.password, 12)
  
  const newUser = {
    id: uuidv4(),
    username: userData.username,
    password: hashedPassword,
    role: userData.role || 'user',
    created_at: new Date().toISOString()
  }
  
  users.push(newUser)
  
  if (writeJsonFile(usersFilePath, users)) {
    return {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      created_at: newUser.created_at
    }
  } else {
    throw new Error('Failed to create user')
  }
}

export async function deleteUser(id) {
  const users = readJsonFile(usersFilePath)
  const filteredUsers = users.filter(user => user.id !== id)
  
  if (writeJsonFile(usersFilePath, filteredUsers)) {
    return true
  } else {
    throw new Error('Failed to delete user')
  }
}