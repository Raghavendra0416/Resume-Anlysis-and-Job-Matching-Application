import { Schema, model } from 'mongoose'

export interface JobAnalysis {
  score: number
  summary: string
  requirements: Array<{
    name: string
    importance: 'required' | 'preferred' | 'inferred'
    status: 'evidenced' | 'partial' | 'missing' | 'confirm'
    resumeEvidence: string[]
    recommendation: string
  }>
  resumeEvidence: string[]
  recommendations: string[]
  analyzedAt: string
}

export interface JobDocument {
  companyName: string
  jobTitle?: string
  companyDescription?: string
  additionalInfo?: string
  jobDescription: string
  analysis: JobAnalysis | null
  createdAt: Date
  updatedAt: Date
}

const requirementSchema = new Schema(
  {
    name: { type: String, required: true },
    importance: { type: String, enum: ['required', 'preferred', 'inferred'], required: true },
    status: { type: String, enum: ['evidenced', 'partial', 'missing', 'confirm'], required: true },
    resumeEvidence: { type: [String], default: [] },
    recommendation: { type: String, required: true },
  },
  { _id: false },
)

const analysisSchema = new Schema(
  {
    score: { type: Number, min: 0, max: 100, required: true },
    summary: { type: String, required: true, maxlength: 3000 },
    requirements: { type: [requirementSchema], default: [] },
    resumeEvidence: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    analyzedAt: { type: String, required: true },
  },
  { _id: false },
)

const jobSchema = new Schema<JobDocument>(
  {
    companyName: { type: String, required: true, trim: true, maxlength: 160 },
    jobTitle: { type: String, trim: true, maxlength: 160 },
    companyDescription: { type: String, trim: true, maxlength: 5000 },
    additionalInfo: { type: String, trim: true, maxlength: 5000 },
    jobDescription: { type: String, required: true, trim: true, maxlength: 30000 },
    analysis: { type: analysisSchema, default: null },
  },
  { timestamps: true, versionKey: false },
)

jobSchema.index({ updatedAt: -1 })

export const Job = model<JobDocument>('Job', jobSchema)
