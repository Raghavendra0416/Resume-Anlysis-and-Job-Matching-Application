import { useState } from 'react'
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
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'My resume', to: '/resume', icon: FileText },
  { label: 'Compare a job', to: '/compare', icon: Target },
  { label: 'Job insights', to: '/insights', icon: TrendingUp },
]

function Sidebar() {
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
        <button className="profile-button"><div className="avatar">Y</div><div className="profile-copy"><strong>Your workspace</strong><span>Personal account</span></div><ChevronDown size={16} /></button>
      </div>
    </aside>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className="page-header"><div><div className="eyebrow">YOUR CAREER WORKSPACE</div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="icon-button" aria-label="Settings"><Settings2 size={18} /></button><div className="avatar header-avatar">Y</div></div></header>
}

function Overview() {
  return <>
    <Header title="Good morning" subtitle="A clearer picture of how your experience fits the roles you want." />
    <section className="welcome-card">
      <div className="welcome-copy"><div className="welcome-kicker"><Sparkles size={14} /> YOUR NEXT OPPORTUNITY, IN FOCUS</div><h2>Make your experience<br />work harder for you.</h2><p>Compare your resume with a job description to find the strongest matches, important gaps, and practical next steps.</p><NavLink to="/compare" className="button button-primary">Compare a job <ArrowRight size={16} /></NavLink></div>
      <div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="art-paper"><div className="paper-top"><span></span><span></span><span></span></div><div className="paper-title"></div><div className="paper-line wide"></div><div className="paper-line"></div><div className="paper-section"></div><div className="paper-line wide"></div><div className="paper-line short"></div><div className="paper-check"><Check size={14} /></div></div><div className="art-spark"><Sparkles size={19} /></div></div>
    </section>
    <div className="section-heading"><div><h2>Your workspace</h2><p>The essentials for your job search, all in one place.</p></div></div>
    <section className="stat-grid">
      <article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><FileText size={18} /></span><span className="stat-label">MAIN RESUME</span></div><div className="stat-value">Not added yet</div><p className="stat-foot">Add your resume to get started</p><NavLink to="/resume" className="text-link">Add a resume <ArrowRight size={14} /></NavLink></article>
      <article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><BriefcaseBusiness size={18} /></span><span className="stat-label">JOBS COMPARED</span></div><div className="stat-value">0 <span className="stat-unit">jobs</span></div><p className="stat-foot">Your comparison history</p><NavLink to="/insights" className="text-link">View job insights <ArrowRight size={14} /></NavLink></article>
      <article className="stat-card"><div className="stat-top"><span className="stat-icon green"><TrendingUp size={18} /></span><span className="stat-label">TOP SKILL GAP</span></div><div className="stat-value">—</div><p className="stat-foot">Patterns across your saved jobs</p><NavLink to="/insights" className="text-link">Explore insights <ArrowRight size={14} /></NavLink></article>
    </section>
    <section className="lower-grid"><article className="panel recent-panel"><div className="panel-heading"><div><h2>Recent comparisons</h2><p>Your saved job analyses will appear here.</p></div><NavLink to="/insights" className="subtle-link">View all <ArrowRight size={14} /></NavLink></div><div className="empty-state"><div className="empty-icon"><BriefcaseBusiness size={20} /></div><strong>No comparisons yet</strong><span>Start with a job you’re interested in.</span><NavLink to="/compare" className="button button-secondary"><Plus size={16} /> New comparison</NavLink></div></article><article className="panel checklist-panel"><div className="panel-heading"><div><h2>Getting started</h2><p>A few steps to make this workspace yours.</p></div></div><div className="checklist"><div className="check-row"><span className="check-dot"><Check size={13} /></span><div><strong>Set up your workspace</strong><span>You’re ready to begin</span></div></div><div className="check-row"><span className="check-dot pending"></span><div><strong>Add your main resume</strong><span>Keep it as your source of truth</span></div></div><div className="check-row"><span className="check-dot pending"></span><div><strong>Compare your first job</strong><span>See where your experience fits</span></div></div></div></article></section>
    <footer className="privacy-note"><span className="privacy-dot"></span>Your resume stays yours. Tailored versions never replace your original.</footer>
  </>
}

function ResumePage() {
  return <><Header title="My resume" subtitle="Your main resume is the source of truth for every job comparison." /><section className="page-intro-card"><div className="intro-icon"><FileText size={20} /></div><div><h2>One reliable source of truth</h2><p>Save your resume as text. We’ll preserve its sections and line breaks when preparing a tailored draft.</p></div></section><section className="panel form-panel"><div className="panel-heading"><div><h2>Main resume</h2><p>Your original resume is never replaced by a tailored version.</p></div><span className="status-pill muted">Not set up</span></div><label className="field-label" htmlFor="resume-text">Resume content</label><textarea id="resume-text" className="text-area resume-area" placeholder={'Paste your resume here…\n\nInclude your summary, skills, experience, education, and other sections.'} /><div className="form-footer"><span>Plain text is supported. Keep your headings and bullets.</span><button className="button button-primary" disabled><Check size={16} /> Save main resume</button></div></section><div className="note-box"><CircleHelp size={17} /><p><strong>A note about skill suggestions</strong><br />A skill missing from your resume will be flagged for review. You’ll confirm it before it can be included in a tailored version.</p></div></>
}

function ComparePage() {
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  return <><Header title="Compare a job" subtitle="Understand how your experience aligns with a role before you tailor your resume." /><div className="step-indicator"><span className="step-number">01</span><span>JOB DETAILS & DESCRIPTION</span><span className="step-line"></span><span className="step-next">02&nbsp; REVIEW MATCH</span></div><section className="panel form-panel compare-panel"><div className="panel-heading"><div><h2>Tell us about the role</h2><p>Company name and job description are required. The rest is optional.</p></div><span className="required-note">* Required</span></div><div className="field-grid"><div className="field"><label className="field-label" htmlFor="company">Company name <span>*</span></label><input id="company" className="text-input" placeholder="e.g. Acme Inc." /></div><div className="field"><label className="field-label" htmlFor="job-title">Job title <span className="optional">Optional</span></label><input id="job-title" className="text-input" placeholder="e.g. Frontend Developer" /></div></div><div className="field"><label className="field-label" htmlFor="job-description">Job description <span>*</span></label><textarea id="job-description" className="text-area jd-area" placeholder="Paste the full job description here. Include responsibilities and qualifications for a more complete comparison." /><span className="field-hint">Include required qualifications and responsibilities where available.</span></div><button className="optional-toggle" onClick={() => setShowCompanyDetails(!showCompanyDetails)} aria-expanded={showCompanyDetails}><Plus size={15} className={showCompanyDetails ? 'rotated' : ''} /> Add optional company details <ChevronDown size={15} className={showCompanyDetails ? 'rotated' : ''} /></button>{showCompanyDetails && <div className="field"><label className="field-label" htmlFor="company-description">Company description <span className="optional">Optional</span></label><textarea id="company-description" className="text-area company-area" placeholder="What does the company do? Add context that could help you understand the role." /></div>}<div className="form-footer"><span className="privacy-hint"><span className="privacy-dot"></span>Your data is saved to your private workspace.</span><button className="button button-primary" disabled>Analyze this job <Sparkles size={16} /></button></div></section><div className="analysis-disclaimer"><Sparkles size={16} /><span>Suggestions will be grounded in your resume. You’ll confirm any missing skill before it can be added.</span></div></>
}

function InsightsPage() {
  return <><Header title="Job insights" subtitle="Spot patterns across the roles you’ve researched and the skills they ask for." /><div className="insight-callout"><div className="callout-icon"><TrendingUp size={18} /></div><div><strong>Your job search, in perspective</strong><p>As you save comparisons, we’ll surface recurring skills, common gaps, and trends by company or title.</p></div></div><section className="stat-grid insights-stats"><article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><BriefcaseBusiness size={18} /></span><span className="stat-label">SAVED JOBS</span></div><div className="stat-value">0</div><p className="stat-foot">Roles in your comparison history</p></article><article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><Sparkles size={18} /></span><span className="stat-label">MOST REQUESTED SKILL</span></div><div className="stat-value">—</div><p className="stat-foot">Across all saved job descriptions</p></article><article className="stat-card"><div className="stat-top"><span className="stat-icon amber"><ArrowDownRight size={18} /></span><span className="stat-label">COMMON SKILL GAP</span></div><div className="stat-value">—</div><p className="stat-foot">Requirements to review in your resume</p></article></section><div className="section-heading insight-heading"><div><h2>Frequently requested skills</h2><p>Skills ranked by how often they appear in your saved jobs.</p></div></div><section className="panel insight-empty"><div className="empty-state"><div className="empty-icon"><TrendingUp size={20} /></div><strong>Insights will grow with your search</strong><span>Save a few job comparisons to see what employers ask for most.</span><NavLink to="/compare" className="button button-secondary"><Plus size={16} /> Compare a job</NavLink></div></section></>
}

function App() {
  return <div className="app-shell"><Sidebar /><main className="main-area"><Routes><Route path="/" element={<Overview />} /><Route path="/resume" element={<ResumePage />} /><Route path="/compare" element={<ComparePage />} /><Route path="/insights" element={<InsightsPage />} /></Routes></main></div>
}

export default App
