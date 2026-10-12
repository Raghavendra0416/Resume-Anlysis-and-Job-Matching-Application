import type { ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'
import { ZodError } from 'zod'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: error.flatten().fieldErrors })
    return
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: 'Validation failed', details: error.message })
    return
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: 'Invalid resource identifier' })
    return
  }

  if (error instanceof Error && error.message === 'UNAUTHORIZED') {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  console.error('Request failed', error)
  res.status(500).json({ error: 'An unexpected server error occurred' })
}
