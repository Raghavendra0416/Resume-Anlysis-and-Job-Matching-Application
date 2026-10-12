import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(currentDirectory, '../../../.env') })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  APP_PASSWORD: z.string().min(12, 'APP_PASSWORD must contain at least 12 characters'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must contain at least 32 characters'),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
  COOKIE_NAME: z.string().default('resume_session'),
  AI_PROVIDER: z.enum(['ollama', 'gemini']).default('ollama'),
  OLLAMA_BASE_URL: z.string().url().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().default('qwen3:4b'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n')
  throw new Error(`Invalid server environment:\n${details}`)
}

export const env = {
  ...result.data,
  clientOrigins: result.data.CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  isProduction: result.data.NODE_ENV === 'production',
  aiProvider: result.data.AI_PROVIDER,
  ollamaBaseUrl: result.data.OLLAMA_BASE_URL.replace(/\/$/, ''),
  ollamaModel: result.data.OLLAMA_MODEL,
  geminiApiKey: result.data.GEMINI_API_KEY,
  geminiModel: result.data.GEMINI_MODEL,
}
