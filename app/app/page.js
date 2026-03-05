'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Zap, FileText, Users, Map, CheckSquare,
  ChevronRight, Copy, Download, Clock, Trash2, X,
  Plus, MessageCircle, ArrowRight, History, Check,
  LayoutGrid, Target, Trophy, Sparkles, Home,
} from 'lucide-react'

// ─── MODES ─────────────────────────────────────────────────────────────────

const MODES = [
  {
    id: 'prd',
    icon: FileText,
    label: 'PRD',
    description: 'Product Requirements Doc',
    color: '#e8520a',
    placeholder: `Paste your raw notes, meeting transcripts, or product ideas here...\n\nExample:\n"Users keep complaining that onboarding takes too long. Currently 8 steps, 60% drop off at step 4. We need to fix this before Q2. Marketing is running a big campaign and we need better activation. CEO wants DAU up 20%."`
  },
  {
    id: 'stories',
    icon: CheckSquare,
    label: 'User Stories',
    description: 'Sprint-ready Jira tickets',
    color: '#7c6af7',
    placeholder: `Describe the feature or epic you need broken down...\n\nExample:\n"We need to rebuild the notification system. Users should be able to choose which alerts they get, set quiet hours, and we need to add push notifications for mobile. This ties into the Q2 engagement initiative."`
  },
  {
    id: 'stakeholder',
    icon: Users,
    label: 'Stakeholder Update',
    description: 'Executive-ready summary',
    color: '#2dd4bf',
    placeholder: `Paste your status notes, sprint results, or project updates...\n\nExample:\n"Sprint 14 done. Shipped search redesign, fixed 3 critical bugs. Search usage up 34%. Behind on the API docs — pushed to next sprint. Team is 4/5 people, one eng on PTO next week. Blockers: waiting on legal for data sharing agreement."`
  },
  {
    id: 'roadmap',
    icon: Map,
    label: 'Roadmap',
    description: 'Quarterly plan',
    color: '#f59e0b',
    placeholder: `Describe your product goals, team size, and constraints...\n\nExample:\n"We're a 4-person team. Q2 goals: grow DAU 40%, reduce churn, launch API. We're mid-way through the onboarding redesign. Design is a bottleneck."`
  },
]

// ─── EXAMPLES ─────────────────────────────────────────────────────────────

const EXAMPLES = {
  prd: `Users keep complaining that onboarding takes too long. Currently 8 steps, 60% drop off at step 4 (the "invite your team" step). We've been ignoring this for 6 months but now it's blocking the Q2 activation push.

CEO just told us DAU needs to go up 20% by end of Q2. Marketing is running a $500k paid campaign starting April 1st and if activation doesn't improve, we're wasting the spend.

Eng team is 3 people. Design is a bottleneck — Sarah is our only designer and she's finishing the mobile nav redesign until March 20.

My hypothesis: we make the "invite your team" step optional and add a solo quick-start path. We also need better empty states so users see value before they invite anyone.`,

  stories: `We need to rebuild the notification system. The current one was hacked together 2 years ago and it's a mess — users get too many alerts, can't customize anything, and we have no push notifications on mobile.

Key requirements:
- Users can toggle each notification type on/off (new comment, mention, status change, weekly digest)
- Quiet hours setting with timezone support
- Push notifications for mobile (iOS + Android via Firebase)
- Email digest: daily or weekly cadence

This needs to ship before the mobile v2 launch in Q3. Engineering estimate is 3 sprints. Design has wireframes ready.

Main edge cases: users who've turned off all email (still need to show in-app), users in multiple timezones, notification backfill when user re-enables.`,

  stakeholder: `Sprint 14 is done. Here's the raw dump:

Shipped: Search redesign (the new filters + autocomplete), fixed 3 critical bugs (2 related to the iOS data sync issue, 1 race condition in checkout), updated the pricing page copy.

Results: Search usage up 34% week over week. The iOS sync bug was causing ~8% of mobile sessions to fail silently — that's fixed now.

What slipped: API documentation pushed to Sprint 15. We underestimated how much the new auth endpoints need to be documented properly.

Team: 4 of 5 engineers available. Marcus is on PTO next week (planned).

Blockers: Legal needs to sign off on the data sharing agreement before we can launch the Salesforce integration. We've been waiting 3 weeks. This blocks Sprint 16 goals.

Next 2 weeks: Start the onboarding redesign (highest priority), finish API docs, and we're aiming to close the legal thing by EOW.`,

  roadmap: `We're a 4-person product team (me + 3 engineers, 1 designer shared with another team).

Q2 goals from leadership:
- Grow DAU by 40%
- Reduce monthly churn from 8% to 5%
- Launch public API (been promised to enterprise customers for 6 months)

Current state:
- Onboarding redesign is 60% done (biggest activation lever)
- Mobile app is stable but behind web
- Enterprise tier has 12 customers, all asking for API + SSO
- Design is a bottleneck — Priya can do 1 major project per sprint

Constraints:
- Can't hire until Q3
- Two engineers are partially on infra/tech debt work
- Sales team closing 3 enterprise deals that need SSO by May 1st

What I'm worried about: we're trying to do too much. DAU growth and churn reduction pull in different directions at this team size.`,
}

// ─── SYSTEM PROMPTS ─────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  prd: `You are a Principal PM at a top-tier tech company. You write PRDs that ship — not documents that gather dust.

Given raw notes or ideas, produce a complete PRD in markdown. Be specific. Use numbers. Surface tradeoffs. Kill fluff.

# [Product Name] — PRD

## Problem Statement
One sharp paragraph. What's broken, for whom, and what's the cost of not fixing it? Lead with user pain, quantify it.

## Goals & Success Metrics
- Primary metric (the one number that matters)
- 2–3 supporting metrics with baselines and targets
- Anti-metrics (what we're NOT optimizing for)

## User Personas
Who exactly. Not "users" — give them a name, a role, a specific pain point you're solving.

## Scope
**In (v1):** What ships. Be ruthless about what makes the cut.
**Out (explicitly):** What's NOT in scope and why. No "future consideration" hand-waving.

## Functional Requirements
Numbered list. Each requirement is testable — if you can't write an automated test for it, rewrite it.

## Non-Functional Requirements
Performance SLAs, security posture, accessibility (WCAG level), platform support.

## Open Questions
What's unresolved? Who owns the decision? What's the deadline for resolving it?

## Timeline & Milestones
Phases with target dates. Call out dependencies and hard blockers explicitly.

Write like you're presenting to a skeptical VP of Engineering. Every word earns its place.`,

  stories: `You are a senior PM who writes user stories that engineers love to implement and QA can actually test.

Given a feature description, produce 4–6 sprint-ready user stories in markdown. Include edge cases. Cover error states. Think like the engineer implementing it AND the QA engineer testing it.

# [Feature Name] — User Stories

For each story use exactly this format:

## Story N: [Clear, action-oriented title]
**As a** [specific user type with context], **I want to** [specific action], **so that** [concrete, measurable benefit].

**Acceptance Criteria:**
- [ ] [Testable criterion — starts with a verb, describes observable behavior]
- [ ] [Edge case: what happens when X is empty/invalid/missing]
- [ ] [Error state: what the user sees when something goes wrong]

**Out of scope for this story:** [What specifically is NOT in this ticket]
**Story Points:** [1/2/3/5/8] — [one-line rationale]
**Priority:** [P0 = blocks launch / P1 = important / P2 = nice-to-have]
**Dependencies:** [Other stories or external systems this depends on, or "None"]

Make acceptance criteria mechanically verifiable. If you can't write an automated test for a criterion, rewrite it.`,

  stakeholder: `You are a VP of Product writing a stakeholder update. Executives have 90 seconds for this. Every word earns its place.

Given status notes, produce a polished update in markdown. Be ruthlessly concise. Use data not adjectives. Surface exactly one thing that needs a decision.

# [Project Name] — Stakeholder Update
**Period:** [timeframe] | **Status:** 🟢 On Track / 🟡 At Risk / 🔴 Off Track

## TL;DR
Three bullets. Maximum. Each must contain a number or a decision needed. No filler.

## Progress
What shipped. What moved. Use metrics ("search usage +34% WoW") not adjectives ("significantly improved").

## What Slipped & Why
Be direct. Own it. State what you're doing about it and revised ETA.

## Blockers Needing Attention
If none: "None — clear runway to [next milestone]."
For each blocker: what it is → who owns resolution → what happens if unresolved by [date].

## Decisions Needed
Be explicit. "No action needed" if true. Otherwise: "[Decision X] — need answer by [DATE] to stay on track."

## Next 2 Weeks
Three bullets. What will be true that isn't true today.

No passive voice. No corporate hedging. Write like you'd say it in the room.`,

  roadmap: `You are a VP of Product building a quarterly roadmap for a team with real constraints and limited bandwidth.

Given goals and context, produce an opinionated roadmap — not a wish list. The best roadmaps are explicit about what you're NOT doing.

# Q[X] [Year] Roadmap — [Product/Team Name]
**Team:** [size and composition] | **Quarter:** [dates]

## North Star Metric
One number. Current baseline → target. Why this metric, why this quarter.

## Strategic Bet
One sentence. The biggest call you're making. What you're doubling down on and what you're explicitly deprioritizing as a result.

## Theme 1: [Name]
*Why this, why now:* [1-sentence rationale tied to the North Star]
| Initiative | Effort | Impact | Owner | Notes |
|---|---|---|---|---|
| [name] | S/M/L | High/Med/Low | [team] | [key dependency or risk] |

## Theme 2: [Name]
*Why this, why now:* [rationale]
[same table]

## Theme 3: [Name] *(if warranted)*
[same format]

## What We're NOT Doing This Quarter
This is the most important section. 4–6 items you could do but won't, each with one-line rationale. This is where roadmaps earn trust.

## Key Dependencies & Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|

## Milestones
- [Date]: [What will be true / shipped]
- [Date]: [What will be true / shipped]
- [Date]: [Quarter close — what success looks like]

Be opinionated. Surface tradeoffs. Don't hedge. The roadmap is a strategy document, not a feature list.`
}

// ─── OUTPUT RENDERER ────────────────────────────────────────────────────────

function OutputRenderer({ content, color }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1 font-body text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return (
          <h1 key={i} className="font-display text-2xl mt-4 mb-2 first:mt-0" style={{ color }}>
            {line.slice(2)}
          </h1>
        )
        if (line.startsWith('## ')) return (
          <h2 key={i} className="font-display text-lg text-paper mt-4 mb-1 font-normal">
            {line.slice(3)}
          </h2>
        )
        if (line.startsWith('### ')) return (
          <h3 key={i} className="text-paper/80 font-semibold mt-3 mb-1 text-sm uppercase tracking-wide">
            {line.slice(4)}
          </h3>
        )
        if (line.startsWith('- [ ] ')) return (
          <div key={i} className="flex items-start gap-2 ml-4 text-paper/70">
            <span className="mt-0.5 text-muted">☐</span>
            <span>{parseBold(line.slice(6))}</span>
          </div>
        )
        if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) return (
          <div key={i} className="flex items-start gap-2 ml-4 text-paper/50 line-through">
            <span className="mt-0.5" style={{ color }}>☑</span>
            <span>{parseBold(line.slice(6))}</span>
          </div>
        )
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} className="flex items-start gap-2 ml-4 text-paper/80">
            <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
            <span>{parseBold(line.slice(2))}</span>
          </div>
        )
        if (/^\d+\. /.test(line)) {
          const match = line.match(/^(\d+)\. (.*)/)
          return (
            <div key={i} className="flex items-start gap-2 ml-4 text-paper/80">
              <span className="font-mono text-xs mt-0.5 w-5 text-right flex-shrink-0" style={{ color }}>
                {match[1]}.
              </span>
              <span>{parseBold(match[2])}</span>
            </div>
          )
        }
        if (line.startsWith('> ')) return (
          <blockquote key={i} className="border-l-2 pl-3 text-paper/60 italic my-2" style={{ borderColor: color }}>
            {line.slice(2)}
          </blockquote>
        )
        if (line === '---' || line === '***') return <hr key={i} className="border-border my-4" />
        if (line.trim() === '') return <div key={i} className="h-2" />
        return <p key={i} className="text-paper/75">{parseBold(line)}</p>
      })}
    </div>
  )
}

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-paper font-semibold">{part.slice(2, -2)}</strong>
      : part
  )
}

// ─── SCORE CARD ─────────────────────────────────────────────────────────────

function ScoreCard({ score, color }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    let current = 0
    const target = score.score
    const step = target / 40
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setDisplayed(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [score.score])

  const scoreColor =
    score.score >= 80 ? '#22c55e' :
    score.score >= 65 ? '#f59e0b' : '#ef4444'

  const scoreLabel =
    score.score >= 80 ? 'Strong' :
    score.score >= 65 ? 'Solid' : 'Needs work'

  return (
    <div className="px-5 py-3 border-t border-border animate-slide-up flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Score circle */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <span className="font-display text-2xl leading-none" style={{ color: scoreColor }}>
            {displayed}
          </span>
          <span className="text-muted text-[9px] font-body uppercase tracking-wide">/ 100</span>
        </div>

        {/* Bar + labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Target size={11} style={{ color: scoreColor }} />
              <span className="text-xs font-body font-medium" style={{ color: scoreColor }}>
                {scoreLabel}
              </span>
            </div>
            <span className="text-muted text-[10px] font-body">PM Score</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-surface rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${displayed}%`, background: scoreColor }}
            />
          </div>

          {/* Chips row */}
          <div className="flex flex-wrap gap-1">
            {score.missing?.slice(0, 4).map((item, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-body"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                — {item}
              </span>
            ))}
            {score.strengths?.slice(0, 3).map((item, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-body"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BLITZ MODAL ─────────────────────────────────────────────────────────────

function BlitzModal({ outputs, done, isBlitzing, onClose, onExportAll }) {
  const doneCount = Object.values(done).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <LayoutGrid size={15} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-lg text-paper leading-tight">All 4 Artifacts</h2>
            <p className="text-muted text-xs font-body">
              {isBlitzing
                ? `Generating... ${doneCount}/4 complete`
                : `All ${doneCount} artifacts ready`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isBlitzing && (
            <button
              onClick={onExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150"
            >
              <Download size={12} />
              Export all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-muted hover:text-paper transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0 overflow-hidden">
        {MODES.map((mode) => {
          const Icon = mode.icon
          const isDone = done[mode.id]
          const text = outputs[mode.id] || ''

          return (
            <div key={mode.id} className="border-r border-b border-border flex flex-col overflow-hidden last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0">
              {/* Panel header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border flex-shrink-0"
                style={{ background: mode.color + '08' }}>
                <Icon size={13} style={{ color: mode.color }} />
                <span className="text-xs font-body font-medium" style={{ color: mode.color }}>
                  {mode.label}
                </span>
                <span className="ml-auto text-[10px] font-body text-muted">
                  {isDone
                    ? <span className="flex items-center gap-1 text-green-400"><Check size={10} /> Done</span>
                    : text
                    ? <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: mode.color }} /> Writing...</span>
                    : <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted/30" /> Queued</span>
                  }
                </span>
              </div>

              {/* Panel output */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {text ? (
                  <div>
                    <OutputRenderer content={text} color={mode.color} />
                    {!isDone && (
                      <span className="inline-block w-0.5 h-4 rounded-full animate-pulse ml-0.5"
                        style={{ background: mode.color }} />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted/40 text-xs font-body mt-4">
                    <span className="w-3 h-3 border border-muted/20 border-t-muted/60 rounded-full animate-spin" />
                    Generating...
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── HISTORY UTILS ──────────────────────────────────────────────────────────

const HISTORY_KEY = 'pilot_history'
const MAX_HISTORY = 20

function loadHistory() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

function saveHistory(items) {
  if (typeof window === 'undefined') return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
}

function getDateLabel(dateStr) {
  const today = new Date().toLocaleDateString()
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return dateStr
}

// ─── STREAM HELPER ────────────────────────────────────────────────────────────

async function streamGenerate({ input, mode, systemPrompt, onChunk, onDone }) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, mode, systemPrompt }),
  })
  if (!res.ok) throw new Error(`Generation failed: ${res.statusText}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value).split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        if (parsed.text) { full += parsed.text; onChunk(full) }
      } catch { /* skip */ }
    }
  }
  onDone(full)
  return full
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function PilotApp() {
  const [activeMode, setActiveMode] = useState(MODES[0])
  const [docs, setDocs] = useState([{ id: 1, label: 'Primary Input', content: '' }])
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)

  // Refine
  const [showRefine, setShowRefine] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  // Smart Ask
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [isAsking, setIsAsking] = useState(false)

  // Export dropdown
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef(null)

  // Shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false)

  // PM Score
  const [score, setScore] = useState(null)
  const [isScoring, setIsScoring] = useState(false)

  // Blitz mode
  const [showBlitz, setShowBlitz] = useState(false)
  const [blitzOutputs, setBlitzOutputs] = useState({ prd: '', stories: '', stakeholder: '', roadmap: '' })
  const [blitzDone, setBlitzDone] = useState({ prd: false, stories: false, stakeholder: false, roadmap: false })
  const [isBlitzing, setIsBlitzing] = useState(false)

  const outputRef = useRef(null)

  useEffect(() => { setHistory(loadHistory()) }, [])

  // Close export on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      const cmd = navigator.platform.toUpperCase().includes('MAC') ? e.metaKey : e.ctrlKey
      if (e.key === 'Escape') {
        setShowHistory(false); setShowShortcuts(false)
        setShowExport(false); setShowRefine(false); setShowBlitz(false)
        return
      }
      if (!cmd) return
      switch (e.key) {
        case 'Enter': e.preventDefault(); e.shiftKey ? handleSmartAsk() : handleGenerate(); break
        case 'k': e.preventDefault(); setDocs([{ id: 1, label: 'Primary Input', content: '' }]); setQuestions(null); setAnswers({}); setScore(null); break
        case 'h': e.preventDefault(); setShowHistory(p => !p); break
        case 'e': e.preventDefault(); if (output) handleDownloadMd(); break
        case '1': e.preventDefault(); setActiveMode(MODES[0]); break
        case '2': e.preventDefault(); setActiveMode(MODES[1]); break
        case '3': e.preventDefault(); setActiveMode(MODES[2]); break
        case '4': e.preventDefault(); setActiveMode(MODES[3]); break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [output, docs, activeMode])

  // ── HELPERS ──────────────────────────────────────────────────────────────

  function buildCombinedInput() {
    let combined = ''
    docs.forEach((doc, idx) => {
      if (!doc.content.trim()) return
      combined += idx === 0
        ? `[Primary Input]\n${doc.content.trim()}`
        : `\n\n[${doc.label || `Context Doc ${idx + 1}`}]\n${doc.content.trim()}`
    })
    if (questions && Object.keys(answers).some(k => answers[k]?.trim())) {
      combined += '\n\n[Clarifications]'
      questions.forEach((q, i) => {
        if (answers[i]?.trim()) combined += `\nQ: ${q}\nA: ${answers[i].trim()}`
      })
    }
    return combined
  }

  function loadExample() {
    updateDoc(docs[0].id, 'content', EXAMPLES[activeMode.id])
    setScore(null)
    setOutput('')
  }

  // ── GENERATE ─────────────────────────────────────────────────────────────

  async function handleGenerate() {
    const combined = buildCombinedInput()
    if (!combined.trim() || isGenerating) return

    setOutput('')
    setScore(null)
    setIsGenerating(true)
    setShowRefine(false)
    setRefineInput('')

    let fullOutput = ''
    try {
      fullOutput = await streamGenerate({
        input: combined,
        mode: activeMode.id,
        systemPrompt: SYSTEM_PROMPTS[activeMode.id],
        onChunk: (text) => setOutput(text),
        onDone: (text) => setOutput(text),
      })

      const item = {
        id: Date.now(), mode: activeMode.label, modeId: activeMode.id,
        input: combined.slice(0, 120), fullInput: combined, output: fullOutput,
        timestamp: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString(),
        refined: false,
      }
      const updated = [item, ...history].slice(0, MAX_HISTORY)
      setHistory(updated); saveHistory(updated)

      // Auto-score after generation
      scoreOutput(fullOutput, activeMode.id)
    } catch (err) {
      setOutput(`**Generation failed**\n\n${err.message}\n\nCheck your API key and try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── SCORE ─────────────────────────────────────────────────────────────────

  async function scoreOutput(text, modeId) {
    if (!text?.trim()) return
    setIsScoring(true)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output: text, mode: modeId }),
      })
      const data = await res.json()
      if (!data.error && typeof data.score === 'number') setScore(data)
    } catch { /* scoring is non-critical */ }
    finally { setIsScoring(false) }
  }

  // ── REFINE ───────────────────────────────────────────────────────────────

  async function handleRefine() {
    if (!refineInput.trim() || isRefining || !output) return
    setIsRefining(true)
    setScore(null)
    let refined = ''
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: output, instruction: refineInput, mode: activeMode.id }),
      })
      if (!res.ok) throw new Error(`Refinement failed: ${res.statusText}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      setOutput('')
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try { const p = JSON.parse(data); if (p.text) { refined += p.text; setOutput(refined) } } catch { /* skip */ }
        }
      }

      const item = {
        id: Date.now(), mode: activeMode.label, modeId: activeMode.id,
        input: buildCombinedInput().slice(0, 120), fullInput: buildCombinedInput(), output: refined,
        timestamp: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString(), refined: true,
      }
      const updated = [item, ...history].slice(0, MAX_HISTORY)
      setHistory(updated); saveHistory(updated)
      setRefineInput(''); setShowRefine(false)

      scoreOutput(refined, activeMode.id)
    } catch (err) {
      setOutput(`**Refinement failed**\n\n${err.message}`)
    } finally { setIsRefining(false) }
  }

  // ── SMART ASK ────────────────────────────────────────────────────────────

  async function handleSmartAsk() {
    const combined = buildCombinedInput()
    if (!combined.trim() || isAsking) return
    setIsAsking(true); setQuestions(null); setAnswers({})
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: combined, mode: activeMode.id }),
      })
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch { /* silent fail */ }
    finally { setIsAsking(false) }
  }

  // ── BLITZ ─────────────────────────────────────────────────────────────────

  async function handleBlitz() {
    const combined = buildCombinedInput()
    if (!combined.trim() || isBlitzing) return

    setShowBlitz(true)
    setIsBlitzing(true)
    setBlitzOutputs({ prd: '', stories: '', stakeholder: '', roadmap: '' })
    setBlitzDone({ prd: false, stories: false, stakeholder: false, roadmap: false })

    await Promise.allSettled(
      MODES.map(mode =>
        streamGenerate({
          input: combined,
          mode: mode.id,
          systemPrompt: SYSTEM_PROMPTS[mode.id],
          onChunk: (text) => setBlitzOutputs(prev => ({ ...prev, [mode.id]: text })),
          onDone: (text) => {
            setBlitzOutputs(prev => ({ ...prev, [mode.id]: text }))
            setBlitzDone(prev => ({ ...prev, [mode.id]: true }))
          },
        }).catch(() => setBlitzDone(prev => ({ ...prev, [mode.id]: true })))
      )
    )
    setIsBlitzing(false)
  }

  function handleExportAll() {
    const combined = MODES.map(mode => {
      const text = blitzOutputs[mode.id]
      return text ? `---\n# ${mode.label}\n\n${text}` : ''
    }).filter(Boolean).join('\n\n')

    const blob = new Blob([combined], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pilot-all-artifacts-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── COPY / EXPORT ─────────────────────────────────────────────────────────

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadMd() {
    const blob = new Blob([output], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pilot-${activeMode.id}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
  }

  // ── HISTORY ───────────────────────────────────────────────────────────────

  function restoreFromHistory(item) {
    setOutput(item.output)
    if (item.fullInput) setDocs([{ id: 1, label: 'Primary Input', content: item.fullInput }])
    setActiveMode(MODES.find(m => m.id === item.modeId) || MODES[0])
    setScore(null)
    setShowHistory(false)
  }

  function deleteHistoryItem(id) {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated); saveHistory(updated)
  }

  function clearHistory() { setHistory([]); saveHistory([]) }

  // ── DOCS ──────────────────────────────────────────────────────────────────

  function addDoc() {
    if (docs.length >= 3) return
    setDocs(prev => [...prev, { id: Date.now(), label: `Context Doc ${prev.length + 1}`, content: '' }])
  }

  function removeDoc(id) { setDocs(prev => prev.filter(d => d.id !== id)) }

  function updateDoc(id, field, value) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  // ── DERIVED ──────────────────────────────────────────────────────────────

  const groupedHistory = history.reduce((acc, item) => {
    const label = getDateLabel(item.date)
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})

  const hasInput = docs.some(d => d.content.trim())

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="grain flex flex-col h-screen overflow-hidden bg-ink">

      {/* HEADER */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: activeMode.color }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display text-lg text-paper">Pilot</span>
          <span className="text-muted text-xs ml-1 font-body">AI Copilot for PMs</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="w-7 h-7 rounded-lg border border-border text-muted hover:text-paper hover:border-paper/20 transition-all duration-150 flex items-center justify-center"
            title="Back to home"
          >
            <Home size={13} />
          </Link>
          <button
            onClick={() => setShowShortcuts(true)}
            className="w-7 h-7 rounded-lg border border-border text-muted hover:text-paper hover:border-paper/20 transition-all duration-150 flex items-center justify-center text-xs font-mono"
          >?</button>
          <button
            onClick={() => setShowHistory(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body transition-all duration-150 ${showHistory ? 'border-accent/40 text-accent bg-accent/10' : 'border-border text-muted hover:text-paper hover:border-paper/20'}`}
          >
            <History size={13} />
            History
            {history.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-52 border-r border-border flex-shrink-0 flex flex-col py-4 px-2">
          <p className="text-muted text-[10px] uppercase tracking-widest px-2 mb-2 font-body">Mode</p>
          <nav className="space-y-0.5 flex-1">
            {MODES.map(mode => {
              const Icon = mode.icon
              const isActive = activeMode.id === mode.id
              return (
                <button key={mode.id} onClick={() => setActiveMode(mode)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 group ${isActive ? 'bg-surface' : 'hover:bg-surface/50'}`}>
                  <Icon size={15}
                    style={{ color: isActive ? mode.color : undefined }}
                    className={isActive ? '' : 'text-muted group-hover:text-paper/60'} />
                  <div>
                    <div className={`text-xs font-medium font-body ${isActive ? 'text-paper' : 'text-muted group-hover:text-paper/80'}`}>
                      {mode.label}
                    </div>
                    <div className="text-[10px] text-muted/70 font-body">{mode.description}</div>
                  </div>
                  {isActive && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: mode.color }} />}
                </button>
              )
            })}
          </nav>
          <div className="mt-4 px-2 pt-4 border-t border-border">
            <p className="text-muted text-[10px] uppercase tracking-widest mb-2 font-body">Session</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-body">
                <span className="text-muted">Total runs</span>
                <span className="text-paper/60">{history.length}</span>
              </div>
              <div className="flex justify-between text-[11px] font-body">
                <span className="text-muted">Today</span>
                <span className="text-paper/60">{history.filter(h => h.date === new Date().toLocaleDateString()).length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex overflow-hidden">

          {/* INPUT PANEL */}
          <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
              <span className="text-muted text-xs font-body uppercase tracking-widest">Raw Input</span>
              <div className="flex items-center gap-1.5">
                {/* Load example */}
                <button
                  onClick={loadExample}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150"
                  title="Load a realistic example"
                >
                  <Sparkles size={10} />
                  Example
                </button>
                {/* Add context */}
                <button
                  onClick={addDoc}
                  disabled={docs.length >= 3}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={11} />
                  Add context
                </button>
              </div>
            </div>

            {/* Docs */}
            <div className="flex-1 overflow-y-auto">
              {docs.map((doc, idx) => (
                <div key={doc.id} className={`flex flex-col border-b border-border ${idx > 0 ? 'opacity-95' : ''}`}>
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    {idx === 0 ? (
                      <span className="text-xs text-muted/60 font-body">{activeMode.label} Input</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-0.5 h-4 rounded-full" style={{ background: activeMode.color, opacity: 0.5 }} />
                        <input type="text" value={doc.label}
                          onChange={e => updateDoc(doc.id, 'label', e.target.value)}
                          className="text-xs text-muted font-body bg-transparent border-none outline-none focus:text-paper/80 w-40" />
                      </div>
                    )}
                    {idx > 0 && (
                      <button onClick={() => removeDoc(doc.id)} className="text-muted hover:text-paper/60 transition-colors duration-150">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className={idx > 0 ? 'ml-4 border-l-2' : ''} style={idx > 0 ? { borderColor: activeMode.color + '40' } : {}}>
                    <textarea
                      value={doc.content}
                      onChange={e => updateDoc(doc.id, 'content', e.target.value)}
                      placeholder={idx === 0 ? activeMode.placeholder : 'Paste additional context here...'}
                      className={`w-full bg-transparent text-paper/80 placeholder-muted/40 resize-none outline-none text-sm font-body leading-relaxed ${idx > 0 ? 'pl-4 pr-4 py-3 min-h-[120px]' : 'px-4 py-3 min-h-[200px]'}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Ask questions */}
            {questions && questions.length > 0 && (
              <div className="border-t border-border px-4 py-3 flex-shrink-0 animate-slide-up">
                <p className="text-muted text-[10px] uppercase tracking-widest mb-2 font-body">Clarifying Questions</p>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-muted text-xs font-body">{q}</p>
                      <input type="text" placeholder="Optional answer..."
                        value={answers[i] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-paper/80 placeholder-muted/40 outline-none focus:border-paper/20 font-body transition-colors duration-150" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0">
              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !hasInput}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white text-sm font-medium font-body transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: isGenerating ? activeMode.color + '80' : activeMode.color }}
              >
                {isGenerating ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Generating...</>
                ) : (
                  <><Zap size={14} />Generate<span className="ml-auto text-white/50 text-[11px] font-mono">⌘↵</span></>
                )}
              </button>

              {/* Smart Ask */}
              <button
                onClick={handleSmartAsk}
                disabled={isAsking || !hasInput}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Ask clarifying questions (⌘⇧↵)"
              >
                {isAsking
                  ? <span className="w-3 h-3 border border-muted border-t-paper rounded-full animate-spin" />
                  : <MessageCircle size={13} />}
                Smart Ask
              </button>

              {/* Generate All */}
              <button
                onClick={handleBlitz}
                disabled={isBlitzing || !hasInput}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: '1px solid rgba(232,82,10,0.5)',
                  color: '#e8520a',
                  background: 'rgba(232,82,10,0.08)',
                }}
                title="Generate all 4 artifacts at once (Blitz Mode)"
              >
                {isBlitzing
                  ? <span className="w-3 h-3 border border-accent/40 border-t-accent rounded-full animate-spin" />
                  : <LayoutGrid size={13} />}
                Blitz All 4
              </button>
            </div>
          </div>

          {/* OUTPUT PANEL */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-muted text-xs font-body uppercase tracking-widest">Output</span>
                {output && !isGenerating && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-body font-medium"
                    style={{ background: activeMode.color + '20', color: activeMode.color }}>
                    {activeMode.label}
                  </span>
                )}
                {isScoring && (
                  <span className="flex items-center gap-1 text-muted text-[10px] font-body">
                    <span className="w-2 h-2 border border-muted/40 border-t-muted rounded-full animate-spin" />
                    Scoring...
                  </span>
                )}
              </div>
              {output && (
                <div className="flex items-center gap-1.5">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150">
                    {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copied ? 'Copied!' : 'Copy as Markdown'}
                  </button>
                  <div className="relative" ref={exportRef}>
                    <button onClick={() => setShowExport(p => !p)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150">
                      <Download size={11} />Export
                    </button>
                    {showExport && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-slide-up">
                        <button onClick={handleCopy}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-paper hover:bg-white/5 transition-all duration-150 font-body">
                          <Copy size={12} />Copy as Markdown
                        </button>
                        <button onClick={handleDownloadMd}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-paper hover:bg-white/5 transition-all duration-150 font-body">
                          <Download size={12} />Download as .md file
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Output content */}
            <div ref={outputRef} className="flex-1 overflow-y-auto px-5 py-4">
              {!output && !isGenerating && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: activeMode.color + '20' }}>
                    {(() => { const Icon = activeMode.icon; return <Icon size={22} style={{ color: activeMode.color }} /> })()}
                  </div>
                  <p className="text-paper/60 text-sm font-body mb-2">Your {activeMode.label} will appear here</p>
                  <p className="text-muted/50 text-xs font-body mb-6 max-w-xs">
                    Paste raw notes on the left — meeting dumps, Slack threads, bullet points — then hit Generate.
                  </p>
                  <div className="flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2 text-muted/50 text-[11px] font-body">
                      <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">Example</kbd>
                      <span>Load a realistic sample input</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted/50 text-[11px] font-body">
                      <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">⌘↵</kbd>
                      <span>Generate the artifact</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted/50 text-[11px] font-body">
                      <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">Blitz All 4</kbd>
                      <span>Generate all artifacts at once</span>
                    </div>
                  </div>
                </div>
              )}
              {(output || isGenerating) && (
                <div className="animate-fade-up">
                  <OutputRenderer content={output} color={activeMode.color} />
                  {isGenerating && (
                    <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse rounded-full" style={{ background: activeMode.color }} />
                  )}
                </div>
              )}
            </div>

            {/* PM Score */}
            {score && !isGenerating && (
              <ScoreCard score={score} color={activeMode.color} />
            )}

            {/* Refine bar */}
            {output && !isGenerating && (
              <div className="border-t border-border flex-shrink-0">
                {!showRefine ? (
                  <div className="px-4 py-2.5">
                    <button onClick={() => setShowRefine(true)}
                      className="flex items-center gap-1.5 text-muted text-xs font-body hover:text-paper transition-colors duration-150">
                      <ChevronRight size={13} />
                      Refine this output...
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 animate-slide-up">
                    <div className="flex items-center gap-2">
                      <input type="text" autoFocus
                        value={refineInput}
                        onChange={e => setRefineInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) handleRefine()
                          if (e.key === 'Escape') { setShowRefine(false); setRefineInput('') }
                        }}
                        placeholder="What should change? e.g. 'Make it shorter', 'Add a risks section'..."
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-paper/80 placeholder-muted/40 outline-none focus:border-paper/20 font-body transition-colors duration-150" />
                      <button onClick={handleRefine}
                        disabled={isRefining || !refineInput.trim()}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        style={{ background: activeMode.color }}>
                        {isRefining
                          ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                          : <ArrowRight size={13} className="text-white" />}
                      </button>
                      <button onClick={() => { setShowRefine(false); setRefineInput('') }}
                        className="text-muted hover:text-paper transition-colors duration-150">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* HISTORY PANEL */}
        {showHistory && (
          <div className="w-72 border-l border-border flex flex-col flex-shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
              <span className="text-muted text-xs font-body uppercase tracking-widest">History</span>
              <button onClick={() => setShowHistory(false)} className="text-muted hover:text-paper transition-colors duration-150">
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Clock size={24} className="text-muted/30 mb-2" />
                  <p className="text-muted text-xs font-body">No history yet</p>
                </div>
              ) : (
                Object.entries(groupedHistory).map(([dateLabel, items]) => (
                  <div key={dateLabel}>
                    <p className="text-muted/50 text-[10px] uppercase tracking-widest px-4 py-2 font-body">{dateLabel}</p>
                    {items.map(item => {
                      const mode = MODES.find(m => m.id === item.modeId) || MODES[0]
                      return (
                        <div key={item.id}
                          className="group relative mx-2 mb-1 px-3 py-2.5 rounded-lg hover:bg-surface cursor-pointer transition-all duration-150"
                          onClick={() => restoreFromHistory(item)}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-medium font-body px-1.5 py-0.5 rounded"
                                  style={{ background: mode.color + '20', color: mode.color }}>
                                  {item.mode}
                                </span>
                                {item.refined && <span className="text-[10px] text-muted font-body">refined</span>}
                              </div>
                              <p className="text-paper/60 text-xs font-body truncate">{item.input}</p>
                              <p className="text-muted/50 text-[10px] font-body mt-0.5">{item.timestamp}</p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); deleteHistoryItem(item.id) }}
                              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all duration-150 flex-shrink-0 mt-0.5">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <div className="border-t border-border px-4 py-2.5 flex-shrink-0">
                <button onClick={clearHistory}
                  className="text-muted text-xs font-body hover:text-red-400 transition-colors duration-150">
                  Clear all history
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BLITZ MODAL */}
      {showBlitz && (
        <BlitzModal
          outputs={blitzOutputs}
          done={blitzDone}
          isBlitzing={isBlitzing}
          onClose={() => setShowBlitz(false)}
          onExportAll={handleExportAll}
        />
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowShortcuts(false)}>
          <div className="bg-surface border border-border rounded-xl shadow-xl p-6 w-96 animate-fade-up"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg text-paper">Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)} className="text-muted hover:text-paper transition-colors duration-150">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                ['⌘ + Enter', 'Generate'],
                ['⌘ + Shift + Enter', 'Smart Ask'],
                ['⌘ + K', 'Clear input'],
                ['⌘ + H', 'Toggle history'],
                ['⌘ + E', 'Export markdown'],
                ['⌘ + 1', 'Switch to PRD'],
                ['⌘ + 2', 'Switch to User Stories'],
                ['⌘ + 3', 'Switch to Stakeholder Update'],
                ['⌘ + 4', 'Switch to Roadmap'],
                ['Escape', 'Close modals'],
              ].map(([shortcut, action]) => (
                <div key={shortcut} className="flex items-center justify-between py-1.5">
                  <span className="text-muted text-sm font-body">{action}</span>
                  <kbd className="font-mono text-xs text-paper/60 bg-ink border border-border px-2 py-0.5 rounded">{shortcut}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
