"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Monitor, MessageSquare, Calendar, Users, Clock } from "lucide-react"

export function CollaborationHub() {
  const [activeSession, setActiveSession] = useState(false)

  return (
    <div className="bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-md p-6 rounded-xl border border-lavender-200/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-3">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Collaboration Hub</h3>
        </div>

        {activeSession && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Live Session</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live Now</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">Advanced Mounting Techniques</h4>
                  <p className="text-sm text-gray-500">With Sarah Johnson, Master Installer</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Tomorrow, 2:00 PM</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>60 minutes</span>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Add to Calendar
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">Project Review: Kitchen Shelving</h4>
                  <p className="text-sm text-gray-500">With Michael Chen, Design Expert</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Friday, 11:00 AM</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>45 minutes</span>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Add to Calendar
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="live">
          {activeSession ? (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-16 w-16 text-white/30" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                    >
                      <Video className="h-4 w-4 mr-1" /> Cam
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" /> Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                    >
                      <Monitor className="h-4 w-4 mr-1" /> Share
                    </Button>
                  </div>
                  <Button size="sm" variant="destructive">
                    End Session
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-lavender-100">
                <h4 className="font-medium mb-2">Current Session: TV Mounting Masterclass</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Learn professional techniques for mounting TVs on different wall types.
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-lavender-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">12 participants</p>
                    <p className="text-xs text-gray-500">Session started 24 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-lavender-100 mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2">No Live Sessions Right Now</h4>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Check the upcoming tab for scheduled sessions or start your own session.
              </p>
              <Button className="bg-gradient-to-r from-primary to-purple-600" onClick={() => setActiveSession(true)}>
                Start New Session
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recordings">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all">
              <div className="flex gap-4">
                <div className="w-32 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Stud Finding Masterclass</h4>
                  <p className="text-sm text-gray-500 mb-2">Recorded on May 15, 2023</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>45:22</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Watch Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all">
              <div className="flex gap-4">
                <div className="w-32 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Drywall Anchor Installation</h4>
                  <p className="text-sm text-gray-500 mb-2">Recorded on April 28, 2023</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>32:15</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Watch Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
