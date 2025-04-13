"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

export function ServiceRequirementsForm() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle>Service Requirements</CardTitle>
          <CardDescription>Specify what information you need from clients to deliver your service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Requirements</Label>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add Requirement
              </Button>
            </div>
            {[1, 2, 3].map((req) => (
              <div key={req} className="space-y-2 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`req-${req}-title`}>Requirement {req}</Label>
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input id={`req-${req}-title`} placeholder="e.g., Project details" />
                <Textarea placeholder="Describe what you need from the client..." className="min-h-20" />
                <div className="pt-2">
                  <Label className="text-sm">Requirement Type</Label>
                  <RadioGroup defaultValue="text" className="flex flex-col space-y-1 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id={`req-${req}-text`} />
                      <Label htmlFor={`req-${req}-text`} className="text-sm">
                        Text answer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="attachment" id={`req-${req}-attachment`} />
                      <Label htmlFor={`req-${req}-attachment`} className="text-sm">
                        File attachment
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple-choice" id={`req-${req}-multiple-choice`} />
                      <Label htmlFor={`req-${req}-multiple-choice`} className="text-sm">
                        Multiple choice
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id={`req-${req}-required`} className="rounded border-gray-300" />
                  <Label htmlFor={`req-${req}-required`} className="text-sm">
                    Required
                  </Label>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="additional-info">Additional Information</Label>
            <Textarea
              id="additional-info"
              placeholder="Any other information clients should know before ordering..."
              className="min-h-32"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save & Continue</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
