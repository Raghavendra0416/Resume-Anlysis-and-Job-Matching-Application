import { Router } from 'express'
import { z } from 'zod'
import { Resume } from '../models/Resume.js'
import { Job } from '../models/Job.js'
import { asyncHandler } from '../middleware/async-handler.js'

export const resumeRouter = Router()

const resumeSchema = z.object({
  content: z.string().min(1).max(50000).refine((content) => content.trim().length > 0, 'Resume content is required'),
})

resumeRouter.get('/', asyncHandler(async (_req, res) => {
  const resume = await Resume.findOne({ key: 'primary' }).lean()
  res.json({ resume })
}))

resumeRouter.put('/', asyncHandler(async (req, res) => {
  const { content } = resumeSchema.parse(req.body)
  const resume = await Resume.findOneAndUpdate(
    { key: 'primary' },
    { $set: { content }, $setOnInsert: { key: 'primary' }, $unset: { analysis: 1 } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean()
  await Job.updateMany({}, { $set: { analysis: null } })
  res.json({ resume })
}))

resumeRouter.delete('/', asyncHandler(async (_req, res) => {
  await Resume.deleteOne({ key: 'primary' })
  await Job.updateMany({}, { $set: { analysis: null } })
  res.status(204).end()
}))
