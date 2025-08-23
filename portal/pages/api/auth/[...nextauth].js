// pages/api/auth/[...nextauth].js - SUPABASE VERSION
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByUsername } from '../../../lib/data-access'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await getUserByUsername(credentials.username)
          if (!user) return null

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) return null

          return {
            id: user.id,
            username: user.username,
            role: user.role,
            remember: credentials.remember === 'true'
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],

  // These must stay static
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // hard cap of 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60 // hard cap of 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
        token.remember = user.remember

        // Set custom expiry timestamp manually
        token.exp = Math.floor(Date.now() / 1000) + (
          user.remember
            ? 30 * 24 * 60 * 60 // 30 days
            : 24 * 60 * 60      // 1 day
        )
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.username = token.username
      session.user.remember = token.remember
      session.expires = new Date(token.exp * 1000).toISOString() // reflect custom expiry

      return session
    }
  },

  pages: {
    signIn: '/login'
  },

  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.username)
    },
    async signOut({ token }) {
      console.log('User signed out:', token?.username)
    }
  }
}

export default NextAuth(authOptions)
