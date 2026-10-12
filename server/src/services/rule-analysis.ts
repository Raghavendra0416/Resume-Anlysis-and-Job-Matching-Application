import { createHash } from 'node:crypto'
import type { JobAnalysis } from '../models/Job.js'

type Importance = JobAnalysis['requirements'][number]['importance']
type Requirement = JobAnalysis['requirements'][number]

const skillCatalog: Array<{ name: string; aliases: string[]; related?: string[] }> = [
  { name: 'React', aliases: ['React', 'React.js', 'ReactJS'] },
  { name: 'Next.js', aliases: ['Next.js', 'NextJS'], related: ['React'] },
  { name: 'TypeScript', aliases: ['TypeScript'], related: ['JavaScript'] },
  { name: 'JavaScript', aliases: ['JavaScript'] },
  { name: 'HTML', aliases: ['HTML', 'HTML5'] },
  { name: 'CSS', aliases: ['CSS', 'CSS3'] },
  { name: 'Sass', aliases: ['Sass', 'SCSS'] },
  { name: 'Tailwind CSS', aliases: ['Tailwind CSS', 'Tailwind'] },
  { name: 'Bootstrap', aliases: ['Bootstrap'] },
  { name: 'Angular', aliases: ['Angular', 'AngularJS'] },
  { name: 'Vue', aliases: ['Vue.js', 'VueJS', 'Vue'] },
  { name: 'Svelte', aliases: ['Svelte', 'SvelteKit'] },
  { name: 'Node.js', aliases: ['Node.js', 'NodeJS'] },
  { name: 'Express', aliases: ['Express.js', 'ExpressJS', 'Express'] },
  { name: 'Redux', aliases: ['Redux', 'Redux Toolkit'], related: ['React'] },
  { name: 'Context API', aliases: ['Context API', 'React Context'], related: ['React'] },
  { name: 'Vite', aliases: ['Vite'] },
  { name: 'Webpack', aliases: ['Webpack'] },
  { name: 'REST APIs', aliases: ['REST API', 'REST APIs', 'RESTful API', 'RESTful APIs'] },
  { name: 'GraphQL', aliases: ['GraphQL'] },
  { name: 'WebSockets', aliases: ['WebSocket', 'WebSockets', 'Socket.IO'] },
  { name: 'Jest', aliases: ['Jest'] },
  { name: 'Vitest', aliases: ['Vitest'] },
  { name: 'Cypress', aliases: ['Cypress'] },
  { name: 'Playwright', aliases: ['Playwright'] },
  { name: 'Testing Library', aliases: ['Testing Library', 'React Testing Library'] },
  { name: 'Accessibility', aliases: ['accessibility', 'accessible design', 'WCAG', 'ARIA'] },
  { name: 'Responsive design', aliases: ['responsive design', 'mobile-first design'] },
  { name: 'Web performance', aliases: ['web performance', 'performance optimization', 'Core Web Vitals'] },
  { name: 'Git', aliases: ['Git', 'GitHub', 'GitLab'] },
  { name: 'Figma', aliases: ['Figma'] },
  { name: 'Python', aliases: ['Python'] },
  { name: 'Java', aliases: ['Java'] },
  { name: 'C#', aliases: ['C#', 'C Sharp'] },
  { name: 'PHP', aliases: ['PHP'] },
  { name: 'SQL', aliases: ['SQL'] },
  { name: 'MongoDB', aliases: ['MongoDB', 'Mongo DB'] },
  { name: 'PostgreSQL', aliases: ['PostgreSQL', 'Postgres'] },
  { name: 'MySQL', aliases: ['MySQL'] },
  { name: 'Redis', aliases: ['Redis'] },
  { name: 'AWS', aliases: ['AWS', 'Amazon Web Services'] },
  { name: 'Microsoft Azure', aliases: ['Microsoft Azure', 'Azure'] },
  { name: 'Google Cloud', aliases: ['Google Cloud Platform', 'Google Cloud', 'GCP'] },
  { name: 'Docker', aliases: ['Docker'] },
  { name: 'Kubernetes', aliases: ['Kubernetes', 'K8s'] },
  { name: 'CI/CD', aliases: ['CI/CD', 'continuous integration', 'continuous delivery', 'continuous deployment'] },
  { name: 'Agile', aliases: ['Agile'] },
  { name: 'Scrum', aliases: ['Scrum'] },
  { name: 'Communication', aliases: ['communication skills', 'written communication', 'verbal communication'] },
  { name: 'Problem solving', aliases: ['problem solving', 'problem-solving', 'analytical skills'] },
  { name: 'Team collaboration', aliases: ['team collaboration', 'collaboration skills', 'cross-functional collaboration'] },
  { name: 'Leadership', aliases: ['leadership', 'mentoring'] },
]

const requiredCues = /\b(required|required qualification|required skill|must[- ]have|must|required to|mandatory|minimum|essential|proficien(?:t|cy)|at least)\b/i
const preferredCues = /\b(preferred|nice to have|bonus|a plus|desirable|ideally|beneficial)\b/i
const requiredHeadings = /\b(requirements?|qualifications?|required skills?|what you(?:'|’)ll need|what you bring|minimum qualifications?)\b/i
const preferredHeadings = /\b(preferred qualifications?|preferred skills?|nice to have|bonus skills?|desired skills?)\b/i

const degreeLevels = [
  { name: 'High school diploma', level: 1, aliases: ['high school diploma', 'high school'] },
  { name: 'Associate degree', level: 2, aliases: ['associate degree', 'associate’s degree', 'associate\'s degree'] },
  { name: 'Bachelor’s degree', level: 3, aliases: ['bachelor', 'bachelor’s', 'bachelor\'s', 'b.tech', 'btech', 'b.e.', 'b.e', 'bsc', 'b.sc', 'b.s.', 'b.a.', 'undergraduate degree'] },
  { name: 'Master’s degree', level: 4, aliases: ['master', 'master’s', 'master\'s', 'm.tech', 'mtech', 'm.sc', 'msc', 'm.s.', 'mba', 'postgraduate degree'] },
  { name: 'Doctoral degree', level: 5, aliases: ['ph.d', 'phd', 'doctorate', 'doctoral degree'] },
]

const weights: Record<Importance, number> = { required: 5, preferred: 2, inferred: 1 }
const coverage = { evidenced: 1, partial: 0.5, missing: 0, confirm: 0 }

function termPattern(term: string) {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  const left = /^[a-z0-9]/i.test(term) ? '\\b' : ''
  const right = /[a-z0-9]$/i.test(term) ? '\\b' : ''
  return new RegExp(`${left}${escaped}${right}`, 'i')
}

function findEvidence(text: string, aliases: string[]) {
  const sortedAliases = [...aliases].sort((a, b) => b.length - a.length)
  for (const line of text.split(/\r?\n/).map((part) => part.trim()).filter(Boolean)) {
    const alias = sortedAliases.find((candidate) => termPattern(candidate).test(line))
    if (!alias) continue
    if (line.length <= 500) return line
    const index = line.toLowerCase().indexOf(alias.toLowerCase())
    const start = Math.max(0, index - 180)
    return line.slice(start, Math.min(line.length, start + 420)).trim()
  }
  const sentences = text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean)
  return sentences.find((sentence) => sortedAliases.some((alias) => termPattern(alias).test(sentence)))?.slice(0, 500) ?? ''
}

function findYearsEvidence(text: string, patternSource: string) {
  const candidates = [
    ...text.split(/\r?\n/),
    ...text.split(/(?<=[.!?])\s+/),
  ].map((part) => part.trim()).filter(Boolean)
  for (const candidate of candidates) {
    const match = new RegExp(patternSource, 'i').exec(candidate)
    if (!match) continue
    if (candidate.length <= 500) return candidate
    const start = Math.max(0, match.index - 180)
    return candidate.slice(start, Math.min(candidate.length, start + 420)).trim()
  }
  return ''
}

function splitChunks(text: string) {
  const chunks: Array<{ text: string; sectionImportance: Importance }> = []
  let sectionImportance: Importance = 'inferred'
  for (const line of text.split(/\r?\n/).map((part) => part.trim()).filter(Boolean)) {
    if (line.length <= 100 && !/[.!?]$/.test(line)) {
      if (preferredHeadings.test(line)) sectionImportance = 'preferred'
      else if (requiredHeadings.test(line)) sectionImportance = 'required'
      else if (/\b(responsibilities|what you will do|about the role)\b/i.test(line)) sectionImportance = 'inferred'
    }
    const sentences = line.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean)
    for (const sentence of sentences) chunks.push({ text: sentence, sectionImportance })
  }
  return chunks
}

function getImportance(text: string, sectionImportance: Importance, sourceImportance: Importance) {
  if (preferredCues.test(text)) return 'preferred'
  if (requiredCues.test(text)) return 'required'
  if (sectionImportance === 'required' || sectionImportance === 'preferred') return sectionImportance
  return sourceImportance
}

function createSkillRequirements(jobDescription: string, additionalInfo: string, jobTitle: string, companyDescription: string, resume: string): Requirement[] {
  const jobChunks = [
    ...splitChunks(jobDescription).map((chunk) => ({ ...chunk, sourceImportance: 'inferred' as Importance })),
    ...splitChunks(additionalInfo).map((chunk) => ({ ...chunk, sourceImportance: 'inferred' as Importance })),
    ...splitChunks(jobTitle).map((chunk) => ({ ...chunk, sourceImportance: 'inferred' as Importance })),
    ...splitChunks(companyDescription).map((chunk) => ({ ...chunk, sourceImportance: 'inferred' as Importance })),
  ]

  const requirements: Requirement[] = []
  for (const skill of skillCatalog) {
    const mentions = jobChunks.filter(({ text }) => skill.aliases.some((alias) => termPattern(alias).test(text)))
    if (!mentions.length) continue
    const importances = mentions.map(({ text, sectionImportance, sourceImportance }) => getImportance(text, sectionImportance, sourceImportance))
    const importance = importances.includes('required') ? 'required' : importances.includes('preferred') ? 'preferred' : 'inferred'
    const resumeEvidence = findEvidence(resume, skill.aliases)
    let status: Requirement['status'] = resumeEvidence ? 'evidenced' : 'missing'
    let partialEvidence: string[] = []
    if (!resumeEvidence && skill.related?.length) {
      for (const relatedName of skill.related) {
        const relatedSkill = skillCatalog.find((candidate) => candidate.name === relatedName)
        const relatedEvidence = relatedSkill ? findEvidence(resume, relatedSkill.aliases) : ''
        if (relatedEvidence) {
          status = 'partial'
          partialEvidence = [relatedEvidence]
          break
        }
      }
    }
    const jobEvidence = mentions.slice(0, 2).map(({ text }) => text.slice(0, 500))
    const recommendation = status === 'evidenced'
      ? `Your resume mentions ${skill.name}. Keep the clearest example in the relevant skills, project, or experience section.`
      : status === 'partial'
        ? `Your resume mentions a related technology, but not ${skill.name} by name. If you have used ${skill.name}, add a truthful example; otherwise treat this as a learning gap.`
        : `${skill.name} was not found in the resume text. Add it only if you have this skill and can support it with a real example; otherwise treat it as a gap.`
    requirements.push({
      name: skill.name,
      category: 'skill',
      importance,
      status,
      resumeEvidence: resumeEvidence ? [resumeEvidence] : partialEvidence,
      jobEvidence,
      recommendation,
    })
  }
  return requirements
}

function createExperienceRequirement(jobDescription: string, additionalInfo: string, resume: string): Requirement[] {
  const yearsPattern = /\b(\d{1,2})\+?\s+years?\s+(?:of\s+)?(?:[\w+#./-]+\s+){0,3}experience\b/gi
  const requestedYears = [jobDescription, additionalInfo].flatMap((text) => splitChunks(text).flatMap(({ text: chunk, sectionImportance }) =>
    [...chunk.matchAll(yearsPattern)].map((match) => ({
      years: Number(match[1]),
      evidence: chunk,
      importance: getImportance(chunk, sectionImportance, 'inferred'),
    })),
  ))
  if (!requestedYears.length) return []
  const requiredYears = requestedYears.filter((item) => item.importance === 'required')
  const prioritizedYears = requiredYears.length ? requiredYears : requestedYears.filter((item) => item.importance === 'preferred')
  const selectedYears = prioritizedYears.length ? prioritizedYears : requestedYears
  const minimumYears = Math.max(...selectedYears.map((item) => item.years))
  const evidence = findYearsEvidence(resume, yearsPattern.source)
  const resumeYears = [...resume.matchAll(yearsPattern)].map((match) => Number(match[1]))
  let status: Requirement['status'] = 'confirm'
  if (resumeYears.length) status = Math.max(...resumeYears) >= minimumYears ? 'evidenced' : 'missing'
  const resumeEvidence = evidence ? [evidence] : []
  return [{
    name: `${minimumYears}+ years of experience`,
    category: 'experience',
    importance: selectedYears.some((item) => item.importance === 'required') ? 'required' : selectedYears.some((item) => item.importance === 'preferred') ? 'preferred' : 'inferred',
    status,
    resumeEvidence,
    jobEvidence: selectedYears.slice(0, 2).map((item) => item.evidence),
    recommendation: status === 'evidenced'
      ? `Your resume explicitly states at least ${minimumYears} years of experience.`
      : status === 'missing'
        ? `Your resume states fewer than ${minimumYears} years. Check the dates and describe your experience accurately; do not change the number to match the job post.`
        : `The job asks for ${minimumYears}+ years, but the resume does not state a total number of years. Review the dates and add a supported total only if accurate.`,
  }]
}

function createEducationRequirements(jobDescription: string, additionalInfo: string, resume: string): Requirement[] {
  const jobText = `${jobDescription}\n${additionalInfo}`
  const requested = degreeLevels.filter((degree) => degree.aliases.some((alias) => termPattern(alias).test(jobText)))
  if (!requested.length) return []
  const highestRequested = requested.reduce((highest, degree) => degree.level > highest.level ? degree : highest)
  const degreeContext = splitChunks(jobText).find(({ text }) => highestRequested.aliases.some((alias) => termPattern(alias).test(text)))
  const resumeDegrees = degreeLevels.filter((degree) => degree.aliases.some((alias) => termPattern(alias).test(resume)))
  const highestResume = resumeDegrees.reduce<{ level: number; name: string } | null>((highest, degree) => !highest || degree.level > highest.level ? degree : highest, null)
  const resumeEvidence = highestResume ? [findEvidence(resume, degreeLevels.find((degree) => degree.name === highestResume.name)?.aliases ?? [])].filter(Boolean) : []
  const status: Requirement['status'] = !highestResume ? 'missing' : highestResume.level >= highestRequested.level ? 'evidenced' : 'missing'
  return [{
    name: highestRequested.name,
    category: 'education',
    importance: degreeContext ? getImportance(degreeContext.text, degreeContext.sectionImportance, 'inferred') : 'inferred',
    status,
    resumeEvidence,
    jobEvidence: [findEvidence(jobText, highestRequested.aliases)].filter(Boolean),
    recommendation: status === 'evidenced'
      ? `Your resume lists ${highestResume?.name}, which meets or exceeds the listed degree level.`
      : `The job lists ${highestRequested.name}. The resume does not show that level; verify the requirement and list your education accurately.`,
  }]
}

export function resumeHash(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function analyzeJobWithRules(input: {
  resume: string
  jobDescription: string
  companyDescription?: string
  additionalInfo?: string
  jobTitle?: string
}): JobAnalysis {
  const requirements = [
    ...createSkillRequirements(input.jobDescription, input.additionalInfo ?? '', input.jobTitle ?? '', input.companyDescription ?? '', input.resume),
    ...createExperienceRequirement(input.jobDescription, input.additionalInfo ?? '', input.resume),
    ...createEducationRequirements(input.jobDescription, input.additionalInfo ?? '', input.resume),
  ]
  const totalWeight = requirements.reduce((sum, requirement) => sum + weights[requirement.importance], 0)
  const earnedWeight = requirements.reduce((sum, requirement) => sum + weights[requirement.importance] * coverage[requirement.status], 0)
  const score = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0
  const evidenced = requirements.filter((requirement) => requirement.status === 'evidenced')
  const requiredGaps = requirements.filter((requirement) => requirement.importance === 'required' && requirement.status !== 'evidenced')
  const partialCount = requirements.filter((requirement) => requirement.status === 'partial').length
  const summary = requirements.length
    ? `${evidenced.length} of ${requirements.length} listed requirements are explicitly supported by the resume${partialCount ? `; ${partialCount} have related evidence` : ''}${requiredGaps.length ? `; ${requiredGaps.length} required item(s) need review` : ''}.`
    : 'No supported skills, experience, or education requirements were recognized in the supplied job text. The rule set may not cover every term in this posting.'
  const recommendedEdits = requirements
    .filter((requirement) => requirement.status !== 'evidenced')
    .sort((a, b) => weights[b.importance] - weights[a.importance])
    .slice(0, 30)
    .map((requirement) => ({
      section: requirement.category === 'education' ? 'education' as const : requirement.category === 'experience' ? 'experience' as const : 'skills' as const,
      priority: requirement.importance === 'required' ? 'high' as const : requirement.importance === 'preferred' ? 'medium' as const : 'low' as const,
      recommendation: requirement.recommendation,
      sourceRequirement: requirement.name,
      resumeEvidence: requirement.resumeEvidence,
    }))

  return {
    method: 'rules-v1',
    score,
    scoreMethod: 'Rule-based weighted coverage: required items weigh 5, preferred 2, and other mentions 1; explicit resume evidence earns full credit, related evidence earns half, and missing or unconfirmed items earn none. This is a comparison aid, not a hiring probability.',
    summary,
    strengths: evidenced.slice(0, 12).map((requirement) => `${requirement.name} is explicitly mentioned in your resume.`),
    requirements,
    recommendedEdits,
    analyzedAt: new Date().toISOString(),
    resumeContentHash: resumeHash(input.resume),
  }
}
