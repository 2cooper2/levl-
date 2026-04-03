"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

export function ServiceGalleryUpload() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle>Service Gallery</CardTitle>
          <CardDescription>Upload images and videos showcasing your service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-12 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 5MB)</p>
                <Input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" />
                <Button variant="outline" className="mt-4">
                  Select File
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gallery Images (up to 5)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2].map((item) => (
                <div key={item} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={`/placeholder.svg?height=200&width=200&text=Image+${item}`}
                    alt={`Gallery image ${item}`}
                    className="h-full w-full object-cover"
                  />
                  <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {[...Array(3)].map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Add Image</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL (optional)</Label>
            <Input id="video-url" placeholder="e.g., https://youtube.com/watch?v=..." />
            <p className="text-xs text-muted-foreground">Add a YouTube or Vimeo URL to showcase your work in action.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save & Continue</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
