"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  LineChart,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  ArrowRight,
  Download,
  Filter,
  CheckCircle,
  Lightbulb,
} from "lucide-react"

export function MarketplaceAnalytics() {
  const [timeRange, setTimeRange] = useState("month")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-md p-6 rounded-xl border border-lavender-200/50 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-3">
            <BarChart className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Provider Analytics</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white rounded-md border border-lavender-100 p-1 flex">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs rounded-sm ${timeRange === "week" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setTimeRange("week")}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs rounded-sm ${timeRange === "month" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setTimeRange("month")}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs rounded-sm ${timeRange === "quarter" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setTimeRange("quarter")}
            >
              Quarter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs rounded-sm ${timeRange === "year" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setTimeRange("year")}
            >
              Year
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-lavender-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Earnings</div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">$2,450</span>
            <span className="text-sm text-gray-500">this month</span>
          </div>
          <div className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+15% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-lavender-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Completed Jobs</div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">18</span>
            <span className="text-sm text-gray-500">jobs</span>
          </div>
          <div className="text-xs text-blue-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+4 from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-lavender-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Client Satisfaction</div>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">4.9</span>
            <span className="text-sm text-gray-500">/ 5.0</span>
          </div>
          <div className="text-xs text-yellow-600 flex items-center mt-1">
            <Star className="h-3 w-3 mr-1 fill-yellow-500" />
            <span>15 new reviews</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-lavender-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Earnings Trend</h4>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Filter className="h-3 w-3" />
                  Filter
                </Button>
              </div>

              <div className="h-60 flex items-end gap-1 mb-4">
                {[1200, 1450, 1800, 1600, 2100, 2450].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-primary/90 to-primary/60 rounded-t"
                      style={{ height: `${(value / 2500) * 100}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-500">Average Monthly</div>
                  <div className="font-medium">$1,766</div>
                </div>
                <div>
                  <div className="text-gray-500">Projected Next Month</div>
                  <div className="font-medium">$2,600</div>
                </div>
                <div>
                  <div className="text-gray-500">YTD Total</div>
                  <div className="font-medium">$10,600</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-lavender-100">
                <h4 className="font-medium mb-4">Service Popularity</h4>

                <div className="space-y-3">
                  {[
                    { name: "TV Mounting", percentage: 45 },
                    { name: "Shelf Installation", percentage: 30 },
                    { name: "Furniture Assembly", percentage: 15 },
                    { name: "Picture Hanging", percentage: 10 },
                  ].map((service, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{service.name}</span>
                        <span>{service.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${service.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-lavender-100">
                <h4 className="font-medium mb-4">Client Demographics</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-lavender-50/50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Repeat Clients</div>
                    <div className="text-xl font-bold">65%</div>
                    <div className="text-xs text-primary mt-1">12 clients</div>
                  </div>

                  <div className="bg-lavender-50/50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">New Clients</div>
                    <div className="text-xl font-bold">35%</div>
                    <div className="text-xs text-primary mt-1">6 clients</div>
                  </div>

                  <div className="bg-lavender-50/50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Avg. Job Value</div>
                    <div className="text-xl font-bold">$136</div>
                    <div className="text-xs text-green-600 mt-1">+$12 from last month</div>
                  </div>

                  <div className="bg-lavender-50/50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Referrals</div>
                    <div className="text-xl font-bold">22%</div>
                    <div className="text-xs text-primary mt-1">4 new clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-lavender-100">
              <h4 className="font-medium mb-4">Earnings Breakdown</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-lavender-50/50 rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">Gross Earnings</div>
                  <div className="text-xl font-bold">$2,720</div>
                  <div className="text-xs text-gray-500 mt-1">Before platform fees</div>
                </div>

                <div className="bg-lavender-50/50 rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">Platform Fees</div>
                  <div className="text-xl font-bold">$270</div>
                  <div className="text-xs text-gray-500 mt-1">10% of gross earnings</div>
                </div>

                <div className="bg-lavender-50/50 rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">Net Earnings</div>
                  <div className="text-xl font-bold">$2,450</div>
                  <div className="text-xs text-gray-500 mt-1">After platform fees</div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-medium">Recent Payments</h5>

                {[
                  { date: "Jun 15, 2023", amount: "$350", status: "Paid", client: "Michael Brown" },
                  { date: "Jun 12, 2023", amount: "$180", status: "Paid", client: "Sarah Johnson" },
                  { date: "Jun 10, 2023", amount: "$420", status: "Paid", client: "David Wilson" },
                  { date: "Jun 5, 2023", amount: "$275", status: "Paid", client: "Emily Davis" },
                ].map((payment, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-white border border-lavender-100 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{payment.client}</div>
                      <div className="text-xs text-gray-500">{payment.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{payment.amount}</div>
                      <div className="text-xs text-green-600">{payment.status}</div>
                    </div>
                  </div>
                ))}

                <div className="text-center mt-4">
                  <Button variant="outline" className="gap-1">
                    View All Transactions <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-lavender-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Client Retention</h4>
                <div className="text-sm text-gray-500">Last 6 months</div>
              </div>

              <div className="h-60 mb-4 bg-lavender-50/50 rounded-lg p-4 flex items-end">
                {/* Placeholder for client retention chart */}
                <div className="w-full h-full flex items-center justify-center">
                  <LineChart className="h-12 w-12 text-primary/30" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-sm text-gray-500">Total Clients</div>
                  <div className="text-xl font-bold">24</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Repeat Rate</div>
                  <div className="text-xl font-bold">72%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. Jobs/Client</div>
                  <div className="text-xl font-bold">2.3</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Churn Rate</div>
                  <div className="text-xl font-bold">8%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-lavender-100">
              <h4 className="font-medium mb-4">Top Clients</h4>

              <div className="space-y-3">
                {[
                  { name: "Michael Brown", jobs: 5, spent: "$1,250", lastJob: "2 days ago" },
                  { name: "Sarah Johnson", jobs: 4, spent: "$980", lastJob: "1 week ago" },
                  { name: "David Wilson", jobs: 3, spent: "$720", lastJob: "2 weeks ago" },
                ].map((client, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-white border border-lavender-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-lavender-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-gray-500">
                          {client.jobs} jobs • {client.spent}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Last job</div>
                      <div className="text-xs text-gray-500">{client.lastJob}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-lavender-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Service Performance</h4>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Filter className="h-3 w-3" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "TV Mounting",
                    jobs: 12,
                    earnings: "$1,560",
                    rating: 4.9,
                    growth: "+15%",
                  },
                  {
                    name: "Shelf Installation",
                    jobs: 8,
                    earnings: "$960",
                    rating: 4.8,
                    growth: "+8%",
                  },
                  {
                    name: "Furniture Assembly",
                    jobs: 5,
                    earnings: "$750",
                    rating: 5.0,
                    growth: "+20%",
                  },
                  {
                    name: "Picture Hanging",
                    jobs: 3,
                    earnings: "$180",
                    rating: 4.7,
                    growth: "-5%",
                  },
                ].map((service, i) => (
                  <div key={i} className="p-4 bg-white border border-lavender-100 rounded-lg">
                    <div className="flex justify-between mb-3">
                      <h5 className="font-medium">{service.name}</h5>
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span>{service.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Jobs</div>
                        <div className="text-lg font-medium">{service.jobs}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Earnings</div>
                        <div className="text-lg font-medium">{service.earnings}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Growth</div>
                        <div
                          className={`text-lg font-medium ${service.growth.startsWith("+") ? "text-green-600" : "text-red-500"}`}
                        >
                          {service.growth}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-lavender-100">
              <h4 className="font-medium mb-4">Service Optimization</h4>

              <div className="space-y-4">
                <div className="p-4 bg-lavender-50/50 rounded-lg border border-lavender-200/50">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Price Optimization</h5>
                      <p className="text-xs text-gray-600 mt-1">
                        Your TV Mounting service is priced 15% below market average. Consider increasing your rate to
                        $150-$175 per job.
                      </p>
                      <Button size="sm" className="mt-2 h-7 text-xs bg-primary">
                        Update Pricing
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-lavender-50/50 rounded-lg border border-lavender-200/50">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Service Expansion</h5>
                      <p className="text-xs text-gray-600 mt-1">
                        Based on your skills and client requests, adding "Home Theater Setup" could increase your
                        monthly earnings by up to 25%.
                      </p>
                      <Button size="sm" className="mt-2 h-7 text-xs bg-primary">
                        Add New Service
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-lavender-50/70 rounded-lg p-4 border border-lavender-200/70">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Growth Opportunity</h4>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              Your business is growing 15% faster than similar providers. Upgrade to Pro to unlock advanced analytics
              and AI-powered growth recommendations.
            </p>
            <Button className="bg-gradient-to-r from-primary to-purple-600">Upgrade to Pro</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
