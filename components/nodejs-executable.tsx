"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"

interface NodeJSExecutableProps {
  code: string
  title?: string
}

export function NodeJSExecutable({ code, title = "Node.js Executable" }: NodeJSExecutableProps) {
  const [output, setOutput] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCode = async () => {
    setIsRunning(true)
    setOutput("")
    setError(null)

    try {
      // This is a simulation - in a real app you'd have a backend endpoint
      // that executes the code safely in a sandbox
      const response = await fetch("/api/execute-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute code")
      }

      setOutput(data.output)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">{code}</pre>

        {output && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Output:</h4>
            <pre className="bg-black text-green-500 p-4 rounded-md overflow-auto text-xs whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-1">Error:</h4>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runCode} disabled={isRunning} className="gap-2">
          <Play className="h-4 w-4" />
          {isRunning ? "Running..." : "Run Code"}
        </Button>
      </CardFooter>
    </Card>
  )
}
