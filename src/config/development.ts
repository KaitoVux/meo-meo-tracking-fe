// Development configuration
export const DEV_CONFIG = {
  // Enable mock authentication in development (can be disabled via VITE_DISABLE_MOCK_AUTH=true)
  enableMockAuth: !import.meta.env.VITE_DISABLE_MOCK_AUTH,

  // Mock user data
  mockUser: {
    id: 'dev-user-123',
    email: 'dev@example.com',
    firstName: 'John',
    lastName: 'Developer',
    role: 'ACCOUNTANT' as const, // Use ACCOUNTANT for full access
  },

  // Mock token
  mockToken: 'dev-token-123',
} as const

export const isDevelopment = import.meta.env.DEV
