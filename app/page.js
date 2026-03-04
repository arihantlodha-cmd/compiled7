'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Zap, FileText, BookOpen, Users, Map,
  ChevronRight, Copy, Download, Clock, Trash2, X,
  Plus, MessageCircle, ArrowRight, HelpCircle,
  CheckSquare, Send, History, Check
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

// ─── SYSTEM PROMPTS ─────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  prd: `You are a Principal Product Manager at a top-tier tech company. You write PRDs that are clear, structured, and actionable.

Given raw notes or ideas, produce a complete PRD in markdown format:

# [Product Name] — Product Requirements Document
## Problem Statement
## Goals & Success Metrics
## User Personas
## Scope (In / Out)
## Functional Requirements
## Non-Functional Requirements
## Open Questions
## Timeline & Milestones

Be specific. Use numbers. Make tradeoffs explicit. Write like someone who has shipped products used by millions.`,

  stories: `You are a senior PM who writes user stories that engineers love. No fluff, no ambiguity.

Given a feature description, produce sprint-ready user stories in markdown:

# [Feature Name] — User Stories

For each story:
## Story N: [Title]
**As a** [user type], **I want to** [action], **so that** [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Story Points:** [1/2/3/5/8]
**Priority:** [P0/P1/P2]

Write 4-6 stories. Include edge cases. Think like the engineer who will implement this.`,

  stakeholder: `You are a VP of Product writing a stakeholder update that executives actually read.

Given status notes, produce a polished update in markdown:

# [Project Name] — Stakeholder Update
**Date:** [Date] | **Author:** PM Team

## TL;DR (3 bullets max)
## Progress This Period
## Key Metrics Movement
## What's Next (2 weeks)
## Risks & Blockers
## Decisions Needed

Be ruthlessly concise. Use data. Surface the one thing that needs executive attention.`,

  roadmap: `You are a VP of Product building a quarterly roadmap. Given goals, constraints, and team context, produce a structured roadmap in markdown.

Format:
# Q[X] Roadmap — [Product/Team Name]
## North Star Metric
## Theme 1: [Name]
### Initiatives (list with effort: S/M/L and impact: High/Med/Low)
## Theme 2: [Name]
### Initiatives
## Theme 3: [Name]
### Initiatives
## What We're NOT Doing (and why)
## Dependencies & Risks

Be opinionated. Make tradeoffs explicit. Write like someone who has shipped roadmaps that worked.`
}

// ─── OUTPUT RENDERER ────────────────────────────────────────────────────────

function OutputRenderer({ content, color }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1 font-body text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={i} className="font-display text-2xl text-paper mt-4 mb-2 first:mt-0" style={{ color }}>
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="font-display text-lg text-paper mt-4 mb-1 font-normal">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-paper/80 font-semibold mt-3 mb-1 text-sm uppercase tracking-wide">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith('- [ ] ')) {
          return (
            <div key={i} className="flex items-start gap-2 ml-4 text-paper/70">
              <span className="mt-0.5 text-muted">☐</span>
              <span>{parseBold(line.slice(6))}</span>
            </div>
          )
        }
        if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
          return (
            <div key={i} className="flex items-start gap-2 ml-4 text-paper/50 line-through">
              <span className="mt-0.5" style={{ color }}>☑</span>
              <span>{parseBold(line.slice(6))}</span>
            </div>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 ml-4 text-paper/80">
              <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
              <span>{parseBold(line.slice(2))}</span>
            </div>
          )
        }
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
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
          return (
            <p key={i} className="font-semibold text-paper/90 mt-2">
              {line.slice(2, -2)}
            </p>
          )
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 pl-3 text-paper/60 italic my-2" style={{ borderColor: color }}>
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line === '---' || line === '***') {
          return <hr key={i} className="border-border my-4" />
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />
        }
        return (
          <p key={i} className="text-paper/75">
            {parseBold(line)}
          </p>
        )
      })}
    </div>
  )
}

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-paper font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// ─── HISTORY UTILS ──────────────────────────────────────────────────────────

const HISTORY_KEY = 'pilot_history'
const MAX_HISTORY = 20

function loadHistory() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
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

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function PilotApp() {
  const [activeMode, setActiveMode] = useState(MODES[0])
  const [docs, setDocs] = useState([{ id: 1, label: 'Primary Input', content: '' }])
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)

  // Refine state
  const [showRefine, setShowRefine] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  // Smart Ask state
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [isAsking, setIsAsking] = useState(false)

  // Export dropdown
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef(null)

  // Keyboard shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false)

  const outputRef = useRef(null)

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // Close export dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExport(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdKey = isMac ? e.metaKey : e.ctrlKey

      if (e.key === 'Escape') {
        setShowHistory(false)
        setShowShortcuts(false)
        setShowExport(false)
        setShowRefine(false)
        return
      }

      if (!cmdKey) return

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          if (e.shiftKey) {
            handleSmartAsk()
          } else {
            handleGenerate()
          }
          break
        case 'k':
          e.preventDefault()
          setDocs([{ id: 1, label: 'Primary Input', content: '' }])
          setQuestions(null)
          setAnswers({})
          break
        case 'h':
          e.preventDefault()
          setShowHistory(prev => !prev)
          break
        case 'e':
          e.preventDefault()
          if (output) handleDownloadMd()
          break
        case '1':
          e.preventDefault()
          setActiveMode(MODES[0])
          break
        case '2':
          e.preventDefault()
          setActiveMode(MODES[1])
          break
        case '3':
          e.preventDefault()
          setActiveMode(MODES[2])
          break
        case '4':
          e.preventDefault()
          setActiveMode(MODES[3])
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [output, docs, activeMode])

  // ── COMBINE DOCS INTO PROMPT ─────────────────────────────────────────────

  function buildCombinedInput() {
    let combined = ''
    docs.forEach((doc, idx) => {
      if (!doc.content.trim()) return
      if (idx === 0) {
        combined += `[Primary Input]\n${doc.content.trim()}`
      } else {
        combined += `\n\n[${doc.label || `Context Doc ${idx + 1}`}]\n${doc.content.trim()}`
      }
    })

    if (questions && Object.keys(answers).some(k => answers[k]?.trim())) {
      combined += '\n\n[Clarifications]'
      questions.forEach((q, i) => {
        if (answers[i]?.trim()) {
          combined += `\nQ: ${q}\nA: ${answers[i].trim()}`
        }
      })
    }

    return combined
  }

  // ── GENERATE ─────────────────────────────────────────────────────────────

  async function handleGenerate() {
    const combined = buildCombinedInput()
    if (!combined.trim() || isGenerating) return

    setOutput('')
    setIsGenerating(true)
    setShowRefine(false)
    setRefineInput('')

    const systemPrompt = SYSTEM_PROMPTS[activeMode.id]

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: combined, mode: activeMode.id, systemPrompt }),
      })

      if (!res.ok) throw new Error(`Generation failed: ${res.statusText}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullOutput = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullOutput += parsed.text
                setOutput(fullOutput)
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      }

      // Save to history
      const item = {
        id: Date.now(),
        mode: activeMode.label,
        modeId: activeMode.id,
        input: combined.slice(0, 120),
        fullInput: combined,
        output: fullOutput,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        refined: false,
      }
      const updated = [item, ...history].slice(0, MAX_HISTORY)
      setHistory(updated)
      saveHistory(updated)
    } catch (err) {
      setOutput(`**Generation failed**\n\n${err.message}\n\nCheck your API key and try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── REFINE ───────────────────────────────────────────────────────────────

  async function handleRefine() {
    if (!refineInput.trim() || isRefining || !output) return

    setIsRefining(true)
    const systemPrompt = SYSTEM_PROMPTS[activeMode.id]

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: output,
          instruction: refineInput,
          mode: activeMode.id,
          systemPrompt,
        }),
      })

      if (!res.ok) throw new Error(`Refinement failed: ${res.statusText}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let refined = ''
      setOutput('')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                refined += parsed.text
                setOutput(refined)
              }
            } catch { /* skip */ }
          }
        }
      }

      // Save refined to history
      const item = {
        id: Date.now(),
        mode: activeMode.label,
        modeId: activeMode.id,
        input: buildCombinedInput().slice(0, 120),
        fullInput: buildCombinedInput(),
        output: refined,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        refined: true,
      }
      const updated = [item, ...history].slice(0, MAX_HISTORY)
      setHistory(updated)
      saveHistory(updated)

      setRefineInput('')
      setShowRefine(false)
    } catch (err) {
      setOutput(`**Refinement failed**\n\n${err.message}`)
    } finally {
      setIsRefining(false)
    }
  }

  // ── SMART ASK ────────────────────────────────────────────────────────────

  async function handleSmartAsk() {
    const combined = buildCombinedInput()
    if (!combined.trim() || isAsking) return

    setIsAsking(true)
    setQuestions(null)
    setAnswers({})

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: combined, mode: activeMode.id }),
      })
      if (!res.ok) throw new Error('Smart Ask failed')
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsAsking(false)
    }
  }

  // ── COPY ─────────────────────────────────────────────────────────────────

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── EXPORT ───────────────────────────────────────────────────────────────

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

  // ── HISTORY ACTIONS ──────────────────────────────────────────────────────

  function restoreFromHistory(item) {
    setOutput(item.output)
    if (item.fullInput) {
      setDocs([{ id: 1, label: 'Primary Input', content: item.fullInput }])
    }
    const mode = MODES.find(m => m.id === item.modeId) || MODES[0]
    setActiveMode(mode)
    setShowHistory(false)
  }

  function deleteHistoryItem(id) {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    saveHistory(updated)
  }

  function clearHistory() {
    setHistory([])
    saveHistory([])
  }

  // ── DOC MANAGEMENT ───────────────────────────────────────────────────────

  function addDoc() {
    if (docs.length >= 3) return
    const id = Date.now()
    setDocs(prev => [...prev, {
      id,
      label: `Context Doc ${prev.length + 1}`,
      content: ''
    }])
  }

  function removeDoc(id) {
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  function updateDoc(id, field, value) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  // ── GROUP HISTORY BY DATE ─────────────────────────────────────────────────

  const groupedHistory = history.reduce((acc, item) => {
    const label = getDateLabel(item.date)
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})

  const sessionStats = {
    count: history.length,
    today: history.filter(h => h.date === new Date().toLocaleDateString()).length,
  }

  return (
    <div className="grain flex flex-col h-screen overflow-hidden bg-ink">
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: activeMode.color }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display text-lg text-paper tracking-tight">Pilot</span>
          <span className="text-muted text-xs ml-1 font-body">AI Copilot for PMs</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcuts(true)}
            className="w-7 h-7 rounded-lg border border-border text-muted hover:text-paper hover:border-paper/20 transition-all duration-150 flex items-center justify-center text-xs font-mono"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
          <button
            onClick={() => setShowHistory(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body transition-all duration-150 ${
              showHistory
                ? 'border-accent/40 text-accent bg-accent/10'
                : 'border-border text-muted hover:text-paper hover:border-paper/20'
            }`}
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

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <aside className="w-52 border-r border-border flex-shrink-0 flex flex-col py-4 px-2">
          <p className="text-muted text-[10px] uppercase tracking-widest px-2 mb-2 font-body">Mode</p>
          <nav className="space-y-0.5 flex-1">
            {MODES.map((mode) => {
              const Icon = mode.icon
              const isActive = activeMode.id === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 group ${
                    isActive ? 'bg-surface' : 'hover:bg-surface/50'
                  }`}
                >
                  <Icon
                    size={15}
                    style={{ color: isActive ? mode.color : undefined }}
                    className={isActive ? '' : 'text-muted group-hover:text-paper/60'}
                  />
                  <div>
                    <div className={`text-xs font-medium font-body ${isActive ? 'text-paper' : 'text-muted group-hover:text-paper/80'}`}>
                      {mode.label}
                    </div>
                    <div className="text-[10px] text-muted/70 font-body">{mode.description}</div>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-1 h-4 rounded-full" style={{ background: mode.color }} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Stats */}
          <div className="mt-4 px-2 pt-4 border-t border-border">
            <p className="text-muted text-[10px] uppercase tracking-widest mb-2 font-body">Session</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-body">
                <span className="text-muted">Total runs</span>
                <span className="text-paper/60">{sessionStats.count}</span>
              </div>
              <div className="flex justify-between text-[11px] font-body">
                <span className="text-muted">Today</span>
                <span className="text-paper/60">{sessionStats.today}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ── */}
        <main className="flex-1 flex overflow-hidden">
          {/* Input Panel */}
          <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
            {/* Input panel header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
              <span className="text-muted text-xs font-body uppercase tracking-widest">Raw Input</span>
              <button
                onClick={addDoc}
                disabled={docs.length >= 3}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus size={11} />
                Add context
              </button>
            </div>

            {/* Docs area */}
            <div className="flex-1 overflow-y-auto">
              {docs.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`flex flex-col border-b border-border ${idx > 0 ? 'opacity-95' : ''}`}
                >
                  {/* Doc label row */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    {idx === 0 ? (
                      <span className="text-xs text-muted/60 font-body">
                        {activeMode.label} Input
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-0.5 h-4 rounded-full" style={{ background: activeMode.color, opacity: 0.5 }} />
                        <input
                          type="text"
                          value={doc.label}
                          onChange={e => updateDoc(doc.id, 'label', e.target.value)}
                          className="text-xs text-muted font-body bg-transparent border-none outline-none focus:text-paper/80 w-40"
                        />
                      </div>
                    )}
                    {idx > 0 && (
                      <button
                        onClick={() => removeDoc(doc.id)}
                        className="text-muted hover:text-paper/60 transition-colors duration-150"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {/* Doc left-border accent for non-primary */}
                  <div className={idx > 0 ? 'ml-4 border-l-2' : ''} style={idx > 0 ? { borderColor: activeMode.color + '40' } : {}}>
                    <textarea
                      value={doc.content}
                      onChange={e => updateDoc(doc.id, 'content', e.target.value)}
                      placeholder={idx === 0 ? activeMode.placeholder : `Paste additional context here...`}
                      className={`w-full bg-transparent text-paper/80 placeholder-muted/40 resize-none outline-none text-sm font-body leading-relaxed ${idx > 0 ? 'pl-4 pr-4 py-3 min-h-[120px]' : 'px-4 py-3 min-h-[200px]'}`}
                      style={{ minHeight: idx === 0 && docs.length === 1 ? '100%' : undefined }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Ask Questions */}
            {questions && questions.length > 0 && (
              <div className="border-t border-border px-4 py-3 flex-shrink-0 animate-slide-up">
                <p className="text-muted text-[10px] uppercase tracking-widest mb-2 font-body">Clarifying Questions</p>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-muted text-xs font-body">{q}</p>
                      <input
                        type="text"
                        placeholder="Optional answer..."
                        value={answers[i] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-paper/80 placeholder-muted/40 outline-none focus:border-paper/20 font-body transition-colors duration-150"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !docs.some(d => d.content.trim())}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white text-sm font-medium font-body transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: isGenerating ? activeMode.color + '80' : activeMode.color }}
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Generate
                    <span className="ml-auto text-white/50 text-[11px] font-mono">⌘↵</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSmartAsk}
                disabled={isAsking || !docs.some(d => d.content.trim())}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Smart Ask — generates clarifying questions (⌘⇧↵)"
              >
                {isAsking ? (
                  <span className="w-3 h-3 border border-muted border-t-paper rounded-full animate-spin" />
                ) : (
                  <MessageCircle size={13} />
                )}
                Smart Ask
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Output header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-muted text-xs font-body uppercase tracking-widest">Output</span>
                {output && !isGenerating && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-body font-medium"
                    style={{ background: activeMode.color + '20', color: activeMode.color }}
                  >
                    {activeMode.label}
                  </span>
                )}
              </div>
              {output && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150"
                  >
                    {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copied ? 'Copied!' : 'Copy as Markdown'}
                  </button>
                  {/* Export dropdown */}
                  <div className="relative" ref={exportRef}>
                    <button
                      onClick={() => setShowExport(prev => !prev)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-muted text-xs font-body hover:text-paper hover:border-paper/20 transition-all duration-150"
                    >
                      <Download size={11} />
                      Export
                    </button>
                    {showExport && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-slide-up">
                        <button
                          onClick={handleCopy}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-paper hover:bg-white/5 transition-all duration-150 font-body"
                        >
                          <Copy size={12} />
                          Copy as Markdown
                        </button>
                        <button
                          onClick={handleDownloadMd}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-paper hover:bg-white/5 transition-all duration-150 font-body"
                        >
                          <Download size={12} />
                          Download as .md file
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
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 opacity-20"
                    style={{ background: activeMode.color }}
                  >
                    {(() => { const Icon = activeMode.icon; return <Icon size={22} className="text-white" /> })()}
                  </div>
                  <p className="text-muted text-sm font-body mb-1">Your {activeMode.label} will appear here</p>
                  <p className="text-muted/50 text-xs font-body">Paste input → click Generate</p>
                </div>
              )}
              {(output || isGenerating) && (
                <div className="animate-fade-up">
                  <OutputRenderer content={output} color={activeMode.color} />
                  {isGenerating && (
                    <span
                      className="inline-block w-0.5 h-4 ml-0.5 animate-pulse rounded-full"
                      style={{ background: activeMode.color }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Refine bar */}
            {output && !isGenerating && (
              <div className="border-t border-border flex-shrink-0">
                {!showRefine ? (
                  <div className="px-4 py-2.5">
                    <button
                      onClick={() => setShowRefine(true)}
                      className="flex items-center gap-1.5 text-muted text-xs font-body hover:text-paper transition-colors duration-150"
                    >
                      <ChevronRight size={13} />
                      Refine this output...
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 animate-slide-up">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={refineInput}
                        onChange={e => setRefineInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) handleRefine()
                          if (e.key === 'Escape') { setShowRefine(false); setRefineInput('') }
                        }}
                        placeholder="What should change? e.g. 'Make it shorter', 'Add a section on risks', 'More technical language'..."
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-paper/80 placeholder-muted/40 outline-none focus:border-paper/20 font-body transition-colors duration-150"
                      />
                      <button
                        onClick={handleRefine}
                        disabled={isRefining || !refineInput.trim()}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        style={{ background: activeMode.color }}
                      >
                        {isRefining ? (
                          <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight size={13} className="text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => { setShowRefine(false); setRefineInput('') }}
                        className="text-muted hover:text-paper transition-colors duration-150"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* ── HISTORY PANEL ── */}
        {showHistory && (
          <div className="w-72 border-l border-border flex flex-col flex-shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
              <span className="text-muted text-xs font-body uppercase tracking-widest">History</span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted hover:text-paper transition-colors duration-150"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Clock size={24} className="text-muted/30 mb-2" />
                  <p className="text-muted text-xs font-body">No history yet</p>
                  <p className="text-muted/50 text-[11px] font-body mt-1">Generate something to get started</p>
                </div>
              ) : (
                Object.entries(groupedHistory).map(([dateLabel, items]) => (
                  <div key={dateLabel}>
                    <p className="text-muted/50 text-[10px] uppercase tracking-widest px-4 py-2 font-body">{dateLabel}</p>
                    {items.map(item => {
                      const mode = MODES.find(m => m.id === item.modeId) || MODES[0]
                      return (
                        <div
                          key={item.id}
                          className="group relative mx-2 mb-1 px-3 py-2.5 rounded-lg hover:bg-surface cursor-pointer transition-all duration-150"
                          onClick={() => restoreFromHistory(item)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span
                                  className="text-[10px] font-medium font-body px-1.5 py-0.5 rounded"
                                  style={{ background: mode.color + '20', color: mode.color }}
                                >
                                  {item.mode}
                                </span>
                                {item.refined && (
                                  <span className="text-[10px] text-muted font-body">refined</span>
                                )}
                              </div>
                              <p className="text-paper/60 text-xs font-body truncate">{item.input}</p>
                              <p className="text-muted/50 text-[10px] font-body mt-0.5">{item.timestamp}</p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); deleteHistoryItem(item.id) }}
                              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all duration-150 flex-shrink-0 mt-0.5"
                            >
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
                <button
                  onClick={clearHistory}
                  className="text-muted text-xs font-body hover:text-red-400 transition-colors duration-150"
                >
                  Clear all history
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── KEYBOARD SHORTCUTS MODAL ── */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-surface border border-border rounded-xl shadow-xl p-6 w-96 animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg text-paper">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-muted hover:text-paper transition-colors duration-150"
              >
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
