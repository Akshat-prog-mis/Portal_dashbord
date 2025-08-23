export default function handler(req, res) {
  const envKeys = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
  ];

  const results = {};

  envKeys.forEach((key) => {
    const value = process.env[key];
    results[key] = value
      ? (key.startsWith("NEXT_PUBLIC_") ? value : "✅ Loaded (hidden)") 
      : "❌ MISSING";
  });

  res.status(200).json({
    success: true,
    message: "Environment variables check complete",
    results
  });
}
