/**
 * Service for interacting with Groq LLM API
 */

import { createClientDatabaseClient } from "@/lib/supabase-client"
import type { Message } from "@/types/matchmaker"

interface GroqChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface GroqResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function generateGroqResponse(
  messages: Message[],
  userPreferences: any,
  matchedServices: any[] = [],
  categories: any[] = [],
  context?: string,
): Promise<{ content: string; requestId: number }> {
  try {
    const supabase = createClientDatabaseClient()

    // Insert initial request record
    const { data: requestData, error: insertError } = await supabase
      .from("llm_requests")
      .insert({
        provider: "groq",
        model: "llama3-8b-8192",
        input_tokens: JSON.stringify(messages).length / 4, // Approximate
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error("Error logging LLM request:", insertError)
    }

    const requestId = requestData?.[0]?.id || 0

    // Convert messages to the format expected by Groq
    const chatMessages: GroqChatMessage[] = []

    // Add system prompt
    chatMessages.push({
      role: "system",
      content: createSystemPrompt(userPreferences, matchedServices, categories, context),
    })

    // Add conversation history (last 10 messages)
    const conversationHistory = messages.slice(-10).map((msg) => {
      // For service messages, format as a list
      if (msg.type === "ai" && msg.services) {
        const serviceInfo = msg.services
          .map(
            (service) =>
              `- ${service.title} (${service.category}) - ${service.price} - Provider: ${service.provider.name} (${service.provider.rating}★)`,
          )
          .join("\n")
        return {
          role: msg.type === "user" ? "user" : "assistant",
          content: `${msg.content}\n\n${serviceInfo}`,
        }
      } else if (msg.type === "ai" && msg.options) {
        return {
          role: "assistant",
          content: `${msg.content}\n\nOptions: ${msg.options.join(", ")}`,
        }
      } else {
        return {
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        }
      }
    })

    chatMessages.push(...conversationHistory)

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Groq API error: ${response.status} - ${errorText}`)
    }

    const data: GroqResponse = await response.json()

    // Update the request record with token usage
    await supabase
      .from("llm_requests")
      .update({
        output_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    return {
      content: data.choices[0].message.content,
      requestId,
    }
  } catch (error) {
    console.error("Error generating Groq response:", error)
    return {
      content: "I'm sorry, I encountered an error processing your request. Please try again.",
      requestId: 0,
    }
  }
}

// Create a detailed system prompt to guide the LLM's behavior
function createSystemPrompt(
  userPreferences: any,
  matchedServices: any[] = [],
  categories: any[] = [],
  context?: string,
): string {
  return `You are the LEVL AI Service Matchmaker, a sophisticated AI assistant designed to help users find the perfect service provider on the LEVL marketplace. You are conversational, helpful, and knowledgeable about various service categories.

USER PREFERENCES:
${JSON.stringify(userPreferences, null, 2)}

MATCHED SERVICES:
${matchedServices
  .map(
    (service) =>
      `- ${service.title} (${service.category}) - ${service.price}
   Provider: ${service.provider.name} (${service.provider.rating}★)
   Description: ${service.description}`,
  )
  .join("\n\n")}

AVAILABLE CATEGORIES:
${categories.map((cat) => cat.name).join(", ")}

CONTEXT: ${context || "General conversation"}

GUIDELINES:
1. Be conversational and natural in your responses
2. When recommending services, explain your reasoning
3. Ask clarifying questions when user needs are unclear
4. Respect budget sensitivity and quality preferences
5. Suggest relevant service categories when appropriate
6. Be proactive in guiding the conversation
7. Support both structured (options selection) and free-form conversation
8. If you don't have certain information, acknowledge it and ask more questions
9. When comparing services, highlight key differences objectively
10. Focus on being helpful rather than sales-oriented

Your primary goal is to match users with the right services based on their needs.
`
}

// Function to generate dynamic recommendation explanation
export async function generateRecommendationExplanation(
  matchedServices: any[],
  userPreferences: any,
): Promise<{ content: string; requestId: number }> {
  try {
    const supabase = createClientDatabaseClient()

    // Insert initial request record
    const { data: requestData, error: insertError } = await supabase
      .from("llm_requests")
      .insert({
        provider: "groq",
        model: "llama3-8b-8192",
        input_tokens: (JSON.stringify(matchedServices).length + JSON.stringify(userPreferences).length) / 4, // Approximate
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error("Error logging LLM request:", insertError)
    }

    const requestId = requestData?.[0]?.id || 0

    const prompt = `
You're a service recommendation expert explaining why these services were recommended:

RECOMMENDED SERVICES:
${matchedServices
  .map(
    (service) =>
      `- ${service.title} (${service.category}) - ${service.price}
   Provider: ${service.provider.name} (${service.provider.rating}★)
   Description: ${service.description}
   Match Score: ${service.matchScore || "N/A"}`,
  )
  .join("\n\n")}

USER PREFERENCES:
${JSON.stringify(userPreferences, null, 2)}

Please provide a personalized explanation of why these services were recommended based on the user's preferences. Focus on:
1. How they match specific user needs
2. Key differentiating factors between services
3. Value for money considerations
4. Provider expertise and reputation
5. Any special features that might be relevant

Your explanation should be conversational, informative, and helpful to the user in making a decision.
`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You're a service recommendation expert providing explanations." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data: GroqResponse = await response.json()

    // Update the request record with token usage
    await supabase
      .from("llm_requests")
      .update({
        output_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    return {
      content: data.choices[0].message.content,
      requestId,
    }
  } catch (error) {
    console.error("Error generating recommendation explanation:", error)
    return {
      content:
        "These services were recommended based on your preferences and requirements. Each one offers quality service at a competitive price point.",
      requestId: 0,
    }
  }
}

// Function to generate comparisons between services
export async function generateServiceComparison(services: any[]): Promise<{ content: string; requestId: number }> {
  try {
    const supabase = createClientDatabaseClient()

    // Insert initial request record
    const { data: requestData, error: insertError } = await supabase
      .from("llm_requests")
      .insert({
        provider: "groq",
        model: "llama3-8b-8192",
        input_tokens: JSON.stringify(services).length / 4, // Approximate
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error("Error logging LLM request:", insertError)
    }

    const requestId = requestData?.[0]?.id || 0

    const prompt = `
Compare these services in a detailed but concise way:

SERVICES TO COMPARE:
${services
  .map(
    (service) =>
      `- ${service.title} (${service.category}) - ${service.price}
   Provider: ${service.provider.name} (${service.provider.rating}★)
   Description: ${service.description}
   Key features: ${service.tags?.join(", ") || "None specified"}`,
  )
  .join("\n\n")}

Create a comprehensive but easy-to-understand comparison that highlights:
1. Key differences in price and value
2. Provider experience and ratings
3. Service scope and what's included
4. Best fit for different user needs
5. Standout features of each service

Format your response in a way that's clear and helps the user make an informed decision.
`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You're a service comparison expert." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data: GroqResponse = await response.json()

    // Update the request record with token usage
    await supabase
      .from("llm_requests")
      .update({
        output_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    return {
      content: data.choices[0].message.content,
      requestId,
    }
  } catch (error) {
    console.error("Error generating service comparison:", error)
    return {
      content:
        "I couldn't generate a detailed comparison. Please check each service individually to compare their features, pricing, and provider ratings.",
      requestId: 0,
    }
  }
}
