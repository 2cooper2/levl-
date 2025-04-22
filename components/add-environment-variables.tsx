"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AddEnvironmentVariables() {
  const [apiKey, setApiKey] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would save the API key to a secure location
    console.log("API Key submitted:", apiKey)
    alert("API Key submitted! (Check console for value)")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Add Environment Variables</h3>
      <p className="text-sm text-muted-foreground">Add your API key to enable email functionality.</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            type="text"
            id="apiKey"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}
