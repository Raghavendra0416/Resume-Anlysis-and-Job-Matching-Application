import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME] as string | undefined
  if (!token) {
    next(new Error('UNAUTHORIZED'))
    return
  }

  try {
    jwt.verify(token, env.SESSION_SECRET, { algorithms: ['HS256'] })
    next()
  } catch {
    next(new Error('UNAUTHORIZED'))
  }
}
