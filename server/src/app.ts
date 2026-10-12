import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { env } from './config/env.js'
import { requireAuth } from './middleware/require-auth.js'
import { requireTrustedOrigin } from './middleware/require-trusted-origin.js'
import { errorHandler } from './middleware/error-handler.js'
import { authRouter } from './routes/auth.routes.js'
import { resumeRouter } from './routes/resume.routes.js'
import { jobsRouter } from './routes/jobs.routes.js'
import { tailoredResumesRouter } from './routes/tailored-resumes.routes.js'

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.clientOrigins, credentials: true }))
app.use(express.json({ limit: '64kb' }))
app.use(cookieParser())
app.use('/api', requireTrustedOrigin)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api', requireAuth)
app.use('/api/resume', resumeRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/tailored-resumes', tailoredResumesRouter)

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
app.use(errorHandler)
