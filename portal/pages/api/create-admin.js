// pages/api/create-admin.js - ONE-TIME SETUP API
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", "admin")
      .maybeSingle();

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: "Admin user already exists",
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          username: "admin",
          password_hash: hashedPassword,
          role: "admin",
        },
      ])
      .select("id, username, role, created_at")
      .single();

    if (error) {
      console.error("Error creating admin:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create admin user",
        details: error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin user created successfully!",
      user: data,
      loginCredentials: {
        username: "admin",
        password: "admin123",
        note: "Please change this password after first login!",
      },
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
