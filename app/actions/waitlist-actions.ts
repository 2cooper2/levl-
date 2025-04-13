"use server"

import { z } from "zod"
import nodemailer from "nodemailer"
import { getEnvVariable } from "@/lib/env"

// Add configuration for admin email
const ADMIN_EMAIL = "levlplatform@gmail.com"

// Email validation schema
const waitlistSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
})

type WaitlistFormData = z.infer<typeof waitlistSchema>

// In a real app, this would connect to a database
// For now, we'll simulate storing emails in a "database"
const waitlistEmails: { email: string; name?: string; date: Date }[] = []

// Create a transporter for sending emails
const createTransporter = () => {
  const emailPassword = getEnvVariable("EMAIL_PASSWORD")

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ADMIN_EMAIL,
      pass: emailPassword,
    },
  })
}

// Function to send notification email
async function sendNotificationEmail(userData: { email: string; name?: string }) {
  try {
    const transporter = createTransporter()
    const currentDate = new Date().toLocaleString()

    // Email content
    const mailOptions = {
      from: ADMIN_EMAIL,
      to: ADMIN_EMAIL,
      subject: "New Waitlist Signup",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #6366f1;">New Waitlist Signup</h2>
          <p>A new user has joined the Levl waitlist:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${userData.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${userData.name || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Date:</td>
              <td style="padding: 10px;">${currentDate}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #666;">This is an automated notification from the Levl platform.</p>
        </div>
      `,
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.response)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function joinWaitlist(formData: FormData) {
  // Artificial delay to simulate network request
  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    // Parse and validate the form data
    const email = formData.get("email") as string
    const name = (formData.get("name") as string) || undefined

    const validatedData = waitlistSchema.parse({ email, name })

    // Check if email already exists
    const emailExists = waitlistEmails.some((entry) => entry.email === validatedData.email)
    if (emailExists) {
      return {
        success: false,
        message: "This email is already on our waitlist",
      }
    }

    // Store the email (in a real app, this would be a database operation)
    waitlistEmails.push({
      email: validatedData.email,
      name: validatedData.name,
      date: new Date(),
    })

    console.log("Waitlist entries:", waitlistEmails)

    // Send notification email to admin
    const emailSent = await sendNotificationEmail({
      email: validatedData.email,
      name: validatedData.name,
    })

    if (!emailSent) {
      console.warn("Failed to send notification email, but user was added to waitlist")
    }

    return {
      success: true,
      message: "You've been added to our waitlist! We'll notify you when we launch.",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0].message
      return { success: false, message: errorMessage }
    }

    console.error("Waitlist error:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}
