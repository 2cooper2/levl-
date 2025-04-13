"use client"

import { useState, useEffect } from "react"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Mock data for demonstration
// In a real app, this would come from your database
const mockWaitlistEntries = [
  { email: "john.doe@example.com", name: "John Doe", date: new Date(2023, 9, 15) },
  { email: "jane.smith@example.com", name: "Jane Smith", date: new Date(2023, 9, 16) },
  { email: "alex.johnson@example.com", name: "Alex Johnson", date: new Date(2023, 9, 17) },
  { email: "sarah.williams@example.com", name: "Sarah Williams", date: new Date(2023, 9, 18) },
  { email: "michael.brown@example.com", name: "Michael Brown", date: new Date(2023, 9, 19) },
  { email: "emily.davis@example.com", name: "Emily Davis", date: new Date(2023, 9, 20) },
  { email: "david.miller@example.com", name: "David Miller", date: new Date(2023, 9, 21) },
  { email: "olivia.wilson@example.com", name: "Olivia Wilson", date: new Date(2023, 9, 22) },
  { email: "james.taylor@example.com", name: "James Taylor", date: new Date(2023, 9, 23) },
  { email: "sophia.anderson@example.com", name: "Sophia Anderson", date: new Date(2023, 9, 24) },
]

export default function WaitlistAdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [entries, setEntries] = useState(mockWaitlistEntries)

  // Filter entries based on search query
  useEffect(() => {
    if (!searchQuery) {
      setEntries(mockWaitlistEntries)
      return
    }

    const filtered = mockWaitlistEntries.filter(
      (entry) =>
        entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.name && entry.name.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setEntries(filtered)
  }, [searchQuery])

  return (
    <div className="min-h-screen flex flex-col">
      <EnhancedMainNav />
      <main className="flex-1 container py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Waitlist Entries</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by email or name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length > 0 ? (
                  entries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entry.email}</TableCell>
                      <TableCell>{entry.name || "—"}</TableCell>
                      <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No entries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="text-xs text-muted-foreground mt-4">
              <p>
                Admin email: <strong>levlplatform@gmail.com</strong> (notifications are sent here)
              </p>
              <p className="mt-1">
                Note: This is a demo page. In a real application, this would be protected by authentication and would
                display actual database entries.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
