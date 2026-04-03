import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // This is a simple endpoint that doesn't actually need to return anything
    // It's just to warm up the server and database connections
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in prefetch-user-data:", error)
    return NextResponse.json({ success: false })
  }
}
