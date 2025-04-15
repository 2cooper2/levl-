import { createServerClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function WaitlistDemoAdmin() {
  const supabase = createServerClient()

  const { data: entries, error } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false })

  if (error) {
    return <div className="p-8">Error loading waitlist data: {error.message}</div>
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Waitlist Submissions</h1>

      {entries.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <p>No submissions yet. Try adding yourself to the waitlist!</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b">
                  <td className="px-4 py-3">{entry.name}</td>
                  <td className="px-4 py-3">{entry.email}</td>
                  <td className="px-4 py-3">{entry.message || "-"}</td>
                  <td className="px-4 py-3">{new Date(entry.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <a href="/waitlist-demo" className="text-blue-500 hover:underline">
          ← Back to demo
        </a>
      </div>
    </div>
  )
}
