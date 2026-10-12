import { FormEvent, useCallback, useEffect, useState } from 'react'
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Trash2,
} from 'lucide-react'
import { api, JobAnalysis, JobRecord, ResumeRecord } from './lib/api'

const navItems = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'My resume', to: '/resume', icon: FileText },
  { label: 'Compare a job', to: '/compare', icon: Target },
  { label: 'Job insights', to: '/insights', icon: TrendingUp },
]

function Sidebar({ onLogout, busy }: { onLogout: () => void; busy: boolean }) {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>resume<span className="brand-light">studio</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="tip-card"><div className="tip-icon"><CircleHelp size={16} /></div><div><strong>Keep it honest</strong><p>Only add qualifications you can confidently support.</p></div></div>
        <button className="profile-button" onClick={onLogout} disabled={busy} aria-label="Log out">
          <div className="avatar">Y</div><div className="profile-copy"><strong>Your workspace</strong><span>{busy ? 'Logging out…' : 'Log out'}</span></div><LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className="page-header"><div><div className="eyebrow">YOUR CAREER WORKSPACE</div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions"><button className="icon-button" aria-label="Search is coming soon" title="Search is coming soon"><Search size={18} /></button><button className="icon-button" aria-label="Settings are coming soon" title="Settings are coming soon"><Settings2 size={18} /></button><div className="avatar header-avatar">Y</div></div></header>
}

function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="error-notice" role="alert"><span>{message}</span>{onRetry && <button onClick={onRetry} className="text-button">Try again</button>}</div>
}

function LoadingMessage({ label = 'Loading your workspace…' }: { label?: string }) {
  return <div className="loading-message"><span className="loading-spinner" />{label}</div>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function Overview() {
  const [resume, setResume] = useState<ResumeRecord | null>(null)
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [resumeResult, jobsResult] = await Promise.all([api.getResume(), api.getJobs(5)])
      setResume(resumeResult.resume)
      setJobs(jobsResult.jobs)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load your workspace.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return <>
    <Header title="Good morning" subtitle="A clearer picture of how your experience fits the roles you want." />
    <section className="welcome-card">
      <div className="welcome-copy"><div className="welcome-kicker"><Sparkles size={14} /> YOUR NEXT OPPORTUNITY, IN FOCUS</div><h2>Make your experience<br />work harder for you.</h2><p>Compare your resume with a job description to find the strongest matches, important gaps, and practical next steps.</p><NavLink to="/compare" className="button button-primary">Compare a job <ArrowRight size={16} /></NavLink></div>
      <div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="art-paper"><div className="paper-top"><span></span><span></span><span></span></div><div className="paper-title"></div><div className="paper-line wide"></div><div className="paper-line"></div><div className="paper-section"></div><div className="paper-line wide"></div><div className="paper-line short"></div><div className="paper-check"><Check size={14} /></div></div><div className="art-spark"><Sparkles size={19} /></div></div>
    </section>
    <div className="section-heading"><div><h2>Your workspace</h2><p>The essentials for your job search, all in one place.</p></div></div>
    {error && <ErrorNotice message={error} onRetry={() => void load()} />}
    {loading ? <LoadingMessage /> : <>
      <section className="stat-grid">
        <article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><FileText size={18} /></span><span className="stat-label">MAIN RESUME</span></div><div className="stat-value">{resume ? 'Ready' : 'Not added yet'}</div><p className="stat-foot">{resume ? `Last saved ${formatDate(resume.updatedAt)}` : 'Add your resume to get started'}</p><NavLink to="/resume" className="text-link">{resume ? 'Edit resume' : 'Add a resume'} <ArrowRight size={14} /></NavLink></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><BriefcaseBusiness size={18} /></span><span className="stat-label">SAVED JOBS</span></div><div className="stat-value">{jobs.length} <span className="stat-unit">{jobs.length === 1 ? 'job' : 'jobs'}</span></div><p className="stat-foot">Your comparison history</p><NavLink to="/insights" className="text-link">View job insights <ArrowRight size={14} /></NavLink></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon green"><TrendingUp size={18} /></span><span className="stat-label">TOP SKILL GAP</span></div><div className="stat-value">—</div><p className="stat-foot">Available after job analysis</p><NavLink to="/insights" className="text-link">Explore insights <ArrowRight size={14} /></NavLink></article>
      </section>
      <section className="lower-grid"><article className="panel recent-panel"><div className="panel-heading"><div><h2>Recent jobs</h2><p>Your saved job descriptions and analyses.</p></div><NavLink to="/insights" className="subtle-link">View all <ArrowRight size={14} /></NavLink></div>{jobs.length ? <JobList jobs={jobs} /> : <div className="empty-state"><div className="empty-icon"><BriefcaseBusiness size={20} /></div><strong>No jobs saved yet</strong><span>Start with a job you’re interested in.</span><NavLink to="/compare" className="button button-secondary"><Plus size={16} /> New comparison</NavLink></div>}</article><article className="panel checklist-panel"><div className="panel-heading"><div><h2>Getting started</h2><p>A few steps to make this workspace yours.</p></div></div><div className="checklist"><div className="check-row"><span className="check-dot"><Check size={13} /></span><div><strong>Set up your workspace</strong><span>You’re ready to begin</span></div></div><div className="check-row"><span className={`check-dot${resume ? '' : ' pending'}`}>{resume && <Check size={13} />}</span><div><strong>Add your main resume</strong><span>{resume ? 'Your source of truth is saved' : 'Keep it as your source of truth'}</span></div></div><div className="check-row"><span className={`check-dot${jobs.length ? '' : ' pending'}`}>{jobs.length > 0 && <Check size={13} />}</span><div><strong>Save your first job</strong><span>{jobs.length ? `${jobs.length} saved so far` : 'Compare it with your resume'}</span></div></div></div></article></section>
    </>}
    <footer className="privacy-note"><span className="privacy-dot"></span>Your resume stays yours. Tailored versions never replace your original.</footer>
  </>
}

function ResumePage() {
  const [content, setContent] = useState('')
  const [resume, setResume] = useState<ResumeRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getResume()
      setResume(result.resume)
      setContent(result.resume?.content ?? '')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the resume.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function save(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)
    try {
      const result = await api.saveResume(content)
      setResume(result.resume)
      setMessage('Your main resume has been saved.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save the resume.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!window.confirm('Delete your main resume? Saved job descriptions will remain, but comparisons will need to be rerun.')) return
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await api.deleteResume()
      setResume(null)
      setContent('')
      setMessage('Your main resume was deleted.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete the resume.')
    } finally {
      setSaving(false)
    }
  }

  return <><Header title="My resume" subtitle="Your main resume is the source of truth for every job comparison." /><section className="page-intro-card"><div className="intro-icon"><FileText size={20} /></div><div><h2>One reliable source of truth</h2><p>Save your resume as text. We’ll preserve its sections and line breaks when preparing a tailored draft.</p></div></section>{error && <ErrorNotice message={error} onRetry={() => void load()} />}{message && <div className="success-notice" role="status">{message}</div>}{loading ? <LoadingMessage label="Loading your main resume…" /> : <form className="panel form-panel" onSubmit={save}><div className="panel-heading"><div><h2>Main resume</h2><p>Your original resume is never replaced by a tailored version.</p></div><span className={`status-pill ${resume ? 'saved' : 'muted'}`}>{resume ? 'Saved' : 'Not set up'}</span></div><label className="field-label" htmlFor="resume-text">Resume content</label><textarea id="resume-text" className="text-area resume-area" maxLength={50000} value={content} onChange={(event) => setContent(event.target.value)} placeholder={'Paste your resume here…\n\nInclude your summary, skills, experience, education, and other sections.'} required /><div className="form-footer"><span>{content.length.toLocaleString()} / 50,000 characters · Line breaks are preserved.</span><div className="button-row">{resume && <button type="button" className="button button-danger-quiet" onClick={() => void remove()} disabled={saving}><Trash2 size={15} /> Delete</button>}<button className="button button-primary" disabled={saving || !content.trim()}><Check size={16} /> {saving ? 'Saving…' : 'Save main resume'}</button></div></div></form>}<div className="note-box"><CircleHelp size={17} /><p><strong>A note about skill suggestions</strong><br />A skill missing from your resume will be flagged for review. You’ll confirm it before it can be included in a tailored version.</p></div></>
}

function ComparePage() {
  const navigate = useNavigate()
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [hasResume, setHasResume] = useState<boolean | null>(null)
  const [checkingResume, setCheckingResume] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedJob, setSavedJob] = useState<JobRecord | null>(null)
  const [error, setError] = useState('')

  const checkResume = useCallback(async () => {
    setCheckingResume(true)
    try {
      const result = await api.getResume()
      setHasResume(Boolean(result.resume))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not check your main resume.')
    } finally {
      setCheckingResume(false)
    }
  }, [])
  useEffect(() => { void checkResume() }, [checkResume])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSavedJob(null)
    setSaving(true)
    try {
      const result = await api.createJob({
        companyName,
        ...(jobTitle.trim() && { jobTitle }),
        ...(companyDescription.trim() && { companyDescription }),
        ...(additionalInfo.trim() && { additionalInfo }),
        jobDescription,
      })
      setSavedJob(result.job)
      try {
        const analysis = await api.analyzeJob(result.job._id)
        navigate(`/jobs/${analysis.job._id}`)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'The job was saved, but the comparison could not be completed.')
      }
      setCompanyName('')
      setJobTitle('')
      setCompanyDescription('')
      setAdditionalInfo('')
      setJobDescription('')
      navigate(`/jobs/${result.job._id}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this job.')
    } finally {
      setSaving(false)
    }
  }

  return <><Header title="Compare a job" subtitle="Compare your main resume with a job using fixed, explainable matching rules." /><div className="step-indicator"><span className="step-number">01</span><span>JOB DETAILS & DESCRIPTION</span></div>{checkingResume ? <LoadingMessage label="Checking your main resume…" /> : !hasResume ? <div className="resume-required"><div className="intro-icon"><FileText size={20} /></div><div><strong>Add your main resume first</strong><p>Comparisons use your saved resume as their source of truth.</p><NavLink to="/resume" className="button button-primary">Go to My Resume <ArrowRight size={15} /></NavLink></div></div> : <form className="panel form-panel compare-panel" onSubmit={submit}><div className="panel-heading"><div><h2>Tell us about the role</h2><p>Company name and job description are required. The rest is optional.</p></div><span className="required-note">* Required</span></div><div className="field-grid"><div className="field"><label className="field-label" htmlFor="company">Company name <span>*</span></label><input id="company" className="text-input" maxLength={160} value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="e.g. Acme Inc." required /></div><div className="field"><label className="field-label" htmlFor="job-title">Job title <span className="optional">Optional</span></label><input id="job-title" className="text-input" maxLength={160} value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="e.g. Frontend Developer" /></div></div><div className="field"><label className="field-label" htmlFor="job-description">Job description <span>*</span></label><textarea id="job-description" className="text-area jd-area" maxLength={30000} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the full job description here. Include responsibilities and qualifications for a more complete comparison." required /><span className="field-hint">{jobDescription.length.toLocaleString()} / 30,000 characters. Include required qualifications and responsibilities where available.</span></div><button type="button" className="optional-toggle" onClick={() => setShowCompanyDetails(!showCompanyDetails)} aria-expanded={showCompanyDetails}><Plus size={15} className={showCompanyDetails ? 'rotated' : ''} /> Add optional company details <ChevronDown size={15} className={showCompanyDetails ? 'rotated' : ''} /></button>{showCompanyDetails && <div className="optional-fields"><div className="field"><label className="field-label" htmlFor="company-description">Company description <span className="optional">Optional</span></label><textarea id="company-description" className="text-area company-area" maxLength={5000} value={companyDescription} onChange={(event) => setCompanyDescription(event.target.value)} placeholder="What does the company do? Add context that could help you understand the role." /></div><div className="field"><label className="field-label" htmlFor="additional-info">Other job information <span className="optional">Optional</span></label><textarea id="additional-info" className="text-area company-area" maxLength={5000} value={additionalInfo} onChange={(event) => setAdditionalInfo(event.target.value)} placeholder="Paste any other useful details, such as benefits, location, or application notes." /></div></div>}<div className="form-footer"><span className="privacy-hint"><span className="privacy-dot"></span>Your resume and job text are sent to your configured app server and stored in MongoDB; no AI service is used.</span><button className="button button-primary" disabled={saving || !companyName.trim() || !jobDescription.trim()}>{saving ? 'Comparing…' : 'Compare resume with this job'} <ArrowRight size={16} /></button></div></form>}{error && <ErrorNotice message={error} />}{savedJob && <div className="success-notice saved-job-notice" role="status"><Check size={16} /><span><strong>{savedJob.companyName}</strong> was saved.</span><NavLink to={`/jobs/${savedJob._id}`} className="text-link">Open saved job <ArrowRight size={14} /></NavLink></div>}<div className="analysis-disclaimer"><Sparkles size={16} /><span>Rule-based comparison scans the whole resume and cites matching text. It cannot promise a hiring outcome.</span></div></>
}

function JobAnalysisPage() {
  const { jobId = '' } = useParams()
  const [job, setJob] = useState<JobRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getJob(jobId)
      setJob(result.job)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load this comparison.')
    } finally {
      setLoading(false)
    }
  }, [jobId])
  useEffect(() => { void load() }, [load])

  async function analyze(force = false) {
    setAnalyzing(true)
    setError('')
    try {
      const result = await api.analyzeJob(jobId, force)
      setJob(result.job)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not compare this job with your resume.')
    } finally {
      setAnalyzing(false)
    }
  }

  const analysis: JobAnalysis | null = job?.analysis ?? null
  const requiredGaps = analysis?.requirements.filter((requirement) => requirement.importance === 'required' && requirement.status !== 'evidenced') ?? []
  const statusLabel = { evidenced: 'In resume', partial: 'Partly supported', missing: 'Missing', confirm: 'Needs your review' }
  return <><Header title={job ? `${job.companyName} comparison` : 'Job comparison'} subtitle={job?.jobTitle || 'Resume and job description analysis'} />{loading ? <LoadingMessage label="Loading your comparison…" /> : error && !job ? <ErrorNotice message={error} onRetry={() => void load()} /> : job && <>
    {error && <ErrorNotice message={error} />}
    {!analysis ? <section className="panel analysis-empty"><div className="intro-icon"><FileText size={20} /></div><h2>Compare your resume with this job</h2><p>See which listed skills and qualifications appear in your resume, with the matching text and gaps to review.</p><button className="button button-primary" onClick={() => void analyze()} disabled={analyzing}>{analyzing ? 'Comparing…' : 'Run rule-based comparison'} <ArrowRight size={15} /></button></section> : <>
      <section className="analysis-hero"><div><span className="analysis-kicker">WEIGHTED REQUIREMENT COVERAGE</span><div className="analysis-score">{analysis.score}<span>%</span></div><p>{analysis.summary}</p><small>{analysis.scoreMethod}</small></div><div className="analysis-hero-actions"><button className="button button-secondary" onClick={() => void analyze(true)} disabled={analyzing}>{analyzing ? 'Comparing…' : 'Re-run rules'}</button><NavLink to="/resume" className="text-link">Update main resume <ArrowRight size={14} /></NavLink></div></section>
      <section className="panel analysis-section"><div className="panel-heading"><div><h2>Required items the job calls out</h2><p>These were marked required from the job wording. Address a gap only if it accurately reflects your experience; this list cannot predict hiring decisions.</p></div></div>{requiredGaps.length ? <div className="requirement-list">{requiredGaps.map((requirement) => <article className="requirement-card" key={requirement.name}><div className="requirement-heading"><div><strong>{requirement.name}</strong><span className="requirement-meta">{requirement.category}</span></div><span className={`requirement-status ${requirement.status}`}>{statusLabel[requirement.status]}</span></div><p>{requirement.recommendation}</p></article>)}</div> : <p className="empty-inline">No missing items marked required were detected in the job text. Check preferred and inferred criteria below too.</p>}</section>
      {analysis.strengths.length > 0 && <section className="panel analysis-section"><div className="panel-heading"><div><h2>Where you align</h2><p>Strengths supported by your resume.</p></div></div><ul className="strength-list">{analysis.strengths.map((strength, index) => <li key={`${strength}-${index}`}><Check size={15} />{strength}</li>)}</ul></section>}
      <section className="panel analysis-section"><div className="panel-heading"><div><h2>Job requirements</h2><p>Review each requirement and the evidence the comparison found.</p></div></div><div className="requirement-list">{analysis.requirements.map((requirement, index) => <article className="requirement-card" key={`${requirement.name}-${index}`}><div className="requirement-heading"><div><strong>{requirement.name}</strong><span className="requirement-meta">{requirement.category} · {requirement.importance}</span></div><span className={`requirement-status ${requirement.status}`}>{statusLabel[requirement.status]}</span></div>{requirement.resumeEvidence.length > 0 && <div className="evidence"><b>Resume evidence</b>{requirement.resumeEvidence.map((quote, i) => <blockquote key={i}>“{quote}”</blockquote>)}</div>}{requirement.jobEvidence.length > 0 && <div className="evidence"><b>Job description</b>{requirement.jobEvidence.map((quote, i) => <blockquote key={i}>“{quote}”</blockquote>)}</div>}<p>{requirement.recommendation}</p></article>)}</div></section>
      <section className="panel analysis-section"><div className="panel-heading"><div><h2>Resume changes to consider</h2><p>Suggestions may reflect skills that are absent today. Add a qualification only if you can honestly support it.</p></div></div>{analysis.recommendedEdits.length ? <div className="edit-list">{analysis.recommendedEdits.map((edit, index) => <article className="edit-card" key={`${edit.sourceRequirement}-${index}`}><div className="edit-card-top"><span>{edit.section}</span><span className={`edit-priority ${edit.priority}`}>{edit.priority} priority</span></div><strong>{edit.sourceRequirement}</strong><p>{edit.recommendation}</p>{edit.resumeEvidence.map((quote, i) => <blockquote key={i}>Resume: “{quote}”</blockquote>)}</article>)}</div> : <p className="empty-inline">No resume edits were identified from the current comparison.</p>}</section>
      <div className="note-box"><CircleHelp size={17} /><p><strong>Use your judgment</strong><br />The match score measures weighted coverage of listed requirements, not your chance of being hired. Verify every suggestion, and never claim a skill or experience you do not have. To create a tailored copy, first confirm which changes are accurate.</p></div>
    </>}
    <div className="analysis-disclaimer"><CircleHelp size={16} /><span>{analysis?.method === 'rules-v1' ? 'This result was generated by fixed rules on your configured application server; no AI service received your resume or job text.' : 'This is a historical result created by the previous AI-based version. It remains stored in MongoDB; run the rules above to replace it.'}</span></div>
  </>}</>
}

function JobList({ jobs, onDelete, deletingId }: { jobs: JobRecord[]; onDelete?: (id: string) => void; deletingId?: string }) {
  return <div className="job-list">{jobs.map((job) => <article className="job-row" key={job._id}><div className="job-company-mark">{job.companyName.slice(0, 1).toUpperCase()}</div><div className="job-row-copy"><NavLink to={`/jobs/${job._id}`}><strong>{job.jobTitle || job.companyName}</strong></NavLink><span>{job.jobTitle ? `${job.companyName} · ` : ''}Saved {formatDate(job.createdAt)}</span></div><NavLink to={`/jobs/${job._id}`} className="job-state">{job.analysis?.method === 'rules-v1' ? `${job.analysis.score}% match` : job.analysis ? 'Historical result' : 'Run comparison'}</NavLink>{onDelete && <button className="icon-button delete-job-button" onClick={() => onDelete(job._id)} disabled={deletingId === job._id} aria-label={`Delete ${job.companyName} job`} title="Delete saved job"><Trash2 size={15} /></button>}</article>)}</div>
}

function InsightsPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getJobs(100)
      setJobs(result.jobs)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load saved jobs.')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { void load() }, [load])

  async function removeJob(id: string) {
    const job = jobs.find((item) => item._id === id)
    if (!job || !window.confirm(`Delete the saved job for ${job.companyName}? Any tailored resumes saved for it will also be deleted.`)) return
    setDeletingId(id)
    setError('')
    try {
      await api.deleteJob(id)
      setJobs((current) => current.filter((item) => item._id !== id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete this job.')
    } finally {
      setDeletingId('')
    }
  }

  const analyzedJobs = jobs.filter((job) => job.analysis?.method === 'rules-v1')
  const skillCounts = new Map<string, number>()
  const gapCounts = new Map<string, number>()
  for (const job of analyzedJobs) {
    for (const requirement of job.analysis?.requirements ?? []) {
      if (requirement.category === 'skill') skillCounts.set(requirement.name, (skillCounts.get(requirement.name) ?? 0) + 1)
      if (requirement.category === 'skill' && (requirement.status === 'missing' || requirement.status === 'confirm')) gapCounts.set(requirement.name, (gapCounts.get(requirement.name) ?? 0) + 1)
    }
  }
  const mostRequestedSkill = [...skillCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const commonGap = [...gapCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  return <><Header title="Job insights" subtitle="Spot patterns across the roles you’ve researched and the skills they ask for." /><div className="insight-callout"><div className="callout-icon"><TrendingUp size={18} /></div><div><strong>Your job search, in perspective</strong><p>Counts include completed rule-based comparisons. Historical AI results are excluded.</p></div></div><section className="stat-grid insights-stats"><article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><BriefcaseBusiness size={18} /></span><span className="stat-label">SAVED JOBS</span></div><div className="stat-value">{jobs.length}</div><p className="stat-foot">Roles in your comparison history</p></article><article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><Sparkles size={18} /></span><span className="stat-label">MOST REQUESTED SKILL</span></div><div className="stat-value insight-value">{mostRequestedSkill?.[0] ?? '—'}</div><p className="stat-foot">{mostRequestedSkill ? `Requested by ${mostRequestedSkill[1]} ${mostRequestedSkill[1] === 1 ? 'job' : 'jobs'}` : 'No rule-based comparisons yet'}</p></article><article className="stat-card"><div className="stat-top"><span className="stat-icon amber"><ArrowDownRight size={18} /></span><span className="stat-label">COMMON SKILL GAP</span></div><div className="stat-value insight-value">{commonGap?.[0] ?? '—'}</div><p className="stat-foot">{commonGap ? `Flagged by ${commonGap[1]} ${commonGap[1] === 1 ? 'job' : 'jobs'}` : 'No rule-based comparisons yet'}</p></article></section><div className="section-heading insight-heading"><div><h2>Saved job descriptions</h2><p>Delete a job and its associated tailored resume versions here.</p></div><NavLink to="/compare" className="button button-secondary"><Plus size={15} /> Add a job</NavLink></div>{error && <ErrorNotice message={error} onRetry={() => void load()} />}{loading ? <LoadingMessage label="Loading saved jobs…" /> : jobs.length ? <section className="panel saved-jobs-panel"><JobList jobs={jobs} onDelete={(id) => void removeJob(id)} deletingId={deletingId} />{analyzedJobs.length === 0 && <p className="future-analysis-note">Skill frequency and gap insights will appear after a rule-based comparison.</p>}</section> : <section className="panel insight-empty"><div className="empty-state"><div className="empty-icon"><TrendingUp size={20} /></div><strong>No saved jobs yet</strong><span>Add a job description to start building your comparison history.</span><NavLink to="/compare" className="button button-secondary"><Plus size={16} /> Save a job</NavLink></div></section>}</>
}

function LoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.login(password)
      onAuthenticated()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="login-screen"><section className="login-card"><div className="brand login-brand"><div className="brand-mark"><Sparkles size={17} /></div><span>resume<span className="brand-light">studio</span></span></div><div className="login-icon"><Target size={21} /></div><div className="eyebrow">PRIVATE CAREER WORKSPACE</div><h1>Welcome back</h1><p>Enter your workspace password to continue.</p><form onSubmit={submit}><label className="field-label" htmlFor="workspace-password">Workspace password</label><input id="workspace-password" className="text-input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />{error && <ErrorNotice message={error} />}<button className="button button-primary login-submit" disabled={busy || !password}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} /></button></form><div className="login-foot"><span className="privacy-dot"></span>Your workspace is protected by your server-side password.</div></section></main>
}

function SessionGate() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'error'>('loading')
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  const checkSession = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const result = await api.session()
      setStatus(result.authenticated ? 'authenticated' : 'unauthenticated')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not reach the API.')
      setStatus('error')
    }
  }, [])
  useEffect(() => { void checkSession() }, [checkSession])

  async function logout() {
    setLoggingOut(true)
    try { await api.logout() } catch { /* Expired sessions still return to the login screen. */ }
    setLoggingOut(false)
    setStatus('unauthenticated')
  }

  if (status === 'loading') return <main className="app-state"><LoadingMessage label="Opening your workspace…" /></main>
  if (status === 'error') return <main className="app-state"><div className="app-state-card"><div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>resume<span className="brand-light">studio</span></span></div><h1>Workspace unavailable</h1><ErrorNotice message={error} onRetry={() => void checkSession()} /><p>Start the API with <code>npm run dev:server</code> and make sure <code>VITE_API_BASE_URL</code> points to it.</p></div></main>
  if (status === 'unauthenticated') return <LoginPage onAuthenticated={() => setStatus('authenticated')} />

  return <div className="app-shell"><Sidebar onLogout={() => void logout()} busy={loggingOut} /><main className="main-area"><Routes><Route path="/" element={<Overview />} /><Route path="/resume" element={<ResumePage />} /><Route path="/compare" element={<ComparePage />} /><Route path="/insights" element={<InsightsPage />} /><Route path="/jobs/:jobId" element={<JobAnalysisPage />} /><Route path="*" element={<Overview />} /></Routes></main></div>
}

function App() {
  return <SessionGate />
}

export default App
