"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getStorageUrl } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function SettingsPage() {
  const { user, setUser } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const supabase = createClient()

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!user) {
        throw new Error("User not found")
      }

      // Update user profile in the database
      const { data, error } = await supabase
        .from("users")
        .update({
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Failed to update profile:", error)
        toast({
          title: "Failed to update profile",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      console.log("Profile updated in database:", data)

      // Update user state with the returned data
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (err) {
      console.error("Profile update error:", err)
      toast({
        title: "Update error",
        description: "There was an error updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const uploadAvatar = useCallback(async () => {
    if (!selectedImage || !user) return

    setUploadingAvatar(true)
    try {
      const fileExt = selectedImage.name.split(".").pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage.from("avatars").upload(filePath, selectedImage, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Error uploading avatar:", error)
        toast({
          title: "Error",
          description: "Failed to upload avatar",
          variant: "destructive",
        })
        return
      }

      const publicUrl = getStorageUrl(data.path)

      const { error: updateError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", user.id)

      if (updateError) {
        console.error("Error updating user profile:", updateError)
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        })
        return
      }

      // Update user context
      const updatedUser = { ...user, avatar: publicUrl }
      setUser(updatedUser)
      localStorage.setItem("levl_user", JSON.stringify(updatedUser))

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      })
    } catch (error) {
      console.error("Error in uploadAvatar:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }, [selectedImage, user, supabase, toast, setUser])

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account settings and preferences." />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={profileData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Write a short bio about yourself"
                      value={profileData.bio}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                      type="url"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                  <CardDescription>Update your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt="Avatar" />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Button variant="outline" onClick={uploadAvatar} disabled={uploadingAvatar || !selectedImage}>
                    {uploadingAvatar ? "Uploading..." : "Upload New Avatar"}
                  </Button>
                  {selectedImage && <p className="text-sm text-muted-foreground">Selected: {selectedImage.name}</p>}
                  {!selectedImage && <p className="text-sm text-muted-foreground">Click on the avatar to change it</p>}
                </CardContent>
              </Card>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profileData.email} readOnly />
              </div>
              {/* Add more account settings here */}
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
