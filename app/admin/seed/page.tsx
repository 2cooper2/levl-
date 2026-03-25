"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { seedUsers } from "@/app/actions/seed-users"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { redirect } from "next/navigation"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Only allow admins to access this page
  if (user?.role !== "admin") {
    redirect("/")
  }

  const handleSeedUsers = async () => {
    setLoading(true)
    try {
      const result = await seedUsers()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding users:", error)
      toast({
        title: "Error",
        description: "Failed to seed users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>Create test users for development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">This will create the following test users:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Client:</strong> client@example.com / password123
            </li>
            <li>
              <strong>Provider:</strong> provider@example.com / password123
            </li>
            <li>
              <strong>Admin:</strong> admin@example.com / password123
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeedUsers} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding Users...
              </>
            ) : (
              "Seed Test Users"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
