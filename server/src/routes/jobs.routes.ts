import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { Job } from '../models/Job.js'
import { Resume } from '../models/Resume.js'
import { TailoredResume } from '../models/TailoredResume.js'
import { env } from '../config/env.js'
import { asyncHandler } from '../middleware/async-handler.js'
import { analyzeJob, analyzeResume, resumeHash } from '../services/ai-analysis.js'

export const jobsRouter = Router()

const jobInputSchema = z.object({
  companyName: z.string().trim().min(1).max(160),
  jobTitle: z.string().trim().max(160).optional(),
  companyDescription: z.string().trim().max(5000).optional(),
  additionalInfo: z.string().trim().max(5000).optional(),
  jobDescription: z.string().trim().min(1).max(30000),
})

const analysisLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Analysis limit reached. Please try again later.' } })

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

jobsRouter.post('/:jobId/analyze', analysisLimiter, asyncHandler(async (req, res) => {
  if (env.aiProvider === 'gemini' && (!env.geminiApiKey || env.geminiApiKey.startsWith('replace-'))) {
    res.status(503).json({ error: 'Add GEMINI_API_KEY to the server .env file to enable AI analysis, then restart the API.' })
    return
  }
  const force = z.object({ force: z.boolean().optional() }).parse(req.body).force === true
  const [job, resume] = await Promise.all([
    Job.findById(req.params.jobId),
    Resume.findOne({ key: 'primary' }),
  ])
  if (!job) {
    res.status(404).json({ error: 'Job comparison not found' })
    return
  }
  if (!resume) {
    res.status(409).json({ error: 'Save your main resume before analyzing a job.' })
    return
  }
  const currentHash = resumeHash(resume.content)
  if (!force && job.analysis?.resumeContentHash === currentHash) {
    res.json({ job, cached: true })
    return
  }
  try {
    let profile = resume.analysis as { contentHash?: string; overview: string; skills: Array<{ name: string; evidence: string }>; sections: Array<{ name: string; summary: string }> } | null
    if (!profile || profile.contentHash !== currentHash) {
      profile = await analyzeResume(resume.content)
      resume.analysis = profile
      await resume.save()
    }
    job.analysis = await analyzeJob({
      resume: resume.content,
      profile,
      jobDescription: job.jobDescription,
      companyDescription: job.companyDescription,
      additionalInfo: job.additionalInfo,
      jobTitle: job.jobTitle,
    })
    await job.save()
    res.json({ job, cached: false })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    console.error(`${env.aiProvider} analysis failed`, detail)
    if (detail === 'OLLAMA_UNAVAILABLE' || detail.startsWith('OLLAMA_REQUEST_FAILED_')) {
      res.status(503).json({ error: `Ollama is unavailable or the model is missing. Start Ollama and run "ollama pull ${env.ollamaModel}", then retry.` })
      return
    }
    const provider = env.aiProvider === 'ollama' ? 'Ollama could not complete the analysis.' : 'Gemini could not complete this analysis. Check your API key and available quota.'
    res.status(502).json({ error: provider })
  }
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
