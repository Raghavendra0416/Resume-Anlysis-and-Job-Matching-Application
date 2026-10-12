import type { RequestHandler } from 'express'
import { env } from '../config/env.js'

export const requireTrustedOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get('origin')
  if (origin && !env.clientOrigins.includes(origin)) {
    res.status(403).json({ error: 'Request origin is not allowed' })
    return
  }
  next()
}
