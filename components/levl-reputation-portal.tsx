"use client"

import { useState, useCallback } from "react"
import {
  Upload,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  TrendingUp,
  Shield,
  Copy,
  Download,
  HelpCircle,
  RefreshCw,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

// Types
type Platform = "TaskRabbit" | "Thumbtack" | "Handy" | "Other"
type ImportMethod = "api" | "file" | "screenshots"
type VerificationStatus = "draft" | "pending" | "verified" | "rejected"

interface LevLReputation {
  platform: Platform
  jobsCompleted: number
  reviewCount: number
  avgRating: number // 0-5
  tenureYears: number
  completionRatePct?: number
  onTimeRatePct?: number
  categories: string[]
  cities: string[]
  dateRange?: { from: string; to: string }
  insights: { tags: string[]; sentiment: number } // 0-100
  proof: { files: string[]; links: string[]; notes?: string }
  verification: {
    status: VerificationStatus
    timeline: { at: string; action: string; note?: string }[]
  }
}

// Mock data and functions
const mockPlatformData: Record<Platform, Partial<LevLReputation>> = {
  TaskRabbit: {
    jobsCompleted: 347,
    reviewCount: 298,
    avgRating: 4.8,
    tenureYears: 3.2,
    completionRatePct: 98,
    onTimeRatePct: 94,
    categories: ["TV Mounting", "Furniture Assembly", "Smart Home"],
    cities: ["Brooklyn", "Manhattan", "Queens"],
    insights: { tags: ["reliable", "on-time", "professional", "friendly"], sentiment: 92 },
  },
  Thumbtack: {
    jobsCompleted: 156,
    reviewCount: 142,
    avgRating: 4.9,
    tenureYears: 1.8,
    completionRatePct: 96,
    onTimeRatePct: 91,
    categories: ["Plumbing", "Electrical", "Handyman"],
    cities: ["Brooklyn", "Staten Island"],
    insights: { tags: ["skilled", "communicative", "clean", "efficient"], sentiment: 89 },
  },
  Handy: {
    jobsCompleted: 89,
    reviewCount: 76,
    avgRating: 4.7,
    tenureYears: 2.1,
    completionRatePct: 94,
    onTimeRatePct: 88,
    categories: ["Painting", "Carpentry", "General Repair"],
    cities: ["Manhattan", "Bronx"],
    insights: { tags: ["detail-oriented", "fast", "courteous", "knowledgeable"], sentiment: 85 },
  },
  Other: {
    jobsCompleted: 0,
    reviewCount: 0,
    avgRating: 0,
    tenureYears: 0,
    categories: [],
    cities: [],
    insights: { tags: [], sentiment: 0 },
  },
}

const mockParseFile = (file: File): Partial<LevLReputation> => {
  const platforms: Platform[] = ["TaskRabbit", "Thumbtack", "Handy"]
  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)]
  return mockPlatformData[randomPlatform]
}

const mockExtractInsights = (input: string) => {
  const allTags = [
    "reliable",
    "on-time",
    "professional",
    "friendly",
    "skilled",
    "communicative",
    "clean",
    "efficient",
    "detail-oriented",
    "fast",
    "courteous",
    "knowledgeable",
  ]
  const tags = allTags.slice(0, Math.floor(Math.random() * 4) + 3)
  const sentiment = Math.floor(Math.random() * 20) + 80
  return { tags, sentiment }
}

const levlFields = [
  "Jobs Completed",
  "Review Count",
  "Avg Rating (0-5)",
  "Tenure (years)",
  "Completion Rate (%)",
  "On-time Rate (%)",
  "Categories",
  "Service Cities",
  "Date Range Covered",
]

export default function Component() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("TaskRabbit")
  const [importMethod, setImportMethod] = useState<ImportMethod>("api")
  const [consentGiven, setConsentGiven] = useState(false)
  const [apiUrl, setApiUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [reputationData, setReputationData] = useState<Partial<LevLReputation>>({
    platform: "TaskRabbit",
    verification: {
      status: "draft",
      timeline: [
        { at: "2024-01-15 10:30", action: "Import initiated", note: "User started reputation import process" },
        { at: "2024-01-15 10:45", action: "Data parsed", note: "Successfully parsed platform data" },
      ],
    },
    proof: { files: [], links: [], notes: "" },
  })
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [dataQualityIssues, setDataQualityIssues] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [verificationMethod, setVerificationMethod] = useState<"automated" | "manual">("automated")

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform)
    setReputationData((prev) => ({ ...prev, platform }))
  }

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    setUploadedFiles(fileArray)

    // Mock parsing
    if (fileArray.length > 0) {
      const parsed = mockParseFile(fileArray[0])
      setReputationData((prev) => ({ ...prev, ...parsed }))
      toast({ title: "File parsed successfully", description: `Imported data from ${fileArray[0].name}` })
    }
  }, [])

  const handleScreenshotUpload = useCallback((files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    setScreenshots(fileArray)
    toast({ title: "Screenshots uploaded", description: `${fileArray.length} screenshots ready for processing` })
  }, [])

  const testApiConnection = () => {
    if (!apiUrl || !apiKey) {
      toast({
        title: "Missing credentials",
        description: "Please provide both API URL and key",
        variant: "destructive",
      })
      return
    }

    // Mock API test
    setTimeout(() => {
      const success = Math.random() > 0.3
      if (success) {
        const mockData = mockPlatformData[selectedPlatform]
        setReputationData((prev) => ({ ...prev, ...mockData }))
        toast({ title: "Connection successful", description: "Data imported from API" })
      } else {
        toast({
          title: "Connection failed",
          description: "Invalid credentials or API unavailable",
          variant: "destructive",
        })
      }
    }, 1000)
  }

  const autoMapFields = () => {
    const mapping: Record<string, string> = {
      "Jobs Completed": "jobs_completed",
      "Review Count": "total_reviews",
      "Avg Rating (0-5)": "average_rating",
      "Tenure (years)": "years_active",
      "Completion Rate (%)": "completion_rate",
      "On-time Rate (%)": "on_time_rate",
      Categories: "service_categories",
      "Service Cities": "service_areas",
      "Date Range Covered": "date_range",
    }
    setFieldMapping(mapping)
    toast({ title: "Fields auto-mapped", description: "Review and adjust mappings as needed" })
  }

  const validateData = () => {
    const issues: string[] = []
    if (reputationData.avgRating && reputationData.avgRating > 5) {
      issues.push("Average rating exceeds 5.0")
    }
    if (reputationData.completionRatePct && reputationData.completionRatePct > 100) {
      issues.push("Completion rate exceeds 100%")
    }
    if (!reputationData.tenureYears || reputationData.tenureYears <= 0) {
      issues.push("Missing or invalid tenure")
    }
    setDataQualityIssues(issues)
    return issues.length === 0
  }

  const generateInsights = () => {
    const insights = mockExtractInsights("sample review text")
    setReputationData((prev) => ({ ...prev, insights }))
    setSelectedTags(insights.tags)
    toast({ title: "Insights generated", description: "Structured insights extracted from reviews" })
  }

  const submitForVerification = () => {
    const newTimeline = [
      ...(reputationData.verification?.timeline || []),
      {
        at: new Date().toISOString(),
        action: "Submitted for verification",
        note: `${verificationMethod} verification requested`,
      },
    ]

    setReputationData((prev) => ({
      ...prev,
      verification: { status: "pending", timeline: newTimeline },
    }))

    // Mock verification process
    setTimeout(() => {
      const finalTimeline = [
        ...newTimeline,
        { at: new Date().toISOString(), action: "Verification completed", note: "Legacy Verified badge issued" },
      ]

      setReputationData((prev) => ({
        ...prev,
        verification: { status: "verified", timeline: finalTimeline },
      }))

      toast({ title: "Verification complete!", description: "Your Legacy Verified badge has been issued" })
      setCurrentStep(5)
    }, 3000)

    toast({ title: "Submitted for verification", description: "Your submission is being reviewed" })
  }

  const canContinueStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          consentGiven &&
          ((importMethod === "api" && apiUrl && apiKey) ||
            (importMethod === "file" && uploadedFiles.length > 0) ||
            (importMethod === "screenshots" && screenshots.length > 0))
        )
      case 2:
        return Object.keys(fieldMapping).length > 0 && dataQualityIssues.length === 0
      case 3:
        return selectedTags.length > 0
      case 4:
        return reputationData.verification?.status === "pending"
      default:
        return true
    }
  }

  const ProfilePassport = () => (
    <div className="lg:sticky lg:top-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Passport (Preview)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">John Doe</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {reputationData.categories?.slice(0, 3).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin className="h-3 w-3" />
                {reputationData.cities?.slice(0, 2).join(", ")}
              </div>
            </div>
          </div>

          {/* Legacy Verified Badge */}
          {reputationData.verification?.status === "verified" && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Legacy Verified</span>
              </div>
              <p className="text-sm text-green-700">
                Verified professional with {reputationData.jobsCompleted} completed jobs from {reputationData.platform}
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{reputationData.jobsCompleted || 0}</div>
              <div className="text-xs text-gray-600">Jobs Completed</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{reputationData.reviewCount || 0}</div>
              <div className="text-xs text-gray-600">Reviews</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {reputationData.avgRating?.toFixed(1) || "0.0"}
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{reputationData.tenureYears?.toFixed(1) || "0.0"}y</div>
              <div className="text-xs text-gray-600">Tenure</div>
            </div>
            {reputationData.completionRatePct && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{reputationData.completionRatePct}%</div>
                <div className="text-xs text-gray-600">Completion</div>
              </div>
            )}
            {reputationData.onTimeRatePct && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{reputationData.onTimeRatePct}%</div>
                <div className="text-xs text-gray-600">On-Time</div>
              </div>
            )}
          </div>

          {/* Structured Insights */}
          {selectedTags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Professional Insights</h4>
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              {reputationData.insights?.sentiment && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Client Sentiment</span>
                    <span>{reputationData.insights.sentiment}%</span>
                  </div>
                  <Progress value={reputationData.insights.sentiment} className="h-2" />
                </div>
              )}
            </div>
          )}

          {/* Verification Seal */}
          {reputationData.verification?.status === "verified" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  View Verification Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verification Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <strong>Platform:</strong> {reputationData.platform}
                  </div>
                  <div>
                    <strong>Verified:</strong> {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Facts verified. No copyrighted review text imported. Data aggregated from publicly available metrics
                    only.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Share Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => toast({ title: "Link copied!", description: "Profile link copied to clipboard" })}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => toast({ title: "PNG downloaded!", description: "Profile passport saved as image" })}
            >
              <Download className="h-4 w-4 mr-2" />
              PNG
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">LevL Portal — Reputation Import</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How Reputation Import Works</DialogTitle>
                <DialogDescription>
                  LevL imports verifiable facts and metrics from your existing gig platform profiles, not raw review
                  text. We capture job counts, ratings, completion rates, and derive structured insights while
                  respecting privacy and copyright. After verification, you'll receive a Legacy Verified badge
                  showcasing your professional history.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Import & Verification Flow */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Source & Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                    1
                  </div>
                  Source & Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Platform</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(["TaskRabbit", "Thumbtack", "Handy", "Other"] as Platform[]).map((platform) => (
                      <Button
                        key={platform}
                        variant={selectedPlatform === platform ? "default" : "outline"}
                        onClick={() => handlePlatformSelect(platform)}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                          {platform.slice(0, 2)}
                        </div>
                        <span className="text-xs">{platform}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Import Methods */}
                <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as ImportMethod)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="api">API / Key</TabsTrigger>
                    <TabsTrigger value="file">File Upload</TabsTrigger>
                    <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                  </TabsList>

                  <TabsContent value="api" className="space-y-4">
                    <div className="space-y-3">
                      <Input placeholder="API Base URL" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
                      <Input
                        type="password"
                        placeholder="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <Button onClick={testApiConnection} disabled={!apiUrl || !apiKey}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-4">Upload CSV, JSON, or PDF export from your platform</p>
                      <input
                        type="file"
                        multiple
                        accept=".csv,.json,.pdf"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button asChild>
                          <span>Choose Files</span>
                        </Button>
                      </label>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm flex-1">{file.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast({ title: "Parsing...", description: "Processing file data" })}
                            >
                              Parse
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="screenshots" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Camera className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">Upload screenshots of your dashboard</p>
                      <p className="text-xs text-gray-500 mb-4">
                        Include: profile overview, job history, ratings summary
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleScreenshotUpload(e.target.files)}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label htmlFor="screenshot-upload">
                        <Button asChild>
                          <span>Upload Screenshots</span>
                        </Button>
                      </label>
                    </div>
                    {screenshots.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {screenshots.map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(file) || "/placeholder.svg"}
                              alt={`Screenshot ${idx + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Privacy & Consent */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="consent"
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  />
                  <label htmlFor="consent" className="text-sm text-blue-900">
                    I confirm I own this data and consent to LevL processing it to compute aggregates. Raw review text
                    will not be stored.
                  </label>
                </div>

                <Button onClick={() => setCurrentStep(2)} disabled={!canContinueStep(1)} className="w-full">
                  Continue to Mapping
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Mapping & Parsing */}
            {currentStep >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                      2
                    </div>
                    Mapping & Parsing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2 mb-4">
                    <Button onClick={autoMapFields} variant="outline">
                      Auto-map
                    </Button>
                    <Button onClick={validateData} variant="outline">
                      Preview parsed rows
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>LevL Field</TableHead>
                          <TableHead>Source Column</TableHead>
                          <TableHead>Sample Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {levlFields.map((field) => (
                          <TableRow key={field}>
                            <TableCell className="font-medium">{field}</TableCell>
                            <TableCell>
                              <Select
                                value={fieldMapping[field] || ""}
                                onValueChange={(value) => setFieldMapping((prev) => ({ ...prev, [field]: value }))}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select column" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="jobs_completed">jobs_completed</SelectItem>
                                  <SelectItem value="total_reviews">total_reviews</SelectItem>
                                  <SelectItem value="average_rating">average_rating</SelectItem>
                                  <SelectItem value="years_active">years_active</SelectItem>
                                  <SelectItem value="completion_rate">completion_rate</SelectItem>
                                  <SelectItem value="on_time_rate">on_time_rate</SelectItem>
                                  <SelectItem value="service_categories">service_categories</SelectItem>
                                  <SelectItem value="service_areas">service_areas</SelectItem>
                                  <SelectItem value="date_range">date_range</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {field === "Jobs Completed" && reputationData.jobsCompleted}
                              {field === "Review Count" && reputationData.reviewCount}
                              {field === "Avg Rating (0-5)" && reputationData.avgRating}
                              {field === "Tenure (years)" && reputationData.tenureYears}
                              {field === "Completion Rate (%)" && reputationData.completionRatePct}
                              {field === "On-time Rate (%)" && reputationData.onTimeRatePct}
                              {field === "Categories" && reputationData.categories?.join(", ")}
                              {field === "Service Cities" && reputationData.cities?.join(", ")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Data Quality Issues */}
                  {dataQualityIssues.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">Data Quality Issues:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {dataQualityIssues.map((issue, idx) => (
                            <li key={idx} className="text-sm">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={() => setCurrentStep(3)} disabled={!canContinueStep(2)} className="w-full">
                    Continue to Insights
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Structured Insights */}
            {currentStep >= 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                      3
                    </div>
                    Structured Insights
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Structured Insights</DialogTitle>
                          <DialogDescription>
                            LevL derives insights only; raw text is not stored or displayed. We analyze review patterns
                            to extract professional keywords and sentiment scores while respecting privacy.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button onClick={generateInsights} variant="outline" className="w-full bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Insights from Reviews
                  </Button>

                  {reputationData.insights && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Professional Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {reputationData.insights.tags.map((tag) => (
                            <div key={tag} className="flex items-center gap-2">
                              <Checkbox
                                id={tag}
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTags((prev) => [...prev, tag])
                                  } else {
                                    setSelectedTags((prev) => prev.filter((t) => t !== tag))
                                  }
                                }}
                              />
                              <label htmlFor={tag} className="text-sm">
                                {tag}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Client Sentiment Score</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Overall Sentiment</span>
                            <span>{reputationData.insights.sentiment}%</span>
                          </div>
                          <Progress value={reputationData.insights.sentiment} className="h-3" />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Category Performance</h4>
                        <div className="space-y-2">
                          {reputationData.categories?.map((category) => (
                            <div key={category} className="flex justify-between items-center text-sm">
                              <span>{category}</span>
                              <div className="flex items-center gap-2">
                                <span>{(Math.random() * 50 + 30).toFixed(0)} jobs</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{(Math.random() * 0.5 + 4.5).toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={() => setCurrentStep(4)} disabled={!canContinueStep(3)} className="w-full">
                    Continue to Verification
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Verification Submission */}
            {currentStep >= 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                      4
                    </div>
                    Verification Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Verification Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant={verificationMethod === "automated" ? "default" : "outline"}
                        onClick={() => setVerificationMethod("automated")}
                        className="h-auto p-4 flex flex-col items-start gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Automated Checks</span>
                        </div>
                        <span className="text-xs text-left">For API imports with verifiable data</span>
                      </Button>
                      <Button
                        variant={verificationMethod === "manual" ? "default" : "outline"}
                        onClick={() => setVerificationMethod("manual")}
                        className="h-auto p-4 flex flex-col items-start gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          <span className="font-medium">Manual Review</span>
                        </div>
                        <span className="text-xs text-left">For file uploads and screenshots</span>
                      </Button>
                    </div>
                  </div>

                  {verificationMethod === "automated" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">API connection verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Data format validated</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Platform identity confirmed</span>
                      </div>
                    </div>
                  )}

                  {verificationMethod === "manual" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Additional Proof (Optional)</label>
                        <div className="space-y-2">
                          <Input placeholder="Link to public profile" />
                          <Textarea placeholder="Notes for reviewer" rows={3} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audit Trail */}
                  <div>
                    <h4 className="font-medium mb-3">Audit Trail</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {reputationData.verification?.timeline.map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <span className="font-medium">{entry.action}</span>
                              <span className="text-gray-500 text-xs">{entry.at}</span>
                            </div>
                            {entry.note && <div className="text-gray-600 mt-1">{entry.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={submitForVerification}
                    disabled={reputationData.verification?.status === "pending"}
                    className="w-full"
                  >
                    {reputationData.verification?.status === "pending" ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verification in Progress
                      </>
                    ) : (
                      "Submit for Verification"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Outcome */}
            {currentStep >= 5 && reputationData.verification?.status === "verified" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center">
                      ✓
                    </div>
                    Verification Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium text-green-800 mb-1">Legacy Verified Badge Issued!</div>
                      <div className="text-green-700">
                        Your professional reputation has been verified and published to your LevL Profile Passport.
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Public Share Link</label>
                      <div className="flex gap-2">
                        <Input value="https://levl.com/profile/john-doe-verified" readOnly className="flex-1" />
                        <Button
                          onClick={() =>
                            toast({ title: "Link copied!", description: "Share link copied to clipboard" })
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Embed Code</label>
                      <Textarea
                        value={`<script src="https://levl.com/embed.js" data-profile="john-doe-verified"></script>`}
                        readOnly
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Live Preview */}
          <div className="lg:col-span-1">
            <ProfilePassport />
          </div>
        </div>
      </div>
    </div>
  )
}
