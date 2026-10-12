import { Router } from 'express'
import { z } from 'zod'
import { Job } from '../models/Job.js'
import { TailoredResume } from '../models/TailoredResume.js'
import { Resume } from '../models/Resume.js'
import { asyncHandler } from '../middleware/async-handler.js'
import { createTailoredCopy } from '../services/tailor-resume.js'
import { resumeHash } from '../services/rule-analysis.js'

export const tailoredResumesRouter = Router()

const tailoredInputSchema = z.object({
  content: z.string().min(1).max(50000).refine((content) => content.trim().length > 0, 'Resume content is required'),
  changeSummary: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
})
const createTailoredInputSchema = z.object({
  selectedSkills: z.array(z.string().trim().min(1).max(100)).min(1).max(30),
  confirmed: z.literal(true),
})

tailoredResumesRouter.get('/', asyncHandler(async (_req, res) => {
  const resumes = await TailoredResume.find().sort({ updatedAt: -1 }).lean()
  res.json({ resumes })
}))

tailoredResumesRouter.post('/jobs/:jobId', asyncHandler(async (req, res) => {
  const input = createTailoredInputSchema.parse(req.body)
  const job = await Job.findById(req.params.jobId)
  if (!job) {
    res.status(404).json({ error: 'Job comparison not found' })
    return
  }

  const resume = await Resume.findOne({ key: 'primary' })
  if (!resume) {
    res.status(409).json({ error: 'Save your main resume before creating a tailored copy.' })
    return
  }
  if (job.analysis?.method !== 'rules-v1') {
    res.status(409).json({ error: 'Run the rule-based comparison before creating a tailored copy.' })
    return
  }
  if (job.analysis.resumeContentHash !== resumeHash(resume.content)) {
    res.status(409).json({ error: 'Your main resume has changed since this comparison. Re-run the comparison before creating a tailored copy.' })
    return
  }

  let tailoredCopy
  try {
    tailoredCopy = createTailoredCopy(resume.content, input.selectedSkills, job.analysis, `${job.jobDescription}\n${job.additionalInfo ?? ''}\n${job.companyDescription ?? ''}`)
  } catch (reason) {
    res.status(422).json({ error: reason instanceof Error ? reason.message : 'Could not create a tailored copy.' })
    return
  }

  const savedResume = await TailoredResume.create({
    jobId: job._id,
    companyName: job.companyName,
    jobTitle: job.jobTitle,
    ...tailoredCopy,
    sourceResumeHash: job.analysis.resumeContentHash,
  })
  res.status(201).json({ resume: savedResume })
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
