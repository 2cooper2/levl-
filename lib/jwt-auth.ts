// Simple JWT authentication helper
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "fallback-secret-for-development-only"

export function createToken(payload: any): string {
  try {
    // Simple JWT creation without external libraries
    const header = { alg: "HS256", typ: "JWT" }
    const encodedHeader = Buffer.from(JSON.stringify(header))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
    const encodedPayload = Buffer.from(JSON.stringify(payload))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")

    const signature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)
    return `${encodedHeader}.${encodedPayload}.${signature}`
  } catch (error) {
    console.error("Error creating JWT token:", error)
    return ""
  }
}

export function verifyToken(token: string): any {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts

    // Verify signature
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)
    if (signature !== expectedSignature) return null

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64").toString())

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch (error) {
    console.error("Error verifying JWT token:", error)
    return null
  }
}

function createSignature(data: string, secret: string): string {
  // Simple HMAC-SHA256 implementation
  const crypto = require("crypto")
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}
