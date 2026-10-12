import type { JobAnalysis } from '../models/Job.js'

export interface ResumeChange {
  skill: string
  section: string
  location: string
  insertedText: string
}

const headingPattern = /^(summary|profile|objective|skills?|technical skills?|core competencies|experience|work experience|employment|projects?|education|certifications?|awards|additional information)\s*:?\s*$/i
const skillsHeading = /^(skills?|technical skills?|core competencies)\s*:?\s*$/i

function hasTerm(text: string, term: string) {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  return new RegExp(`(^|[^\\p{L}\\p{N}+#.-])${escaped}($|[^\\p{L}\\p{N}+#.-])`, 'iu').test(text)
}

export function createTailoredCopy(content: string, selectedSkills: string[], analysis: JobAnalysis, jobText: string) {
  const eligible = new Set(analysis.requirements
    .filter((item) => item.category === 'skill' && item.status !== 'evidenced')
    .map((item) => item.name.toLocaleLowerCase()))
  const normalized = [...new Set(selectedSkills.map((skill) => skill.trim()).filter(Boolean))]
  if (!normalized.length) throw new Error('Select at least one missing skill to include in the tailored copy.')
  const invalid = normalized.filter((skill) => !eligible.has(skill.toLocaleLowerCase()) && (!hasTerm(jobText, skill) || hasTerm(content, skill)))
  if (invalid.length) throw new Error(`These selected skills are not missing skill requirements for this job: ${invalid.join(', ')}`)

  const lines = content.split(/\r?\n/)
  const headingIndex = lines.findIndex((line) => skillsHeading.test(line.trim()))
  let section = 'Skills (new section)'
  let location: string
  let insertedText: string
  let output: string[]

  if (headingIndex >= 0) {
    section = lines[headingIndex].trim().replace(/:$/, '')
    let sectionEnd = lines.length
    for (let index = headingIndex + 1; index < lines.length; index += 1) {
      if (headingPattern.test(lines[index].trim())) { sectionEnd = index; break }
    }
    const existingBlock = lines.slice(headingIndex + 1, sectionEnd).join('\n')
    const newSkills = normalized.filter((skill) => !hasTerm(existingBlock, skill))
    if (!newSkills.length) throw new Error('The selected skill is already listed in the main resume’s Skills section. Re-run the comparison after updating your resume if needed.')
    const existingContent = lines.slice(headingIndex + 1, sectionEnd)
    const separator = existingContent.length && existingContent[existingContent.length - 1].trim() ? '\n' : ''
    insertedText = newSkills.join(', ')
    const updatedBlock = existingContent.join('\n') + separator + insertedText
    output = [...lines.slice(0, headingIndex + 1), ...updatedBlock.split('\n'), ...lines.slice(sectionEnd)]
    location = `Added after the existing entries under “${section}” (source lines ${headingIndex + 2}–${Math.max(headingIndex + 1, sectionEnd)}).`
    return {
      content: output.join('\n'),
      selectedSkills: newSkills,
      changes: newSkills.map((skill) => ({ skill, section, location, insertedText: skill })),
      changeSummary: newSkills.map((skill) => `${skill} — added to ${section}; ${location}`),
    }
  }

  insertedText = normalized.join(', ')
  location = 'Added a new Skills section at the end of the tailored copy.'
  output = [...lines, ...(lines.length && lines[lines.length - 1] !== '' ? [''] : []), 'Skills', insertedText]
  return {
    content: output.join('\n'),
    selectedSkills: normalized,
    changes: normalized.map((skill) => ({ skill, section, location, insertedText: skill })),
    changeSummary: normalized.map((skill) => `${skill} — added to a new Skills section at the end of the tailored copy.`),
  }
}
