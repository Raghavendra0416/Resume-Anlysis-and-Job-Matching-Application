import { Schema, model, Types } from 'mongoose'

export interface TailoredResumeDocument {
  jobId: Types.ObjectId
  companyName: string
  jobTitle?: string
  content: string
  changeSummary: string[]
  selectedSkills: string[]
  changes: Array<{ skill: string; section: string; location: string; insertedText: string }>
  sourceResumeHash: string
  createdAt: Date
  updatedAt: Date
}

const tailoredResumeSchema = new Schema<TailoredResumeDocument>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    companyName: { type: String, required: true, trim: true, maxlength: 160 },
    jobTitle: { type: String, trim: true, maxlength: 160 },
    content: { type: String, required: true, maxlength: 50000 },
    changeSummary: { type: [String], default: [] },
    selectedSkills: { type: [String], default: [] },
    changes: { type: [{ skill: String, section: String, location: String, insertedText: String }], default: [] },
    sourceResumeHash: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
)

tailoredResumeSchema.index({ updatedAt: -1 })

export const TailoredResume = model<TailoredResumeDocument>('TailoredResume', tailoredResumeSchema)
