"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

export function ServicePricingForm() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Set up your service packages and pricing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
            </TabsList>
            {["basic", "standard", "premium"].map((pkg, index) => (
              <TabsContent key={pkg} value={pkg} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${pkg}-title`}>Package Title</Label>
                    <Input
                      id={`${pkg}-title`}
                      placeholder={`e.g., ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Package`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${pkg}-price`}>Price ($)</Label>
                    <Input id={`${pkg}-price`} type="number" placeholder="e.g., 99" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${pkg}-description`}>Description</Label>
                  <Textarea
                    id={`${pkg}-description`}
                    placeholder="Describe what's included in this package..."
                    className="min-h-20"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${pkg}-delivery-time`}>Delivery Time</Label>
                    <Select>
                      <SelectTrigger id={`${pkg}-delivery-time`}>
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
                    <Label htmlFor={`${pkg}-revisions`}>Number of Revisions</Label>
                    <Select>
                      <SelectTrigger id={`${pkg}-revisions`}>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Features</Label>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      Add Feature
                    </Button>
                  </div>
                  {[1, 2, 3].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Input placeholder={`Feature ${feature} (e.g., "5 pages")`} className="flex-1" />
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {pkg === "standard" && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="recommended" />
                    <Label htmlFor="recommended">Mark as recommended package</Label>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save & Continue</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
