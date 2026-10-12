import { FormEvent, useCallback, useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
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
import { api, JobRecord, ResumeRecord } from './lib/api'

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
      setCompanyName('')
      setJobTitle('')
      setCompanyDescription('')
      setAdditionalInfo('')
      setJobDescription('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this job.')
    } finally {
      setSaving(false)
    }
  }

  return <><Header title="Compare a job" subtitle="Understand how your experience aligns with a role before you tailor your resume." /><div className="step-indicator"><span className="step-number">01</span><span>JOB DETAILS & DESCRIPTION</span><span className="step-line"></span><span className="step-next">02&nbsp; REVIEW MATCH</span></div>{checkingResume ? <LoadingMessage label="Checking your main resume…" /> : !hasResume ? <div className="resume-required"><div className="intro-icon"><FileText size={20} /></div><div><strong>Add your main resume first</strong><p>Comparisons use your saved resume as their source of truth.</p><NavLink to="/resume" className="button button-primary">Go to My Resume <ArrowRight size={15} /></NavLink></div></div> : <form className="panel form-panel compare-panel" onSubmit={submit}><div className="panel-heading"><div><h2>Tell us about the role</h2><p>Company name and job description are required. The rest is optional.</p></div><span className="required-note">* Required</span></div><div className="field-grid"><div className="field"><label className="field-label" htmlFor="company">Company name <span>*</span></label><input id="company" className="text-input" maxLength={160} value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="e.g. Acme Inc." required /></div><div className="field"><label className="field-label" htmlFor="job-title">Job title <span className="optional">Optional</span></label><input id="job-title" className="text-input" maxLength={160} value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="e.g. Frontend Developer" /></div></div><div className="field"><label className="field-label" htmlFor="job-description">Job description <span>*</span></label><textarea id="job-description" className="text-area jd-area" maxLength={30000} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the full job description here. Include responsibilities and qualifications for a more complete comparison." required /><span className="field-hint">{jobDescription.length.toLocaleString()} / 30,000 characters. Include required qualifications and responsibilities where available.</span></div><button type="button" className="optional-toggle" onClick={() => setShowCompanyDetails(!showCompanyDetails)} aria-expanded={showCompanyDetails}><Plus size={15} className={showCompanyDetails ? 'rotated' : ''} /> Add optional company details <ChevronDown size={15} className={showCompanyDetails ? 'rotated' : ''} /></button>{showCompanyDetails && <div className="optional-fields"><div className="field"><label className="field-label" htmlFor="company-description">Company description <span className="optional">Optional</span></label><textarea id="company-description" className="text-area company-area" maxLength={5000} value={companyDescription} onChange={(event) => setCompanyDescription(event.target.value)} placeholder="What does the company do? Add context that could help you understand the role." /></div><div className="field"><label className="field-label" htmlFor="additional-info">Other job information <span className="optional">Optional</span></label><textarea id="additional-info" className="text-area company-area" maxLength={5000} value={additionalInfo} onChange={(event) => setAdditionalInfo(event.target.value)} placeholder="Paste any other useful details, such as benefits, location, or application notes." /></div></div>}<div className="form-footer"><span className="privacy-hint"><span className="privacy-dot"></span>Your job details are saved to your private workspace.</span><button className="button button-primary" disabled={saving || !companyName.trim() || !jobDescription.trim()}><>{saving ? 'Saving…' : 'Save job'} <ArrowRight size={16} /></></button></div></form>}{error && <ErrorNotice message={error} onRetry={() => void checkResume()} />}{savedJob && <div className="success-notice saved-job-notice" role="status"><Check size={16} /><span><strong>{savedJob.companyName}</strong> was saved. AI comparison will be available in the next stage.</span><NavLink to="/insights" className="text-link">View saved jobs <ArrowRight size={14} /></NavLink></div>}<div className="analysis-disclaimer"><Sparkles size={16} /><span>When analysis is available, suggestions will be grounded in your resume. You’ll confirm any missing skill before it can be added.</span></div></>
}

function JobList({ jobs, onDelete, deletingId }: { jobs: JobRecord[]; onDelete?: (id: string) => void; deletingId?: string }) {
  return <div className="job-list">{jobs.map((job) => <article className="job-row" key={job._id}><div className="job-company-mark">{job.companyName.slice(0, 1).toUpperCase()}</div><div className="job-row-copy"><strong>{job.jobTitle || job.companyName}</strong><span>{job.jobTitle ? `${job.companyName} · ` : ''}Saved {formatDate(job.createdAt)}</span></div><span className="job-state">{job.analysis ? `${job.analysis.score}% match` : 'Saved · not analyzed'}</span>{onDelete && <button className="icon-button delete-job-button" onClick={() => onDelete(job._id)} disabled={deletingId === job._id} aria-label={`Delete ${job.companyName} job`} title="Delete saved job"><Trash2 size={15} /></button>}</article>)}</div>
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

  const analyzedJobs = jobs.filter((job) => job.analysis)
  return <><Header title="Job insights" subtitle="Spot patterns across the roles you’ve researched and the skills they ask for." /><div className="insight-callout"><div className="callout-icon"><TrendingUp size={18} /></div><div><strong>Your job search, in perspective</strong><p>As you save comparisons, we’ll surface recurring skills, common gaps, and trends by company or title.</p></div></div><section className="stat-grid insights-stats"><article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><BriefcaseBusiness size={18} /></span><span className="stat-label">SAVED JOBS</span></div><div className="stat-value">{jobs.length}</div><p className="stat-foot">Roles in your comparison history</p></article><article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><Sparkles size={18} /></span><span className="stat-label">MOST REQUESTED SKILL</span></div><div className="stat-value">—</div><p className="stat-foot">Available after AI analysis</p></article><article className="stat-card"><div className="stat-top"><span className="stat-icon amber"><ArrowDownRight size={18} /></span><span className="stat-label">COMMON SKILL GAP</span></div><div className="stat-value">—</div><p className="stat-foot">Available after AI analysis</p></article></section><div className="section-heading insight-heading"><div><h2>Saved job descriptions</h2><p>Delete a job and its associated tailored resume versions here.</p></div><NavLink to="/compare" className="button button-secondary"><Plus size={15} /> Add a job</NavLink></div>{error && <ErrorNotice message={error} onRetry={() => void load()} />}{loading ? <LoadingMessage label="Loading saved jobs…" /> : jobs.length ? <section className="panel saved-jobs-panel"><JobList jobs={jobs} onDelete={(id) => void removeJob(id)} deletingId={deletingId} />{analyzedJobs.length === 0 && <p className="future-analysis-note">Saved job records will appear here now. Skill frequency and gap insights will populate after the analysis stage.</p>}</section> : <section className="panel insight-empty"><div className="empty-state"><div className="empty-icon"><TrendingUp size={20} /></div><strong>No saved jobs yet</strong><span>Add a job description to start building your comparison history.</span><NavLink to="/compare" className="button button-secondary"><Plus size={16} /> Save a job</NavLink></div></section>}</>
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

  return <div className="app-shell"><Sidebar onLogout={() => void logout()} busy={loggingOut} /><main className="main-area"><Routes><Route path="/" element={<Overview />} /><Route path="/resume" element={<ResumePage />} /><Route path="/compare" element={<ComparePage />} /><Route path="/insights" element={<InsightsPage />} /><Route path="*" element={<Overview />} /></Routes></main></div>
}

function App() {
  return <SessionGate />
}

export default App
