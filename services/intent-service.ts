import type { UserIntent } from "@/types/matchmaker"

/**
 * Enhanced intent detection with context awareness
 */
export async function detectEnhancedIntent(
  input: string,
  conversationHistory: string[] = [],
  userModelData: any = {},
): Promise<UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> }> {
  try {
    // We'll use the main detectIntent function as the base
    const basicIntent = await detectIntent(input, conversationHistory)

    // Enhance with additional NLP capabilities
    const enhancedIntent = {
      ...basicIntent,
      subIntents: [] as string[],
      contextualFactors: new Map<string, any>(),
    }

    const inputLower = input.toLowerCase()

    // Detect multiple intents in a single message
    if (inputLower.includes("but") || inputLower.includes("also") || inputLower.includes("and")) {
      // Message might contain multiple intents
      const segments = input.split(/\s+(?:but|also|and)\s+/i)

      if (segments.length > 1) {
        // Process each segment after the first one
        for (let i = 1; i < segments.length; i++) {
          const segment = segments[i]
          const segmentIntent = await detectIntent(segment, [])

          if (segmentIntent.type !== "general" && segmentIntent.confidence > 0.6) {
            enhancedIntent.subIntents.push(segmentIntent.type)

            // Merge entities
            segmentIntent.entities.forEach((entity) => {
              if (!enhancedIntent.entities.includes(entity)) {
                enhancedIntent.entities.push(entity)
              }
            })
          }
        }
      }
    }

    // Consider conversation context
    if (conversationHistory.length > 1) {
      const recentMessages = conversationHistory.slice(-3)

      // Check for follow-up questions
      if (
        inputLower.includes("what about") ||
        inputLower.includes("how about") ||
        inputLower.startsWith("and") ||
        inputLower.length < 15
      ) {
        enhancedIntent.contextualFactors.set("isFollowUp", true)
      }
    }

    // Add budget sensitivity detection
    if (
      inputLower.includes("expensive") ||
      inputLower.includes("cost") ||
      inputLower.includes("price") ||
      inputLower.includes("cheap") ||
      inputLower.includes("affordable")
    ) {
      enhancedIntent.contextualFactors.set("implicitBudgetConcern", true)
    }

    // Add quality importance detection
    if (
      inputLower.includes("quality") ||
      inputLower.includes("best") ||
      inputLower.includes("good") ||
      inputLower.includes("top") ||
      inputLower.includes("excellent")
    ) {
      enhancedIntent.contextualFactors.set("implicitQualityConcern", true)
    }

    // Add urgency detection
    if (
      inputLower.includes("urgent") ||
      inputLower.includes("quickly") ||
      inputLower.includes("asap") ||
      inputLower.includes("soon") ||
      inputLower.includes("fast")
    ) {
      enhancedIntent.contextualFactors.set("implicitUrgencyConcern", true)
    }

    return enhancedIntent
  } catch (error) {
    console.error("Error in enhanced intent detection:", error)

    // Fallback to basic intent
    return {
      type: "general",
      confidence: 0.5,
      entities: [],
      subIntents: [],
      contextualFactors: new Map(),
    }
  }
}

// Wrap the existing detectIntent from nlp-service
export async function detectIntent(input: string, conversationHistory: string[] = []): Promise<UserIntent> {
  // Forward to the existing detectIntent function
  return await import("./nlp-service").then((module) => module.detectIntent(input, conversationHistory))
}

// Wrap the existing analyzeSentiment from nlp-service
export async function analyzeSentiment(
  input: string,
): Promise<{ type: "positive" | "negative" | "neutral"; confidence: number }> {
  // Forward to the existing analyzeSentiment function
  return await import("./nlp-service").then((module) => module.analyzeSentiment(input))
}

/**
 * Detects specific service types from user input
 */
export function detectServiceType(input: string): string | null {
  const inputLower = input.toLowerCase()

  // TV mounting detection
  if (
    inputLower.includes("tv") &&
    (inputLower.includes("mount") || inputLower.includes("wall") || inputLower.includes("install"))
  ) {
    return "tvMounting"
  }

  // Plumbing detection
  if (
    inputLower.includes("plumb") ||
    inputLower.includes("pipe") ||
    inputLower.includes("leak") ||
    inputLower.includes("sink") ||
    inputLower.includes("toilet") ||
    inputLower.includes("water heater")
  ) {
    return "plumbing"
  }

  // Painting detection
  if (
    inputLower.includes("paint") ||
    (inputLower.includes("wall") && (inputLower.includes("color") || inputLower.includes("finish"))) ||
    (inputLower.includes("interior") && inputLower.includes("decorat"))
  ) {
    return "painting"
  }

  // Furniture assembly detection
  if (
    (inputLower.includes("furniture") && (inputLower.includes("assemble") || inputLower.includes("assembly"))) ||
    inputLower.includes("ikea") ||
    (inputLower.includes("put together") &&
      (inputLower.includes("table") ||
        inputLower.includes("chair") ||
        inputLower.includes("desk") ||
        inputLower.includes("shelf") ||
        inputLower.includes("cabinet")))
  ) {
    return "furniture"
  }

  // Web development detection
  if (
    inputLower.includes("website") ||
    (inputLower.includes("web") && (inputLower.includes("develop") || inputLower.includes("design"))) ||
    (inputLower.includes("app") && inputLower.includes("develop")) ||
    inputLower.includes("coding") ||
    inputLower.includes("programmer")
  ) {
    return "webDevelopment"
  }

  // Photography detection
  if (
    inputLower.includes("photo") ||
    inputLower.includes("portrait") ||
    inputLower.includes("camera") ||
    (inputLower.includes("picture") && (inputLower.includes("professional") || inputLower.includes("session")))
  ) {
    return "photography"
  }

  return null
}
