"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ServicePricingForm } from "@/components/services/service-pricing-form"
import { ServiceGalleryUpload } from "@/components/services/service-gallery-upload"
import { ServiceRequirementsForm } from "@/components/services/service-requirements-form"
import { ArrowLeft, Check, Info, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function NewServicePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // Redirect to dashboard or service page
    }, 2000)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Service"
        text="List your service on the marketplace."
        actions={
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Button>
        }
      />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Service Overview</CardTitle>
                <CardDescription>Provide the basic information about your service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input id="title" placeholder="e.g., Professional Website Development" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-development">Web Development</SelectItem>
                        <SelectItem value="graphic-design">Graphic Design</SelectItem>
                        <SelectItem value="writing">Writing & Translation</SelectItem>
                        <SelectItem value="marketing">Digital Marketing</SelectItem>
                        <SelectItem value="video">Video & Animation</SelectItem>
                        <SelectItem value="music">Music & Audio</SelectItem>
                        <SelectItem value="programming">Programming & Tech</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your service in detail..." className="min-h-32" />
                  <p className="text-xs text-muted-foreground">
                    Minimum 100 characters. Be specific about what you offer, your process, and what clients can expect.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input placeholder="Add tags separated by commas (e.g., web design, responsive, e-commerce)" />
                  <p className="text-xs text-muted-foreground">Add up to 5 tags to help clients find your service.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-time">Delivery Time</Label>
                    <Select>
                      <SelectTrigger id="delivery-time">
                        <SelectValue placeholder="Select delivery time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revisions">Number of Revisions</Label>
                    <Select>
                      <SelectTrigger id="revisions">
                        <SelectValue placeholder="Select number of revisions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 revision</SelectItem>
                        <SelectItem value="2">2 revisions</SelectItem>
                        <SelectItem value="3">3 revisions</SelectItem>
                        <SelectItem value="unlimited">Unlimited revisions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>All fields are required</span>
                </div>
                <Button>Save & Continue</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="pricing" className="space-y-4">
          <ServicePricingForm />
        </TabsContent>
        <TabsContent value="gallery" className="space-y-4">
          <ServiceGalleryUpload />
        </TabsContent>
        <TabsContent value="requirements" className="space-y-4">
          <ServiceRequirementsForm />
        </TabsContent>
      </Tabs>
      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline">Save as Draft</Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-1 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Publish Service
            </>
          )}
        </Button>
      </div>
    </DashboardShell>
  )
}
