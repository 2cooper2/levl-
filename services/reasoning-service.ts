import type {
  AIModelState,
  UserIntent,
  UserPreferenceModel,
  Service,
  ReasoningStep,
  ServiceMatch,
  MatchingResult,
} from "@/types/matchmaker"

/**
 * Updates the user model based on input and detected intent
 */
export function updateUserModel(
  currentModel: UserPreferenceModel,
  input: string,
  intent: UserIntent,
  conversationContext: AIModelState["conversationContext"],
): UserPreferenceModel {
  // Create a copy of the current model to update
  const updatedModel = {
    ...currentModel,
    categories: new Map(currentModel.categories),
    requirements: {
      ...currentModel.requirements,
      implicit: new Map(currentModel.requirements.implicit),
    },
  }

  // Update interaction count
  updatedModel.history.interactionCount += 1

  // Update categories based on intent entities
  intent.entities.forEach((entity) => {
    // Check if entity is a service category
    if (isServiceCategory(entity)) {
      // Update category with increased confidence
      const currentConfidence = updatedModel.categories.get(entity) || 0
      updatedModel.categories.set(entity, Math.min(0.9, currentConfidence + 0.2))
    }
  })

  // Update budget sensitivity if price-related terms are detected
  if (
    input.toLowerCase().includes("budget") ||
    input.toLowerCase().includes("price") ||
    input.toLowerCase().includes("cost") ||
    input.toLowerCase().includes("cheap") ||
    input.toLowerCase().includes("expensive")
  ) {
    if (input.toLowerCase().includes("cheap") || input.toLowerCase().includes("affordable")) {
      updatedModel.budget.sensitivity = Math.min(10, updatedModel.budget.sensitivity + 2)
    } else if (input.toLowerCase().includes("expensive") || input.toLowerCase().includes("premium")) {
      updatedModel.budget.sensitivity = Math.max(1, updatedModel.budget.sensitivity - 2)
    } else {
      // Generic mention of budget, slightly increase sensitivity
      updatedModel.budget.sensitivity = Math.min(10, updatedModel.budget.sensitivity + 1)
    }
  }

  // Update quality importance if quality-related terms are detected
  if (
    input.toLowerCase().includes("quality") ||
    input.toLowerCase().includes("best") ||
    input.toLowerCase().includes("excellent") ||
    input.toLowerCase().includes("top") ||
    input.toLowerCase().includes("professional")
  ) {
    updatedModel.quality.importance = Math.min(10, updatedModel.quality.importance + 1)
  }

  // Update timing urgency if time-related terms are detected
  if (
    input.toLowerCase().includes("urgent") ||
    input.toLowerCase().includes("soon") ||
    input.toLowerCase().includes("quickly") ||
    input.toLowerCase().includes("asap")
  ) {
    updatedModel.timing.urgency = Math.min(10, updatedModel.timing.urgency + 2)
  }

  // Parse explicit requirements
  const requirements = extractRequirements(input)
  if (requirements.length > 0) {
    updatedModel.requirements.explicit = [
      ...updatedModel.requirements.explicit,
      ...requirements.filter((req) => !updatedModel.requirements.explicit.includes(req)),
    ]
  }

  return updatedModel
}

/**
 * Apply adaptive learning to update user model based on feedback
 */
export function applyAdaptiveLearning(
  userModel: UserPreferenceModel,
  input: string,
  intent: UserIntent,
  learningRate = 0.2,
): UserPreferenceModel {
  const updatedModel = { ...userModel }

  // If this is feedback, adjust based on sentiment
  if (intent.type === "feedback") {
    // Check for positive feedback
    if (
      input.toLowerCase().includes("perfect") ||
      input.toLowerCase().includes("great") ||
      input.toLowerCase().includes("exactly") ||
      input.toLowerCase().includes("yes") ||
      input.toLowerCase().includes("like")
    ) {
      // Add positive satisfaction trend
      updatedModel.history.satisfactionTrend.push(0.8)

      // Reinforce current preferences
      updatedModel.categories.forEach((confidence, category) => {
        updatedModel.categories.set(category, Math.min(0.95, confidence + learningRate * 0.5))
      })
    }
    // Check for negative feedback
    else if (
      input.toLowerCase().includes("not right") ||
      input.toLowerCase().includes("don't like") ||
      input.toLowerCase().includes("wrong") ||
      input.toLowerCase().includes("no")
    ) {
      // Add negative satisfaction trend
      updatedModel.history.satisfactionTrend.push(-0.8)

      // Increase refinement iterations
      updatedModel.history.refinementIterations += 1

      // Extract specific concerns for targeted learning
      if (input.toLowerCase().includes("price") || input.toLowerCase().includes("expensive")) {
        updatedModel.budget.sensitivity = Math.min(10, updatedModel.budget.sensitivity + learningRate * 3)
      }

      if (input.toLowerCase().includes("quality") || input.toLowerCase().includes("better")) {
        updatedModel.quality.importance = Math.min(10, updatedModel.quality.importance + learningRate * 3)
      }

      if (input.toLowerCase().includes("time") || input.toLowerCase().includes("faster")) {
        updatedModel.timing.urgency = Math.min(10, updatedModel.timing.urgency + learningRate * 3)
      }
    }
  }

  return updatedModel
}

/**
 * Performs multi-step reasoning for the AI matchmaker
 */
export function performMultiStepReasoning(
  input: string,
  intent: UserIntent,
  userModel: UserPreferenceModel,
  conversationContext: AIModelState["conversationContext"],
): ReasoningStep[] {
  const reasoningSteps: ReasoningStep[] = []
  const reasoningId = `reasoning-${Date.now()}`

  // Step 1: Intent analysis
  reasoningSteps.push({
    id: `${reasoningId}-intent`,
    step: "Intent Analysis",
    reasoning: `Analyzed user input: "${truncate(input, 50)}"`,
    conclusion: `Primary intent: ${intent.type} (${Math.round(intent.confidence * 100)}% confidence)`,
    confidence: intent.confidence,
    timestamp: new Date(),
  })

  // Step 2: Context integration
  reasoningSteps.push({
    id: `${reasoningId}-context`,
    step: "Context Integration",
    reasoning: `Current conversation stage: ${conversationContext.stage}, depth: ${conversationContext.depth}`,
    conclusion: `Continuing conversation flow in ${conversationContext.stage} stage`,
    confidence: 0.85,
    timestamp: new Date(),
  })

  // Step 3: User model evaluation
  const userModelInsights = []

  if (userModel.categories.size > 0) {
    const topCategory = Array.from(userModel.categories.entries()).sort((a, b) => b[1] - a[1])[0]

    if (topCategory && topCategory[1] > 0.6) {
      userModelInsights.push(
        `Strong preference for ${topCategory[0]} (${Math.round(topCategory[1] * 100)}% confidence)`,
      )
    }
  }

  if (userModel.budget.sensitivity > 7) {
    userModelInsights.push(`High budget sensitivity (${userModel.budget.sensitivity}/10)`)
  }

  if (userModel.quality.importance > 7) {
    userModelInsights.push(`High quality importance (${userModel.quality.importance}/10)`)
  }

  if (userModel.timing.urgency > 7) {
    userModelInsights.push(`High time urgency (${userModel.timing.urgency}/10)`)
  }

  if (userModelInsights.length > 0) {
    reasoningSteps.push({
      id: `${reasoningId}-user-model`,
      step: "User Model Evaluation",
      reasoning: `Analyzing current user preference model after ${userModel.history.interactionCount} interactions`,
      conclusion: `Key user preferences: ${userModelInsights.join("; ")}`,
      confidence: 0.9,
      timestamp: new Date(),
    })
  }

  // Step 4: Decision planning based on conversation stage
  let decisionPlan = ""
  let decisionConfidence = 0.7

  switch (conversationContext.stage) {
    case "initial":
      decisionPlan = "Begin understanding user needs through structured questions"
      decisionConfidence = 0.95
      break
    case "understanding":
      decisionPlan = "Continue gathering user preferences to build comprehensive model"
      decisionConfidence = 0.9
      break
    case "service-specific":
      decisionPlan = "Gather service-specific requirements through targeted questions"
      decisionConfidence = 0.9
      break
    case "recommending":
      if (intent.type === "feedback") {
        decisionPlan = "Process user feedback on recommendations and refine if needed"
        decisionConfidence = 0.85
      } else {
        decisionPlan = "Provide personalized recommendations based on current user model"
        decisionConfidence = 0.85
      }
      break
    case "refining":
      decisionPlan = "Generate refined recommendations addressing user concerns"
      decisionConfidence = 0.8
      break
    case "finalizing":
      if (intent.type === "booking") {
        decisionPlan = "Facilitate service selection and booking process"
        decisionConfidence = 0.9
      } else {
        decisionPlan = "Guide user to final decision or provide additional information"
        decisionConfidence = 0.75
      }
      break
  }

  reasoningSteps.push({
    id: `${reasoningId}-decision`,
    step: "Decision Planning",
    reasoning: `Planning next action based on conversation stage (${conversationContext.stage}) and user intent (${intent.type})`,
    conclusion: decisionPlan,
    confidence: decisionConfidence,
    timestamp: new Date(),
  })

  return reasoningSteps
}

/**
 * Match services with reasoning based on user model
 */
export function matchServicesWithReasoning(services: Service[], userModel: UserPreferenceModel): MatchingResult {
  const matches: ServiceMatch[] = []
  const reasoning: ReasoningStep[] = []

  // Add reasoning step for the matching process
  reasoning.push({
    id: `matching-${Date.now()}`,
    step: "Service Matching",
    reasoning: "Analyzing user preferences and available services",
    conclusion: "Matching services based on category, budget, quality, and timing preferences",
    confidence: 0.9,
    timestamp: new Date(),
  })

  // For each service, calculate match score with reasons
  services.forEach((service) => {
    const matchReasons = []
    let totalScore = 0
    let categoryMatch = false

    // Check for category match
    if (userModel.categories.size > 0) {
      const categoryConfidence = userModel.categories.get(service.category) || 0

      if (categoryConfidence > 0) {
        categoryMatch = true
        const categoryScore = Math.round(categoryConfidence * 40) // Up to 40 points for category
        matchReasons.push({
          factor: "Category Match",
          score: categoryScore,
          explanation: `Matches your interest in ${service.category} services`,
        })
        totalScore += categoryScore
      }
    } else {
      // If no category preference yet, give some base points
      matchReasons.push({
        factor: "Service Offering",
        score: 20,
        explanation: `${service.category} service available`,
      })
      totalScore += 20
    }

    // Calculate price compatibility
    const priceValue = extractPriceValue(service.price)
    const budgetScore = calculateBudgetScore(priceValue, userModel.budget)
    matchReasons.push({
      factor: "Price Compatibility",
      score: budgetScore,
      explanation:
        budgetScore > 15
          ? `${service.price} aligns well with your budget preferences`
          : `${service.price} is available`,
    })
    totalScore += budgetScore

    // Calculate quality score
    const qualityScore = calculateQualityScore(service.provider.rating, service.provider.reviews, userModel.quality)
    matchReasons.push({
      factor: "Provider Quality",
      score: qualityScore,
      explanation: `${service.provider.rating}★ rating from ${service.provider.reviews} reviews`,
    })
    totalScore += qualityScore

    // Calculate response time score
    const responseTimeScore = calculateResponseTimeScore(service.provider.responseTime, userModel.timing)
    matchReasons.push({
      factor: "Response Time",
      score: responseTimeScore,
      explanation: `Provider typically responds ${service.provider.responseTime}`,
    })
    totalScore += responseTimeScore

    // Add completion rate bonus
    const completionRateScore = Math.round((service.provider.completionRate - 90) / 2)
    if (completionRateScore > 0) {
      matchReasons.push({
        factor: "Reliability",
        score: completionRateScore,
        explanation: `${service.provider.completionRate}% project completion rate`,
      })
      totalScore += completionRateScore
    }

    // Calculate confidence score based on how much we know about user preferences
    const confidenceScore = calculateMatchConfidence(userModel, categoryMatch)

    // Add to matches
    matches.push({
      service,
      matchScore: Math.min(100, totalScore),
      matchReasons,
      confidenceScore,
    })
  })

  // Sort by match score
  matches.sort((a, b) => b.matchScore - a.matchScore)

  // Add reasoning about top matches
  if (matches.length > 0) {
    const topMatch = matches[0]
    reasoning.push({
      id: `top-match-${Date.now()}`,
      step: "Top Match Analysis",
      reasoning: `Analyzed match score for ${topMatch.service.title}`,
      conclusion: `Top match is ${topMatch.service.title} with ${topMatch.matchScore}% match score primarily due to ${topMatch.matchReasons[0].factor}`,
      confidence: topMatch.confidenceScore,
      timestamp: new Date(),
    })
  }

  // Calculate diversity and coverage scores
  const diversityScore = calculateDiversityScore(matches)
  const coverageScore = calculateCoverageScore(matches, userModel)

  return {
    matches,
    reasoning,
    diversityScore,
    coverageScore,
  }
}

/**
 * Determine if the AI should take proactive action
 */
export function shouldTakeProactiveAction(
  intent: UserIntent,
  userModel: UserPreferenceModel,
  conversationContext: AIModelState["conversationContext"],
  proactiveThreshold = 0.75,
): boolean {
  // Base score starts at 0
  let proactiveScore = 0

  // 1. Low confidence in user intent suggests AI should be more proactive
  if (intent.confidence < 0.6) {
    proactiveScore += 0.2
  }

  // 2. If we're in refining stage with multiple refinement iterations
  if (conversationContext.stage === "refining" && userModel.history.refinementIterations > 1) {
    proactiveScore += 0.25 // User is struggling to find what they want
  }

  // 3. If user has expressed frustration
  const recentSatisfaction = userModel.history.satisfactionTrend.slice(-2)
  if (recentSatisfaction.length > 0 && recentSatisfaction.some((score) => score < -0.5)) {
    proactiveScore += 0.3 // User is frustrated, AI should be more helpful
  }

  // 4. If we have strong understanding of user needs but they're not making progress
  if (userModel.categories.size > 0 && conversationContext.stage === "finalizing" && intent.type === "general") {
    proactiveScore += 0.2 // We know what they want but they're not moving forward
  }

  // 5. If user has been in the same stage for too long
  if (conversationContext.depth > 3 && conversationContext.stage !== "finalizing") {
    proactiveScore += 0.15 // User might be stuck
  }

  return proactiveScore > proactiveThreshold
}

// Utility functions

/**
 * Check if a string represents a service category
 */
function isServiceCategory(category: string): boolean {
  const validCategories = [
    "Mounting",
    "Assembly",
    "Painting",
    "Technology",
    "Plumbing",
    "Photography",
    "Development",
    "Design",
    "Business",
    "Marketing",
  ]
  return validCategories.includes(category)
}

/**
 * Extract requirements from user input
 */
function extractRequirements(input: string): string[] {
  const requirements: string[] = []

  // Simple pattern matching - in a real system this would be more sophisticated
  const phrases = input.toLowerCase().split(/[,.;]/)

  phrases.forEach((phrase) => {
    if (phrase.includes("need") || phrase.includes("require") || phrase.includes("must") || phrase.includes("should")) {
      requirements.push(phrase.trim())
    }
  })

  return requirements
}

/**
 * Extract numeric price value from price string
 */
function extractPriceValue(price: string): number {
  const numericValue = Number.parseFloat(price.replace(/[^0-9.]/g, ""))
  return isNaN(numericValue) ? 0 : numericValue
}

/**
 * Calculate budget compatibility score
 */
function calculateBudgetScore(price: number, budgetPreference: UserPreferenceModel["budget"]): number {
  // Default mid-range budget preference
  if (budgetPreference.sensitivity === 5) {
    return 20 // Neutral score
  }

  // High budget sensitivity (prefers lower prices)
  if (budgetPreference.sensitivity > 7) {
    return price < 80 ? 30 : price < 120 ? 20 : 10
  }

  // Low budget sensitivity (prefers premium)
  if (budgetPreference.sensitivity < 3) {
    return price > 120 ? 30 : price > 80 ? 20 : 10
  }

  // Moderate budget sensitivity
  return 20
}

/**
 * Calculate quality score based on provider rating and reviews
 */
function calculateQualityScore(
  rating: number,
  reviews: number,
  qualityPreference: UserPreferenceModel["quality"],
): number {
  // Base score from rating (0-20 scale)
  let score = (rating - 4) * 20

  // Bonus for high number of reviews
  if (reviews > 100) {
    score += 5
  } else if (reviews > 50) {
    score += 3
  }

  // Adjust based on quality importance
  if (qualityPreference.importance > 7) {
    score = score * 1.5 // Emphasize quality for users who care about it
  } else if (qualityPreference.importance < 4) {
    score = score * 0.7 // De-emphasize for users who don't prioritize quality
  }

  return Math.round(Math.min(30, Math.max(0, score)))
}

/**
 * Calculate response time score
 */
function calculateResponseTimeScore(responseTime: string, timingPreference: UserPreferenceModel["timing"]): number {
  let score = 10 // Default score

  // Parse response time
  if (responseTime.includes("1 hour")) {
    score = 20
  } else if (responseTime.includes("2 hours")) {
    score = 15
  } else if (responseTime.includes("3 hours")) {
    score = 10
  } else {
    score = 5
  }

  // Adjust based on urgency
  if (timingPreference.urgency > 7) {
    score = score * 1.5 // Emphasize quick response for urgent needs
  } else if (timingPreference.urgency < 4) {
    score = score * 0.7 // De-emphasize for users with flexible timing
  }

  return Math.round(Math.min(30, Math.max(0, score)))
}

/**
 * Calculate match confidence based on user model completeness
 */
function calculateMatchConfidence(userModel: UserPreferenceModel, hasExactCategoryMatch: boolean): number {
  let confidence = 0.5 // Start with medium confidence

  // Increase confidence if we have category preferences
  if (userModel.categories.size > 0) {
    confidence += 0.2
  }

  // Increase confidence for exact category match
  if (hasExactCategoryMatch) {
    confidence += 0.1
  }

  // Increase confidence if we have budget preferences
  if (userModel.budget.sensitivity !== 5) {
    confidence += 0.05
  }

  // Increase confidence if we have quality preferences
  if (userModel.quality.importance !== 7) {
    confidence += 0.05
  }

  // Increase confidence if we have timing preferences
  if (userModel.timing.urgency !== 5) {
    confidence += 0.05
  }

  // Decrease confidence if we have few interactions
  if (userModel.history.interactionCount < 3) {
    confidence -= 0.1
  }

  return Math.min(0.95, Math.max(0.3, confidence))
}

/**
 * Calculate diversity score for a set of matches
 */
function calculateDiversityScore(matches: ServiceMatch[]): number {
  if (matches.length <= 1) return 0

  // Check category diversity
  const categories = new Set(matches.map((match) => match.service.category))

  // Check price diversity
  const prices = matches.map((match) => extractPriceValue(match.service.price))
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  // Check quality diversity
  const ratings = matches.map((match) => match.service.provider.rating)
  const minRating = Math.min(...ratings)
  const maxRating = Math.max(...ratings)
  const ratingRange = maxRating - minRating

  // Calculate diversity score (0-100)
  let diversityScore = 0

  // Category diversity (up to 40 points)
  diversityScore += (categories.size / matches.length) * 40

  // Price diversity (up to 30 points)
  const normalizedPriceRange = Math.min(100, priceRange) / 100
  diversityScore += normalizedPriceRange * 30

  // Rating diversity (up to 30 points)
  const normalizedRatingRange = ratingRange / 1 // Max possible range is 1 (4.0 to 5.0)
  diversityScore += normalizedRatingRange * 30

  return Math.round(diversityScore)
}

/**
 * Calculate how well the matches cover the user's preferences
 */
function calculateCoverageScore(matches: ServiceMatch[], userModel: UserPreferenceModel): number {
  let coverageScore = 50 // Start with medium coverage

  // Check if top categories are covered
  const topCategories = Array.from(userModel.categories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map((entry) => entry[0])

  if (topCategories.length > 0) {
    const matchedCategories = new Set(matches.map((match) => match.service.category))
    const categoriesCovered = topCategories.filter((category) => matchedCategories.has(category)).length

    coverageScore += (categoriesCovered / Math.max(1, topCategories.length)) * 30
  } else {
    // If no specific categories, give full points
    coverageScore += 30
  }

  // Check if price range covers preference
  if (userModel.budget.sensitivity > 7) {
    // User prefers lower prices - check if we have affordable options
    const cheapOptions = matches.filter((match) => extractPriceValue(match.service.price) < 100).length
    coverageScore += (cheapOptions / Math.max(1, matches.length)) * 20
  } else if (userModel.budget.sensitivity < 3) {
    // User prefers premium - check if we have premium options
    const premiumOptions = matches.filter((match) => extractPriceValue(match.service.price) > 120).length
    coverageScore += (premiumOptions / Math.max(1, matches.length)) * 20
  } else {
    // User has no strong preference, give full points
    coverageScore += 20
  }

  return Math.min(100, Math.round(coverageScore))
}

/**
 * Truncate a string to specified length with ellipsis
 */
function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str
}
