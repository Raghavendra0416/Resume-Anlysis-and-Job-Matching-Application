import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { env } from '../config/env.js'
import { asyncHandler } from '../middleware/async-handler.js'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
})

const loginSchema = z.object({ password: z.string().min(1).max(256) })

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  }
}

authRouter.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { password } = loginSchema.parse(req.body)
  const candidate = Buffer.from(password)
  const expected = Buffer.from(env.APP_PASSWORD)
  const matches = candidate.length === expected.length && timingSafeEqual(candidate, expected)

  if (!matches) {
    res.status(401).json({ error: 'The password is incorrect' })
    return
  }

  const token = jwt.sign({ sub: 'owner' }, env.SESSION_SECRET, { algorithm: 'HS256', expiresIn: '8h' })
  res.cookie(env.COOKIE_NAME, token, cookieOptions()).json({ authenticated: true })
}))

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions(), maxAge: undefined })
  res.status(204).end()
})

authRouter.get('/session', (req, res) => {
  const token = req.cookies?.[env.COOKIE_NAME] as string | undefined
  if (!token) {
    res.json({ authenticated: false })
    return
  }

  try {
    jwt.verify(token, env.SESSION_SECRET, { algorithms: ['HS256'] })
    res.json({ authenticated: true })
  } catch {
    res.json({ authenticated: false })
  }
})
