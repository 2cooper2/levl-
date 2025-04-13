import { createServerClient } from "@/lib/supabase"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export default async function WaitlistAdmin() {
  const supabase = createServerClient()

  const { data: waitlistEntries, error } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching waitlist entries:", error)
    return <div>Error loading waitlist data</div>
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Waitlist Entries</h1>

      <div className="bg-card rounded-lg shadow p-6">
        <Table>
          <TableCaption>A list of people who have joined the waitlist.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waitlistEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No entries yet
                </TableCell>
              </TableRow>
            ) : (
              waitlistEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.message || "-"}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
