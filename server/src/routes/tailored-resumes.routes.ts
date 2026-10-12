import { Router } from 'express'
import { z } from 'zod'
import { Job } from '../models/Job.js'
import { TailoredResume } from '../models/TailoredResume.js'
import { asyncHandler } from '../middleware/async-handler.js'

export const tailoredResumesRouter = Router()

const tailoredInputSchema = z.object({
  content: z.string().min(1).max(50000).refine((content) => content.trim().length > 0, 'Resume content is required'),
  changeSummary: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
})

tailoredResumesRouter.get('/', asyncHandler(async (_req, res) => {
  const resumes = await TailoredResume.find().sort({ updatedAt: -1 }).lean()
  res.json({ resumes })
}))

tailoredResumesRouter.post('/jobs/:jobId', asyncHandler(async (req, res) => {
  const input = tailoredInputSchema.parse(req.body)
  const job = await Job.findById(req.params.jobId)
  if (!job) {
    res.status(404).json({ error: 'Job comparison not found' })
    return
  }

  const resume = await TailoredResume.create({
    jobId: job._id,
    companyName: job.companyName,
    jobTitle: job.jobTitle,
    ...input,
  })
  res.status(201).json({ resume })
}))

tailoredResumesRouter.patch('/:resumeId', asyncHandler(async (req, res) => {
  const input = tailoredInputSchema.parse(req.body)
  const resume = await TailoredResume.findByIdAndUpdate(req.params.resumeId, input, { new: true, runValidators: true }).lean()
  if (!resume) {
    res.status(404).json({ error: 'Tailored resume not found' })
    return
  }
  res.json({ resume })
}))

tailoredResumesRouter.delete('/:resumeId', asyncHandler(async (req, res) => {
  const result = await TailoredResume.findByIdAndDelete(req.params.resumeId)
  if (!result) {
    res.status(404).json({ error: 'Tailored resume not found' })
    return
  }
  res.status(204).end()
}))
