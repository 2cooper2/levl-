import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json({ message: "Add Service API endpoint" })
}
