"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Edit, Eye, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

export function ServicesList() {
  const services = [
    {
      id: 1,
      title: "Professional Website Development",
      price: "From $499",
      category: "Web Development",
      status: "active",
      views: 245,
      orders: 12,
      image: "/placeholder.svg?height=300&width=400&text=Web+Development",
    },
    {
      id: 2,
      title: "Custom Logo Design & Branding",
      price: "From $199",
      category: "Graphic Design",
      status: "active",
      views: 189,
      orders: 8,
      image: "/placeholder.svg?height=300&width=400&text=Logo+Design",
    },
    {
      id: 3,
      title: "SEO Content Writing & Copywriting",
      price: "From $99",
      category: "Writing",
      status: "paused",
      views: 120,
      orders: 5,
      image: "/placeholder.svg?height=300&width=400&text=Content+Writing",
    },
    {
      id: 4,
      title: "Social Media Management & Strategy",
      price: "From $299/mo",
      category: "Marketing",
      status: "active",
      views: 210,
      orders: 9,
      image: "/placeholder.svg?height=300&width=400&text=Social+Media",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden h-full flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={service.image || "/placeholder.svg"}
                alt={service.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={service.status === "active" ? "default" : "secondary"} className="font-medium">
                  {service.status === "active" ? "Active" : "Paused"}
                </Badge>
              </div>
            </div>
            <CardContent className="flex-1 pt-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{service.category}</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <Switch checked={service.status === "active"} />
                </div>
              </div>
              <h3 className="font-semibold line-clamp-2 mb-2">{service.title}</h3>
              <p className="text-sm font-medium text-primary">{service.price}</p>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{service.views} views</span>
                <span>{service.orders} orders</span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" className="gap-1">
                <Eye className="h-4 w-4" /> Preview
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
