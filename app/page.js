'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Zap, FileText, CheckSquare, Users, Map,
  ArrowRight, ChevronRight, Clock, Sparkles,
} from 'lucide-react'
import Link from 'next/link'

// ─── SCROLL ANIMATION HOOK ────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

function FadeUp({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── TYPEWRITER DEMO ──────────────────────────────────────────────────────────

const DEMO_INPUT = `Users keep complaining that onboarding takes too long. Currently 8 steps, 60% drop off at step 4. We need to fix this before Q2. Marketing is running a big campaign and activation has to be better. CEO wants DAU up 20%.`

const DEMO_OUTPUT = `# Onboarding Redesign — PRD

## Problem Statement
60% of new users abandon onboarding at step 4 of 8, directly suppressing DAU growth ahead of a major Q2 marketing campaign.

## Goals & Success Metrics
- Reduce onboarding to ≤3 steps by Q2 launch
- Improve activation rate from ~40% → 70%+
- Drive DAU +20% MoM post-campaign

## Scope: In
- Onboarding flow redesign (steps 1–3)
- Progress indicator & skip logic
- Mobile-responsive redesign

## Scope: Out
- Backend account system changes
- Notification preferences (Q3)

## Open Questions
- What is the current step-4 drop-off reason? (analytics needed)
- Does marketing have a hard ship date?`

function TypewriterDemo() {
  const [outputText, setOutputText] = useState('')
  const [phase, setPhase] = useState('idle') // idle | typing | done
  const [started, setStarted] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!started) return
    setPhase('typing')
    setOutputText('')
    let i = 0
    intervalRef.current = setInterval(() => {
      i += 3
      setOutputText(DEMO_OUTPUT.slice(0, i))
      if (i >= DEMO_OUTPUT.length) {
        clearInterval(intervalRef.current)
        setPhase('done')
      }
    }, 18)
    return () => clearInterval(intervalRef.current)
  }, [started])

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-border bg-surface/50 overflow-hidden shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface/80">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-muted text-xs font-mono">pilot — PRD Generator</span>
        </div>
        <div className="w-16" />
      </div>
      <div className="grid grid-cols-2 divide-x divide-border min-h-[300px]">
        {/* Input */}
        <div className="p-5 flex flex-col gap-3">
          <p className="text-muted text-[10px] uppercase tracking-widest font-body">Raw Input</p>
          <p className="text-paper/55 text-xs font-body leading-relaxed flex-1">{DEMO_INPUT}</p>
          {!started && (
            <button
              onClick={() => setStarted(true)}
              className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-body font-medium transition-all duration-150 hover:opacity-90 self-start"
              style={{ background: '#e8520a' }}
            >
              <Zap size={12} />
              Generate PRD
            </button>
          )}
          {started && (
            <div className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-body font-medium self-start opacity-50 cursor-default" style={{ background: '#e8520a' }}>
              <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              Generating...
            </div>
          )}
        </div>
        {/* Output */}
        <div className="p-5 overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest font-body mb-3" style={{ color: '#e8520a' }}>Output</p>
          {!started && (
            <p className="text-muted/40 text-xs font-body italic">Click Generate to see Pilot in action →</p>
          )}
          {started && (
            <div className="font-mono text-[11px] leading-relaxed text-paper/70 whitespace-pre-wrap">
              {outputText}
              {phase === 'typing' && (
                <span className="inline-block w-0.5 h-3.5 bg-accent rounded-full animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MODES ────────────────────────────────────────────────────────────────────

const MODES = [
  { icon: FileText, label: 'PRD Generator', color: '#e8520a', desc: 'Structured product requirements docs in 30 seconds.' },
  { icon: CheckSquare, label: 'User Stories', color: '#7c6af7', desc: 'Sprint-ready Jira tickets with acceptance criteria.' },
  { icon: Users, label: 'Stakeholder Update', color: '#2dd4bf', desc: 'Executive summaries that actually get read.' },
  { icon: Map, label: 'Roadmap Builder', color: '#f59e0b', desc: 'Opinionated quarterly plans with explicit tradeoffs.' },
]

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function Stat({ number, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl md:text-5xl text-paper mb-1">{number}</div>
      <div className="text-muted text-sm font-body">{label}</div>
    </div>
  )
}

function LiveCounter() {
  const BASE = 3847
  const [count, setCount] = useState(BASE)
  const [ref, inView] = useInView()

  useEffect(() => {
    if (!inView) return
    // Tick up slowly to simulate live usage
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [inView])

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl md:text-5xl mb-1" style={{ color: '#e8520a' }}>
        {count.toLocaleString()}
      </div>
      <div className="text-muted text-sm font-body">artifacts generated worldwide</div>
    </div>
  )
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-ink text-paper font-body overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${scrolled ? 'bg-ink/90 backdrop-blur-md border-b border-border/50' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-display text-lg text-paper">Pilot</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden sm:block text-muted text-xs font-body hover:text-paper transition-colors duration-150"
          >
            Pricing
          </a>
          <a
            href="https://www.ycombinator.com/rfs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-muted text-xs font-body hover:text-paper transition-colors duration-150"
          >
            YC RFS ↗
          </a>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium font-body hover:bg-accent/90 transition-all duration-150"
          >
            Try Pilot
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 grid-bg">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(232,82,10,0.1) 0%, transparent 68%)' }} />

        {/* Event badge */}
        <div className="animate-fade-up mb-8" style={{ animationFillMode: 'both', animationDelay: '0ms' }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/25 bg-accent/8 text-xs font-body"
            style={{ background: 'rgba(232,82,10,0.08)', color: '#e8520a' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            YC RFS Spring 2026 · c0mpiled · San Fransokyo
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-paper leading-[1.05] mb-6 animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '80ms' }}>
          Cursor for PMs.
          <br />
          <span className="shimmer-text">Built for makers.</span>
        </h1>

        {/* Sub */}
        <p className="text-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-4 font-body animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '160ms' }}>
          Pilot turns raw chaos — meeting notes, Slack threads, customer complaints —
          into structured PRDs, user stories, stakeholder updates, and roadmaps.
          <strong className="text-paper/80 font-normal"> In under 30 seconds.</strong>
        </p>

        {/* YC hook */}
        <p className="text-muted/60 text-sm font-body mb-10 animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
          Y Combinator's RFS explicitly calls for this. We built it.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-16 animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '260ms' }}>
          <Link href="/app"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-white font-medium font-body text-base hover:bg-accent/90 transition-all duration-150 glow-accent">
            Try Pilot for free →
          </Link>
          <Link href="#how"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border text-paper/60 font-medium font-body text-base hover:border-paper/30 hover:text-paper transition-all duration-150">
            See how it works
          </Link>
        </div>

        {/* Live demo */}
        <div className="w-full animate-fade-up" style={{ animationFillMode: 'both', animationDelay: '360ms' }}>
          <TypewriterDemo />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
              <Stat number="50M+" label="Product managers globally" />
              <Stat number="60%" label="Time lost to documentation" />
              <Stat number="3 hrs" label="Average PRD write time" />
              <Stat number="30 sec" label="With Pilot" />
              <LiveCounter />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-muted text-xs font-body uppercase tracking-widest text-center mb-14">The PM tax</p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <FadeUp delay={0}>
              <div className="h-full rounded-2xl border border-border bg-surface/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <span className="text-red-400 font-body font-semibold text-sm">✕</span>
                  </div>
                  <h3 className="font-display text-xl text-paper">Before Pilot</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Messy notes sitting in Notion for days',
                    '3-hour PRDs written from a blank page',
                    'User stories that miss edge cases every sprint',
                    'Stakeholder updates no one reads',
                    'Roadmaps that lack explicit tradeoffs',
                    'Context lost between standups',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted text-sm font-body">
                      <span className="text-red-400/50 mt-0.5 flex-shrink-0 font-mono">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
            {/* After */}
            <FadeUp delay={100}>
              <div className="h-full rounded-2xl border p-8"
                style={{ borderColor: 'rgba(232,82,10,0.3)', background: 'rgba(232,82,10,0.03)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(232,82,10,0.15)' }}>
                    <span className="font-body font-semibold text-sm" style={{ color: '#e8520a' }}>✓</span>
                  </div>
                  <h3 className="font-display text-xl text-paper">With Pilot</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Paste notes → complete PRD in 30 seconds',
                    'Sprint-ready user stories with acceptance criteria',
                    'Executive summaries with TL;DR and decisions needed',
                    'Quarterly roadmaps with themes and tradeoffs',
                    'One-line refinement for any output',
                    'Full history, export, and multi-doc context',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-paper/80 text-sm font-body">
                      <span className="mt-0.5 flex-shrink-0 font-body" style={{ color: '#e8520a' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── MODES GRID ── */}
      <section className="py-24 px-6 border-t border-border" id="features">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="font-display text-4xl md:text-5xl text-paper text-center mb-4">
              Four artifacts. One tool.
            </h2>
            <p className="text-muted text-center text-base font-body max-w-lg mx-auto mb-14">
              Every format a PM needs to communicate with their team, stakeholders, and themselves.
            </p>
          </FadeUp>
          <div className="grid sm:grid-cols-2 gap-4">
            {MODES.map((mode, i) => {
              const Icon = mode.icon
              return (
                <FadeUp key={mode.label} delay={i * 70}>
                  <div className="card-hover h-full rounded-2xl border border-border bg-surface/30 p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: mode.color + '1a' }}>
                      <Icon size={18} style={{ color: mode.color }} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-paper mb-1">{mode.label}</h3>
                      <p className="text-muted text-sm font-body">{mode.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 border-t border-border" id="how">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="font-display text-4xl md:text-5xl text-paper text-center mb-16">
              Raw chaos → polished artifact<br />in under 90 seconds.
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { n: '01', title: 'Paste your chaos', body: 'Meeting notes, Slack threads, Jira dumps, customer complaints — whatever raw material you have right now.' },
              { n: '02', title: 'Choose your artifact', body: 'PRD, User Stories, Stakeholder Update, or Roadmap. Pilot picks the right format and structure automatically.' },
              { n: '03', title: 'Refine, export, ship', body: 'Get a polished artifact in seconds. Refine with one sentence. Export as Markdown. Move on.' },
            ].map((s, i) => (
              <FadeUp key={s.n} delay={i * 90}>
                <div className="text-center">
                  <div className="font-display text-6xl text-muted/15 mb-4 leading-none select-none">{s.n}</div>
                  <h3 className="font-display text-xl text-paper mb-3">{s.title}</h3>
                  <p className="text-muted text-sm font-body leading-relaxed">{s.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE CURSOR PARALLEL ── */}
      <section className="py-28 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/25 text-xs font-body mb-8"
              style={{ background: 'rgba(232,82,10,0.08)', color: '#e8520a' }}>
              YC Request for Startups · Spring 2026
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-paper mb-8 leading-tight">
              "Cursor for PM"
            </h2>
            <p className="text-muted text-lg font-body leading-relaxed mb-6 max-w-xl mx-auto">
              Cursor gave engineers a 10× productivity multiplier by collapsing the gap between intent and working code.
            </p>
            <p className="text-paper/80 text-lg font-body leading-relaxed mb-6 max-w-xl mx-auto">
              PMs have the same problem. The gap between raw thinking and structured communication is enormous — and it's swallowing 60% of every PM's day.
            </p>
            <p className="text-muted text-base font-body leading-relaxed mb-12 max-w-xl mx-auto">
              Pilot is the AI layer that closes that gap.
              50M+ PMs globally. Trillions of dollars in wasted productivity. YC asked for this.
              <strong className="text-paper/70 font-normal"> We built it.</strong>
            </p>

            {/* Quote box */}
            <div className="rounded-2xl border p-6 mb-12 text-left"
              style={{ borderColor: 'rgba(232,82,10,0.2)', background: 'rgba(232,82,10,0.04)' }}>
              <p className="text-paper/80 text-base font-body leading-relaxed italic mb-3">
                "There's a similar opportunity to build an AI-native product management tool. Most project management software was built before AI. We're looking for founders building for the AI-first era."
              </p>
              <p className="text-muted text-sm font-body">
                — Y Combinator, Request for Startups Spring 2026
              </p>
            </div>

            <Link href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-white font-medium font-body text-base hover:bg-accent/90 transition-all duration-150 glow-accent">
              Start building with Pilot →
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURES CALLOUT ── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-muted text-xs font-body uppercase tracking-widest text-center mb-10">Everything included</p>
          </FadeUp>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { title: 'Streaming generation', body: 'Output starts appearing in under 1 second.' },
              { title: 'Smart Ask', body: 'AI clarifying questions that sharpen your output.' },
              { title: 'Inline refinement', body: '"Make it shorter" — one line changes everything.' },
              { title: 'Multi-doc context', body: 'Paste 3 sources, get one coherent artifact.' },
              { title: 'Persistent history', body: 'Every generation saved. Grouped by date.' },
              { title: 'Export as Markdown', body: 'Copy or download. Works in Notion, Linear, Jira.' },
            ].map((f, i) => (
              <FadeUp key={f.title} delay={i * 50}>
                <div className="rounded-xl border border-border bg-surface/20 px-5 py-4">
                  <p className="text-paper/90 text-sm font-body font-medium mb-1">{f.title}</p>
                  <p className="text-muted text-xs font-body">{f.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-6 border-t border-border" id="pricing">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-muted text-xs font-body uppercase tracking-widest text-center mb-4">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl text-paper text-center mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-muted text-center text-base font-body max-w-lg mx-auto mb-14">
              Start free. Upgrade when your team needs more.
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-4 items-start">
            {/* Free */}
            <FadeUp delay={0}>
              <div className="rounded-2xl border border-border bg-surface/30 p-7">
                <div className="mb-6">
                  <p className="text-muted text-xs font-body uppercase tracking-widest mb-2">Free</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl text-paper">$0</span>
                    <span className="text-muted text-sm font-body">forever</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {[
                    '10 generations / day',
                    'All 4 artifact types',
                    'Smart Ask',
                    'Blitz Mode',
                    'Local history (20 items)',
                    'Markdown export',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-body text-paper/70">
                      <span className="text-muted">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/app" className="block text-center px-4 py-2.5 rounded-lg border border-border text-muted text-sm font-body hover:text-paper hover:border-paper/20 transition-all duration-150">
                  Start free →
                </Link>
              </div>
            </FadeUp>

            {/* Pro */}
            <FadeUp delay={80}>
              <div className="rounded-2xl p-7 relative" style={{ border: '1px solid rgba(232,82,10,0.4)', background: 'rgba(232,82,10,0.04)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium font-body text-white" style={{ background: '#e8520a' }}>Most Popular</span>
                </div>
                <div className="mb-6">
                  <p className="text-xs font-body uppercase tracking-widest mb-2" style={{ color: '#e8520a' }}>Pro</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl text-paper">$19</span>
                    <span className="text-muted text-sm font-body">/ month</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Unlimited generations',
                    'All 4 artifact types',
                    'Smart Ask + Blitz Mode',
                    'Unlimited history + sync',
                    'Priority API (faster)',
                    'PM Score analytics',
                    'Notion / Linear export',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-body text-paper/80">
                      <span style={{ color: '#e8520a' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/app" className="block text-center px-4 py-2.5 rounded-lg text-white text-sm font-medium font-body hover:opacity-90 transition-all duration-150 glow-accent" style={{ background: '#e8520a' }}>
                  Get Pro →
                </Link>
              </div>
            </FadeUp>

            {/* Team */}
            <FadeUp delay={160}>
              <div className="rounded-2xl border border-border bg-surface/30 p-7">
                <div className="mb-6">
                  <p className="text-muted text-xs font-body uppercase tracking-widest mb-2">Team</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl text-paper">$49</span>
                    <span className="text-muted text-sm font-body">/ seat / mo</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Everything in Pro',
                    'Team workspace & sharing',
                    'Jira / Linear integration',
                    'SSO (Google, Okta)',
                    'Admin dashboard',
                    'Priority support',
                    'Custom system prompts',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-body text-paper/70">
                      <span className="text-muted">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/app" className="block text-center px-4 py-2.5 rounded-lg border border-border text-muted text-sm font-body hover:text-paper hover:border-paper/20 transition-all duration-150">
                  Talk to us →
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 border-t border-border text-center">
        <FadeUp>
          <div className="max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Zap size={24} className="text-white" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-paper mb-5">
              Ship better PM work.<br />Starting right now.
            </h2>
            <p className="text-muted text-base font-body mb-10">
              No signup. No setup. Paste your notes and go.
            </p>
            <Link href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-white font-semibold font-body text-base hover:bg-accent/90 transition-all duration-150 glow-accent">
              Open Pilot →
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <div>
              <div className="font-display text-base text-paper leading-tight">Pilot</div>
              <div className="text-muted text-xs font-body">AI Copilot for Product Managers</div>
            </div>
          </div>

          {/* Event details */}
          <div className="text-center">
            <div className="text-paper/70 text-xs font-body mb-1">
              <span className="text-accent font-medium">c0mpiled</span> · San Fransokyo
            </div>
            <div className="text-muted text-xs font-body">
              YC RFS Spring 2026 · AI Hackathon · Toranomon Hills, Tokyo
            </div>
            <div className="text-muted/50 text-xs font-body mt-0.5">
              Organized by Transpose Platform × UTokyo IPC
            </div>
          </div>

          <div className="text-muted/40 text-xs font-body">
            March 8, 2026
          </div>
        </div>
      </footer>
    </div>
  )
}
