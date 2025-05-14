import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variable validation
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'] as const;

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Export validated environment variables
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;

// Validate PORT is a valid number
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be a number between 1 and 65535');
}

// Validate JWT_SECRET length
if (JWT_SECRET && JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
