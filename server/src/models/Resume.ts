import { Schema, model } from 'mongoose'

export interface ResumeDocument {
  key: 'primary'
  content: string
  analysis: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

const resumeSchema = new Schema<ResumeDocument>(
  {
    key: { type: String, enum: ['primary'], required: true, unique: true, default: 'primary' },
    content: { type: String, required: true, maxlength: 50000 },
    analysis: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true, versionKey: false },
)

export const Resume = model<ResumeDocument>('Resume', resumeSchema)
