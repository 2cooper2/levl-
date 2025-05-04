export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: error.statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }

  // For unknown errors
  return new Response(
    JSON.stringify({
      error: "An unexpected error occurred",
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}
