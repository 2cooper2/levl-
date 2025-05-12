import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodType<T>,
  options: {
    parseMethod?: "json" | "formData" | "text" | "url"
  } = {},
): Promise<{ success: true; data: T } | { success: false; error: string; status: number; response: NextResponse }> {
  try {
    let data: any

    // Parse the request body based on the specified method
    switch (options.parseMethod || "json") {
      case "json":
        data = await request.json()
        break
      case "formData":
        data = Object.fromEntries(await request.formData())
        break
      case "text":
        data = await request.text()
        break
      case "url":
        const url = new URL(request.url)
        data = Object.fromEntries(url.searchParams)
        break
      default:
        data = await request.json()
    }

    // Validate the data using Zod
    const validatedData = schema.parse(data)

    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod validation errors
      const formatted = error.format()

      return {
        success: false,
        error: "Validation failed",
        status: 400,
        response: NextResponse.json(
          {
            error: "Validation failed",
            details: formatted,
          },
          { status: 400 },
        ),
      }
    }

    // Handle other errors
    return {
      success: false,
      error: "Failed to process request",
      status: 500,
      response: NextResponse.json({ error: "Failed to process request" }, { status: 500 }),
    }
  }
}
