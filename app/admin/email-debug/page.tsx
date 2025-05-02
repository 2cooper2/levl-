"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EmailDebugPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        const response = await fetch("/api/email-debug")
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        setDebugInfo(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch email debug information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDebugInfo()
  }, [])

  const handleSendTestEmail = async () => {
    setIsSending(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/send-test-email")
      const data = await response.json()
      setTestResult(data)
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Failed to send test email",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Email Configuration Debug</h1>

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resend Configuration</CardTitle>
            <CardDescription>Check if Resend email service is properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo?.resend ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Status:</span>
                  {debugInfo.resend.configured ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> Not Configured
                    </span>
                  )}
                </div>

                {debugInfo.resend.error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    <p className="font-semibold">Error:</p>
                    <p>{debugInfo.resend.error}</p>
                  </div>
                )}

                {debugInfo.resend.configured && (
                  <div>
                    <p className="font-semibold">Domains: {debugInfo.resend.domains}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>No Resend configuration data available</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendTestEmail} disabled={isSending || !debugInfo?.resend?.configured}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                "Send Test Email"
              )}
            </Button>
          </CardFooter>
        </Card>

        {testResult && (
          <Card className={testResult.success ? "border-green-300" : "border-red-300"}>
            <CardHeader>
              <CardTitle className={testResult.success ? "text-green-600" : "text-red-600"}>
                Test Email Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResult.success ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <p>Test email sent successfully! Check the admin email inbox.</p>
                </div>
              ) : (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-semibold">Failed to send test email:</p>
                  <p>{testResult.error}</p>
                </div>
              )}

              {testResult.details && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Response Details:</p>
                  <pre className="text-xs overflow-auto mt-2 p-2 bg-gray-100 rounded">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if required environment variables are set</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo?.environment &&
                Object.entries(debugInfo.environment).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-mono">{key}</span>
                    <span className={`${value === "Not set" ? "text-red-600" : "text-green-600"}`}>{value}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
