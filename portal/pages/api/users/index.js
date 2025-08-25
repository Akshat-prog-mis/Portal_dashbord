// pages/api/users/index.js - FIXED VERSION
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUsers, createUser, getUserByUsername } from "../../../lib/data-access";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Debug logging
  console.log("Session:", session);
  console.log("User role:", session?.user?.role);
  console.log("Request method:", req.method);

  if (!session || session.user.role !== "admin") {
    console.log("Unauthorized access attempt");
    return res.status(403).json({ error: "Unauthorized - Admin access required" });
  }

  if (req.method === "GET") {
    try {
      const users = await getUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "POST") {
    try {
      const { username, password, role } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Check if user already exists
      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = await createUser({ username, password, role });
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message || "Failed to create user" });
    }
  } else if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
  }
}
