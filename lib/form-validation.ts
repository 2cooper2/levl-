import { z } from "zod"

// Define common validation schemas
export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email address" })

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })

export const nameSchema = z
  .string()
  .min(2, { message: "Name must be at least 2 characters long" })
  .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces" })

export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/, { message: "Invalid phone number format" })

// User registration schema
export const userRegistrationSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
})

// Service creation schema
export const serviceCreationSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
  category: z.string().min(1, { message: "Category is required" }),
  price: z.number().min(1, { message: "Price must be greater than 0" }),
  duration: z.number().min(1, { message: "Duration must be greater than 0" }),
})

// Booking schema
export const bookingSchema = z.object({
  serviceId: z.string().min(1, { message: "Service is required" }),
  date: z.date({ required_error: "Date is required" }),
  notes: z.string().max(500, { message: "Notes must be less than 500 characters" }).optional(),
})
