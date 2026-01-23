import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Export a function to verify environment variables are loaded
export const verifyEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing.join(', '))
  }
  
  return missing.length === 0
}

export default {}
