import { createClientDatabaseClient } from "@/lib/supabase-client"
import type { UserIntent } from "@/types/matchmaker"

// Cache for intent detection to reduce API calls
const intentCache = new Map<string, { intent: UserIntent; timestamp: number }>()
const CACHE_EXPIRY = 1000 * 60 * 60 * 24 // 24 hours

/**
 * Detects user intent using the Groq API
 */
export async function detectIntent(input: string, conversationHistory: string[] = []): Promise<UserIntent> {
  // Check cache first
  const cacheKey = `${input}-${conversationHistory.slice(-3).join("|")}`
  const cachedResult = intentCache.get(cacheKey)

  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
    return cachedResult.intent
  }

  try {
    // Prepare the prompt for the LLM
    const prompt = `
      You are an advanced NLP system analyzing user messages in a service marketplace context.

      ANALYSIS FRAMEWORK:
      1. Primary Intent (booking, comparison, information, save, general, refinement, feedback)
      2. Confidence Score (0.0 to 1.0) - Be realistic, not overconfident
      3. Entities (service types, qualities, requirements, constraints)
      4. Sub-intents (secondary goals within the message)
      5. Contextual Factors (emotional state, urgency, budget sensitivity, quality focus)
      6. Implicit Needs (unstated but implied requirements)

      PREVIOUS CONVERSATION:
      ${conversationHistory.slice(-5).join("\n")}

      CURRENT USER MESSAGE: "${input}"

      ADVANCED DETECTION RULES:
      - Detect urgency from words like "ASAP", "urgent", "emergency", "soon", "quick"
      - Identify budget concerns from "cheap", "affordable", "expensive", "cost", "budget"
      - Recognize quality focus from "best", "top-rated", "professional", "certified", "experienced"
      - Spot comparison intent from "vs", "compare", "better", "difference", "which"
      - Detect hesitation from "not sure", "maybe", "thinking about", "considering"
      - Identify satisfaction/dissatisfaction from tone and sentiment words

      CONTEXT AWARENESS:
      - Consider how this message relates to previous messages
      - Identify if user is changing direction or refining previous statements
      - Detect if user is expressing implicit concerns

      Respond in JSON format only:
      {
        "type": "intent_type",
        "confidence": 0.0,
        "entities": ["entity1", "entity2"],
        "subIntents": ["subIntent1"],
        "contextualFactors": {
          "urgency": "low|medium|high",
          "budgetSensitive": true|false,
          "qualityFocused": true|false,
          "needsReassurance": true|false,
          "comparingSeveral": true|false
        },
        "implicitNeeds": ["need1", "need2"],
        "emotionalTone": "neutral|positive|negative|anxious|excited",
        "conversationSignal": "exploring|narrowing|deciding|hesitating|confirming"
      }
    `

    // Use the GROQ API for intent detection
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response")
    }

    const intentData = JSON.parse(jsonMatch[0])

    // Convert to UserIntent type
    const intent: UserIntent = {
      type: intentData.type || "general",
      confidence: intentData.confidence || 0.5,
      entities: intentData.entities || [],
      subIntents: intentData.subIntents || [],
      contextualFactors: new Map(Object.entries(intentData.contextualFactors || {})),
      implicitNeeds: intentData.implicitNeeds || [],
      emotionalTone: intentData.emotionalTone || "neutral",
      conversationSignal: intentData.conversationSignal || "general",
    }

    // Store in cache
    intentCache.set(cacheKey, { intent, timestamp: Date.now() })

    // Log the intent detection for analysis
    const supabase = createClientDatabaseClient()
    await supabase.from("matchmaker_nlp_logs").insert({
      input,
      context: conversationHistory.slice(-5),
      detected_intent: {
        type: intent.type,
        confidence: intent.confidence,
        entities: intent.entities,
        subIntents: intent.subIntents,
        contextualFactors: Object.fromEntries(intent.contextualFactors),
        implicitNeeds: intent.implicitNeeds,
        emotionalTone: intent.emotionalTone,
        conversationSignal: intent.conversationSignal,
      },
      created_at: new Date().toISOString(),
    })

    return intent
  } catch (error) {
    console.error("Error detecting intent:", error)

    // Fallback to basic intent detection
    return {
      type: "general",
      confidence: 0.5,
      entities: [],
      subIntents: [],
      contextualFactors: new Map(),
      implicitNeeds: [],
      emotionalTone: "neutral",
      conversationSignal: "general",
    }
  }
}

/**
 * Analyzes sentiment of user input
 */
export async function analyzeSentiment(
  input: string,
): Promise<{ type: "positive" | "negative" | "neutral"; confidence: number }> {
  try {
    // Use the GROQ API for sentiment analysis
    const prompt = `
      Analyze the sentiment of the following text. Respond with only a JSON object with two fields:
      - type: "positive", "negative", or "neutral"
      - confidence: a number between 0 and 1
      
      Text: "${input}"
    `

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error analyzing sentiment:", error)

    // Fallback to basic sentiment analysis
    const lowerInput = input.toLowerCase()
    let type: "positive" | "negative" | "neutral" = "neutral"
    let confidence = 0.5

    if (
      lowerInput.includes("great") ||
      lowerInput.includes("good") ||
      lowerInput.includes("love") ||
      lowerInput.includes("perfect") ||
      lowerInput.includes("excellent")
    ) {
      type = "positive"
      confidence = 0.8
    } else if (
      lowerInput.includes("bad") ||
      lowerInput.includes("terrible") ||
      lowerInput.includes("hate") ||
      lowerInput.includes("awful") ||
      lowerInput.includes("poor")
    ) {
      type = "negative"
      confidence = 0.8
    }

    return { type, confidence }
  }
}

/**
 * Extracts user concerns from input
 */
export async function extractUserConcerns(input: string): Promise<string[]> {
  try {
    // Use the GROQ API to extract concerns
    const prompt = `
      Extract the main concerns from the following user message in a service marketplace context.
      Focus on concerns related to price/budget, quality, timing/schedule, expertise, reliability, location, etc.
      
      User message: "${input}"
      
      Respond with only a JSON array of concern strings, e.g. ["price", "quality", "timing"]
    `

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error extracting concerns:", error)

    // Fallback to basic concern extraction
    const concerns: string[] = []
    const lowerInput = input.toLowerCase()

    if (
      lowerInput.includes("price") ||
      lowerInput.includes("cost") ||
      lowerInput.includes("expensive") ||
      lowerInput.includes("cheap") ||
      lowerInput.includes("budget")
    ) {
      concerns.push("price")
    }

    if (
      lowerInput.includes("quality") ||
      lowerInput.includes("good") ||
      lowerInput.includes("best") ||
      lowerInput.includes("excellent") ||
      lowerInput.includes("top")
    ) {
      concerns.push("quality")
    }

    if (
      lowerInput.includes("time") ||
      lowerInput.includes("schedule") ||
      lowerInput.includes("soon") ||
      lowerInput.includes("quick") ||
      lowerInput.includes("fast")
    ) {
      concerns.push("timing")
    }

    if (
      lowerInput.includes("expert") ||
      lowerInput.includes("experience") ||
      lowerInput.includes("skilled") ||
      lowerInput.includes("professional") ||
      lowerInput.includes("qualified")
    ) {
      concerns.push("expertise")
    }

    return concerns.length > 0 ? concerns : ["general"]
  }
}
