import { Router } from 'express'
import { z } from 'zod'
import { Job } from '../models/Job.js'
import { TailoredResume } from '../models/TailoredResume.js'
import { asyncHandler } from '../middleware/async-handler.js'

export const jobsRouter = Router()

const jobInputSchema = z.object({
  companyName: z.string().trim().min(1).max(160),
  jobTitle: z.string().trim().max(160).optional(),
  companyDescription: z.string().trim().max(5000).optional(),
  additionalInfo: z.string().trim().max(5000).optional(),
  jobDescription: z.string().trim().min(1).max(30000),
})

jobsRouter.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const [jobs, total] = await Promise.all([
    Job.find().sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Job.countDocuments(),
  ])
  res.json({ jobs, page, limit, total })
}))

jobsRouter.post('/', asyncHandler(async (req, res) => {
  const input = jobInputSchema.parse(req.body)
  const job = await Job.create(input)
  res.status(201).json({ job })
}))

jobsRouter.get('/:jobId', asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId).lean()
  if (!job) {
    res.status(404).json({ error: 'Job comparison not found' })
    return
  }
  res.json({ job })
}))

jobsRouter.delete('/:jobId', asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.jobId)
  if (!job) {
    res.status(404).json({ error: 'Job comparison not found' })
    return
  }
  await TailoredResume.deleteMany({ jobId: job._id })
  res.status(204).end()
}))
