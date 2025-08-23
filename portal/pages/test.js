export default function Test() {
  return (
    <div>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <br></br>
      <p>{process.env.SUPABASE_SERVICE_ROLE_KEY}</p>
    </div>
  )
}