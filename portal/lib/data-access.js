// lib/data-access.js - ENHANCED VERSION
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const linksFilePath = path.join(process.cwd(), 'data', 'links.json')
const usersFilePath = path.join(process.cwd(), 'data', 'users.json')
const assignmentsFilePath = path.join(process.cwd(), 'data', 'user-link-assignments.json')

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

// Get links assigned to specific user
export async function getUserAssignedLinks(userId) {
  const assignments = readJsonFile(assignmentsFilePath)
  const links = readJsonFile(linksFilePath)
  
  const userAssignments = assignments.filter(assignment => assignment.userId === userId)
  const assignedLinkIds = userAssignments.map(assignment => assignment.linkId)
  
  const assignedLinks = links.filter(link => assignedLinkIds.includes(link.id))
  
  // Group by category
  const categories = {}
  assignedLinks.forEach(link => {
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
  const assignments = readJsonFile(assignmentsFilePath)
  
  // Remove link
  const filteredLinks = links.filter(link => link.id !== id)
  
  // Remove all assignments for this link
  const filteredAssignments = assignments.filter(assignment => assignment.linkId !== id)
  
  if (writeJsonFile(linksFilePath, filteredLinks) && writeJsonFile(assignmentsFilePath, filteredAssignments)) {
    return true
  } else {
    throw new Error('Failed to delete link')
  }
}

// Users CRUD operations (simplified to only admin/user)
export async function getUsers() {
  const users = readJsonFile(usersFilePath)
  return users.map(user => ({
    id: user.id,
    username: user.username,
    role: user.role, // Only 'admin' or 'user'
    created_at: user.created_at
  }))
}

export async function getUserByUsername(username) {
  const users = readJsonFile(usersFilePath)
  return users.find(user => user.username === username)
}

export async function createUser(userData) {
  const users = readJsonFile(usersFilePath)

  if (users.some(user=> user.username === userData.username)) {
    throw new Error('Username already exists')}
  
  // Ensure role is either 'admin' or 'user'
  const role = userData.role === 'admin' ? 'admin' : 'user'
  
  const hashedPassword = await bcrypt.hash(userData.password, 12)
  
  const newUser = {
    id: uuidv4(),
    username: userData.username,
    password: hashedPassword,
    role: role,
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
  const assignments = readJsonFile(assignmentsFilePath)
  
  // Remove user
  const filteredUsers = users.filter(user => user.id !== id)
  
  // Remove all assignments for this user
  const filteredAssignments = assignments.filter(assignment => assignment.userId !== id)
  
  if (writeJsonFile(usersFilePath, filteredUsers) && writeJsonFile(assignmentsFilePath, filteredAssignments)) {
    return true
  } else {
    throw new Error('Failed to delete user')
  }
}

// User-Link Assignment Operations
export async function assignLinkToUser(userId, linkId) {
  const assignments = readJsonFile(assignmentsFilePath)
  
  // Check if assignment already exists
  const existingAssignment = assignments.find(
    assignment => assignment.userId === userId && assignment.linkId === linkId
  )
  
  if (existingAssignment) {
    throw new Error('Link already assigned to user')
  }
  
  const newAssignment = {
    id: uuidv4(),
    userId: userId,
    linkId: linkId,
    assigned_at: new Date().toISOString()
  }
  
  assignments.push(newAssignment)
  
  if (writeJsonFile(assignmentsFilePath, assignments)) {
    return newAssignment
  } else {
    throw new Error('Failed to assign link to user')
  }
}

export async function unassignLinkFromUser(userId, linkId) {
  const assignments = readJsonFile(assignmentsFilePath)
  const filteredAssignments = assignments.filter(
    assignment => !(assignment.userId === userId && assignment.linkId === linkId)
  )
  
  if (writeJsonFile(assignmentsFilePath, filteredAssignments)) {
    return true
  } else {
    throw new Error('Failed to unassign link from user')
  }
}

export async function getUserAssignments(userId) {
  const assignments = readJsonFile(assignmentsFilePath)
  const links = readJsonFile(linksFilePath)
  
  const userAssignments = assignments.filter(assignment => assignment.userId === userId)
  
  return userAssignments.map(assignment => {
    const link = links.find(link => link.id === assignment.linkId)
    return {
      ...assignment,
      link: link
    }
  })
}

export async function getLinkAssignments(linkId) {
  const assignments = readJsonFile(assignmentsFilePath)
  const users = readJsonFile(usersFilePath)
  
  const linkAssignments = assignments.filter(assignment => assignment.linkId === linkId)
  
  return linkAssignments.map(assignment => {
    const user = users.find(user => user.id === assignment.userId)
    return {
      ...assignment,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  })
}

export async function getAllAssignments() {
  const assignments = readJsonFile(assignmentsFilePath)
  const users = readJsonFile(usersFilePath)
  const links = readJsonFile(linksFilePath)
  
  return assignments.map(assignment => {
    const user = users.find(user => user.id === assignment.userId)
    const link = links.find(link => link.id === assignment.linkId)
    return {
      ...assignment,
      user: user ? {
        id: user.id,
        username: user.username,
        role: user.role
      } : null,
      link: link || null
    }
  })
}