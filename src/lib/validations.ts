import { z } from 'zod'

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

// Registration form validation schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    role: z.enum(['ACCOUNTANT', 'USER']).default('USER'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Profile update validation schema
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .optional(),
  email: z.string().email('Please enter a valid email address').optional(),
})

// Vendor form validation schema
export const vendorSchema = z.object({
  name: z
    .string()
    .min(1, 'Vendor name is required')
    .max(255, 'Vendor name must be less than 255 characters'),
  contactInfo: z
    .string()
    .max(500, 'Contact info must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Tax ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

// Expense form validation schema
export const expenseSchema = z.object({
  transactionDate: z.string().min(1, 'Transaction date is required'),
  expenseMonth: z.string().min(1, 'Expense month is required'),
  type: z.enum(['IN', 'OUT']).default('OUT').optional(),
  vendorId: z.string().min(1, 'Vendor is required'),
  categoryId: z.string().uuid('Category must be a valid UUID'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  amountBeforeVAT: z
    .number()
    .min(0.01, 'Amount before VAT must be greater than 0'),
  vatPercentage: z
    .number()
    .min(0)
    .max(100, 'VAT percentage must be between 0 and 100')
    .optional(),
  vatAmount: z
    .number()
    .min(0, 'VAT amount must be greater than or equal to 0')
    .optional(),
  currency: z.enum(['VND', 'USD']),
  exchangeRate: z.number().optional(),
  description: z.string().min(1, 'Description is required'),
  projectCostCenter: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER']),
  invoiceFileId: z.string().optional(),
})

// Category form validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name cannot exceed 100 characters'),
  code: z
    .string()
    .min(2, 'Category code must be at least 2 characters')
    .max(20, 'Category code cannot exceed 20 characters')
    .regex(
      /^[A-Z0-9_]+$/,
      'Code must contain only uppercase letters, numbers, and underscores'
    ),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type VendorFormData = z.infer<typeof vendorSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
