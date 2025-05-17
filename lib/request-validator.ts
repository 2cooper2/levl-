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
    try {
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
    } catch (parseError) {
      console.error("Error parsing request:", parseError)
      return {
        success: false,
        error: "Failed to parse request data",
        status: 400,
        response: NextResponse.json(
          {
            error: "Failed to parse request data",
            details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          },
          { status: 400 },
        ),
      }
    }

    // Validate the data using Zod
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        // Format Zod validation errors
        const formatted = validationError.format()

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

      throw validationError // Re-throw if it's not a ZodError
    }
  } catch (error) {
    console.error("Unexpected error during request validation:", error)

    // Handle other errors
    return {
      success: false,
      error: "Failed to process request",
      status: 500,
      response: NextResponse.json(
        {
          error: "Failed to process request",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      ),
    }
  }
}
