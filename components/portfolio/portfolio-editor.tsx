"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X, Upload, Trash2, Edit, Save, Award, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  tags: string[]
  date: string
  featured?: boolean
  clientName?: string
  testimonial?: {
    text: string
    name: string
    title: string
  }
  additionalImages?: string[]
}

interface PortfolioEditorProps {
  userId: string
  items: PortfolioItem[]
  categories: string[]
  onUpdate: (items: PortfolioItem[]) => void
}

export function PortfolioEditor({ userId, items, categories, onUpdate }: PortfolioEditorProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(items)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const supabase = createClientComponentClient<Database>()

  const defaultNewItem: PortfolioItem = {
    id: `new-${Date.now()}`,
    title: "",
    description: "",
    image: "",
    category: categories[0] || "Other",
    tags: [],
    date: new Date().toISOString().split("T")[0],
    featured: false,
    additionalImages: [],
  }

  const handleAddItem = () => {
    setEditingItem(defaultNewItem)
    setIsAddingItem(true)
  }

  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem({ ...item })
    setIsAddingItem(false)
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = portfolioItems.filter((item) => item.id !== id)
    setPortfolioItems(updatedItems)
    onUpdate(updatedItems)
  }

  const handleSaveItem = async () => {
    if (!editingItem) return

    let updatedItems: PortfolioItem[]

    if (isAddingItem) {
      updatedItems = [...portfolioItems, editingItem]
    } else {
      updatedItems = portfolioItems.map((item) => (item.id === editingItem.id ? editingItem : item))
    }

    setPortfolioItems(updatedItems)
    onUpdate(updatedItems)
    setEditingItem(null)
    setIsAddingItem(false)
  }

  const handleAddTag = () => {
    if (!editingItem || !newTag.trim()) return

    if (!editingItem.tags.includes(newTag.trim())) {
      setEditingItem({
        ...editingItem,
        tags: [...editingItem.tags, newTag.trim()],
      })
    }

    setNewTag("")
  }

  const handleRemoveTag = (tag: string) => {
    if (!editingItem) return

    setEditingItem({
      ...editingItem,
      tags: editingItem.tags.filter((t) => t !== tag),
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isMainImage = true) => {
    const file = event.target.files?.[0]
    if (!file || !editingItem) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // In a real app, you would upload to Supabase storage
      // const { data, error } = await supabase.storage
      //   .from('portfolio')
      //   .upload(`${userId}/${file.name}`, file)

      // if (error) throw error

      // Simulate a delay for the upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate a successful upload with a placeholder URL
      const imageUrl = `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(file.name)}`

      if (isMainImage) {
        setEditingItem({
          ...editingItem,
          image: imageUrl,
        })
      } else {
        setEditingItem({
          ...editingItem,
          additionalImages: [...(editingItem.additionalImages || []), imageUrl],
        })
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset after a short delay
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      console.error("Error uploading image:", error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveAdditionalImage = (index: number) => {
    if (!editingItem || !editingItem.additionalImages) return

    setEditingItem({
      ...editingItem,
      additionalImages: editingItem.additionalImages.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Portfolio</h2>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      {/* Portfolio Items List */}
      {!editingItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <img src={item.image || "/placeholder.svg"} alt={item.title} className="object-cover w-full h-full" />
                {item.featured && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                <p className="text-sm line-clamp-2 mt-2">{item.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}

          {portfolioItems.length === 0 && (
            <Card className="col-span-full p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No portfolio items yet</h3>
                <p className="text-gray-500 mb-4">Showcase your work by adding projects to your portfolio.</p>
                <Button onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Project
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Edit/Add Form */}
      {editingItem && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>{isAddingItem ? "Add New Project" : "Edit Project"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingItem.category}
                      onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Completion Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientName">Client Name (Optional)</Label>
                    <Input
                      id="clientName"
                      value={editingItem.clientName || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })}
                      placeholder="Enter client name"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={editingItem.featured || false}
                      onCheckedChange={(checked) => setEditingItem({ ...editingItem, featured: checked })}
                    />
                    <Label htmlFor="featured">Featured Project</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="Describe your project"
                      rows={5}
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editingItem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Main Image</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                    {editingItem.image ? (
                      <div className="relative">
                        <img
                          src={editingItem.image || "/placeholder.svg"}
                          alt="Main project image"
                          className="max-h-48 mx-auto object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setEditingItem({ ...editingItem, image: "" })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Drag and drop an image, or{" "}
                          <label className="text-primary cursor-pointer">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              disabled={isUploading}
                            />
                          </label>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Recommended: 1200x800px, max 5MB</p>
                      </div>
                    )}

                    {isUploading && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Additional Images (Optional)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {editingItem.additionalImages?.map((image, index) => (
                      <div key={index} className="relative border rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Additional image ${index + 1}`}
                          className="h-24 w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveAdditionalImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50">
                      <Plus className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Client Testimonial (Optional)</Label>
                  <div className="space-y-3 mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <Label htmlFor="testimonialText" className="text-sm">
                        Testimonial Text
                      </Label>
                      <Textarea
                        id="testimonialText"
                        value={editingItem.testimonial?.text || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            testimonial: {
                              ...(editingItem.testimonial || { name: "", title: "" }),
                              text: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter client testimonial"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="testimonialName" className="text-sm">
                          Client Name
                        </Label>
                        <Input
                          id="testimonialName"
                          value={editingItem.testimonial?.name || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              testimonial: {
                                ...(editingItem.testimonial || { text: "", title: "" }),
                                name: e.target.value,
                              },
                            })
                          }
                          placeholder="Client name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="testimonialTitle" className="text-sm">
                          Client Title/Company
                        </Label>
                        <Input
                          id="testimonialTitle"
                          value={editingItem.testimonial?.title || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              testimonial: {
                                ...(editingItem.testimonial || { text: "", name: "" }),
                                title: e.target.value,
                              },
                            })
                          }
                          placeholder="Client title or company"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null)
                  setIsAddingItem(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveItem} disabled={!editingItem.title || !editingItem.description}>
                <Save className="h-4 w-4 mr-2" />
                {isAddingItem ? "Add Project" : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
