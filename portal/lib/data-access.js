// lib/data-access.js - ROBUST SUPABASE VERSION
import bcrypt from 'bcryptjs'
import { supabaseAdmin, testSupabaseConnection } from './supabase'

// // Test connection on startup
// testSupabaseConnection()

// Users CRUD operations
export async function getUsers() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching users:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

export async function getUserByUsername(username) {
  try {
    console.log('Fetching user by username:', username)
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

    if (error) {
      console.error('Supabase error fetching user by username:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('User found:', data ? 'YES' : 'NO')
    return data
  } catch (error) {
    console.error('Error fetching user by username:', error)
    throw error
  }
}

export async function getUserById(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, role, created_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Supabase error fetching user by ID:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw new Error('Failed to fetch user')
  }
}

export async function createUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await getUserByUsername(userData.username)
    if (existingUser) {
      throw new Error('Username already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    // Ensure role is either 'admin' or 'user'
    const role = userData.role === 'admin' ? 'admin' : 'user'
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        username: userData.username,
        password_hash: hashedPassword,
        role: role
      }])
      .select('id, username, role, created_at')
      .single()

    if (error) {
      console.error('Supabase error creating user:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function deleteUser(id) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error deleting user:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

// Links CRUD operations
export async function getLinks() {
  try {
    const { data, error } = await supabaseAdmin
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching links:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching links:', error)
    throw new Error('Failed to fetch links')
  }
}

export async function getLinksByCategory() {
  try {
    const links = await getLinks()
    const categories = {}
    
    links.forEach(link => {
      if (!categories[link.category]) {
        categories[link.category] = []
      }
      categories[link.category].push(link)
    })
    
    return categories
  } catch (error) {
    console.error('Error getting links by category:', error)
    throw error
  }
}

export async function getUserAssignedLinks(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_link_assignments')
      .select(`
        *,
        links (*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error fetching user assigned links:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Group by category
    const categories = {}
    data.forEach(assignment => {
      const link = assignment.links
      if (link) {
        if (!categories[link.category]) {
          categories[link.category] = []
        }
        categories[link.category].push(link)
      }
    })
    
    return categories
  } catch (error) {
    console.error('Error fetching user assigned links:', error)
    throw new Error('Failed to fetch assigned links')
  }
}

export async function createLink(linkData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('links')
      .insert([linkData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating link:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error creating link:', error)
    throw error
  }
}

export async function updateLink(id, linkData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('links')
      .update(linkData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating link:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error updating link:', error)
    throw error
  }
}

export async function deleteLink(id) {
  try {
    const { error } = await supabaseAdmin
      .from('links')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error deleting link:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error deleting link:', error)
    throw error
  }
}

// User-Link Assignment Operations
export async function assignLinkToUser(userId, linkId) {
  try {
    // Check if assignment already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('user_link_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('link_id', linkId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing assignment:', checkError)
      throw new Error(`Database error: ${checkError.message}`)
    }

    if (existing) {
      throw new Error('Link already assigned to user')
    }

    const { data, error } = await supabaseAdmin
      .from('user_link_assignments')
      .insert([{
        user_id: userId,
        link_id: linkId
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error assigning link:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error assigning link to user:', error)
    throw error
  }
}

export async function unassignLinkFromUser(userId, linkId) {
  try {
    const { error } = await supabaseAdmin
      .from('user_link_assignments')
      .delete()
      .eq('user_id', userId)
      .eq('link_id', linkId)

    if (error) {
      console.error('Supabase error unassigning link:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error unassigning link from user:', error)
    throw error
  }
}

export async function getUserAssignments(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_link_assignments')
      .select(`
        *,
        links (*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error fetching user assignments:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user assignments:', error)
    throw error
  }
}

export async function getLinkAssignments(linkId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_link_assignments')
      .select(`
        *,
        users (id, username, role)
      `)
      .eq('link_id', linkId)

    if (error) {
      console.error('Supabase error fetching link assignments:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching link assignments:', error)
    throw error
  }
}

export async function getAllAssignments() {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_link_assignments')
      .select(`
        *,
        users (id, username, role),
        links (*)
      `)
      .order('assigned_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching all assignments:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching all assignments:', error)
    throw error
  }
}