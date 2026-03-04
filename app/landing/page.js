'use client'

import { useEffect, useRef, useState } from 'react'
import { Zap, FileText, CheckSquare, Users, Map, ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// ─── INTERSECTION OBSERVER HOOK ─────────────────────────────────────────────

function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}

// ─── ANIMATED SECTION ────────────────────────────────────────────────────────

function AnimatedSection({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── FEATURE CARDS DATA ───────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'prd',
    icon: FileText,
    label: 'PRD Generator',
    color: '#e8520a',
    description: 'Turn messy notes into a structured Product Requirements Doc that engineers actually read.',
    snippet: `# Onboarding Redesign — PRD
## Problem Statement
60% of users drop off at step 4 of 8...
## Goals & Success Metrics
- Reduce onboarding to 3 steps
- Improve activation rate to 70%+`,
  },
  {
    id: 'stories',
    icon: CheckSquare,
    label: 'User Stories',
    color: '#7c6af7',
    description: 'Break epics into sprint-ready Jira tickets with acceptance criteria and story points.',
    snippet: `## Story 1: Notification Preferences
**As a** power user, **I want to** customize...

**Acceptance Criteria:**
- [ ] Toggle per-notification-type
- [ ] Quiet hours with timezone support
**Story Points:** 5 | **Priority:** P1`,
  },
  {
    id: 'stakeholder',
    icon: Users,
    label: 'Stakeholder Update',
    color: '#2dd4bf',
    description: 'Turn status chaos into an executive summary that gets read, not skimmed.',
    snippet: `# Sprint 14 — Stakeholder Update
## TL;DR
- Search usage up 34% after redesign
- API docs pushed to Sprint 15
- Need legal sign-off on data sharing

## Decisions Needed
Approve API timeline extension?`,
  },
  {
    id: 'roadmap',
    icon: Map,
    label: 'Roadmap Builder',
    color: '#f59e0b',
    description: 'Produce opinionated quarterly roadmaps with tradeoffs, themes, and what you\'re NOT doing.',
    snippet: `# Q2 Roadmap — Growth Platform
## North Star: DAU +40%

## Theme 1: Activation
- Onboarding redesign (L, High) ✓
- Email sequences (M, High)

## What We're NOT Doing
Mobile app — insufficient DAU base`,
  },
]

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [demoActive, setDemoActive] = useState(false)

  return (
    <div className="min-h-screen bg-ink text-paper font-body">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-ink/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display text-lg text-paper">Pilot</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium font-body hover:bg-accent/90 transition-all duration-150"
        >
          Try Pilot
          <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 grid-bg">
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(232,82,10,0.12) 0%, transparent 70%)',
          }}
        />

        <div
          className="animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '0ms' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-body mb-8">
            <Zap size={11} />
            Built for YC RFS Spring 2026
          </div>
        </div>

        <h1
          className="font-display text-6xl md:text-7xl lg:text-8xl text-paper leading-tight mb-6 animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '80ms' }}
        >
          Turn PM chaos<br />
          <span className="shimmer-text">into clarity.</span>
        </h1>

        <p
          className="text-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-body animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '160ms' }}
        >
          Pilot is the AI copilot that turns meeting notes, Slack threads, and
          customer chaos into PRDs, user stories, and stakeholder updates —{' '}
          <em className="text-paper/70 not-italic">in seconds.</em>
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-3 animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '240ms' }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium font-body text-base hover:bg-accent/90 transition-all duration-150 glow-accent"
          >
            Try Pilot →
          </Link>
          <button
            onClick={() => setDemoActive(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-paper/70 font-medium font-body text-base hover:border-paper/30 hover:text-paper transition-all duration-150"
          >
            Watch demo
          </button>
        </div>

        {/* Hero art — fake terminal */}
        <div
          className="mt-16 w-full max-w-3xl mx-auto rounded-2xl border border-border bg-surface/60 backdrop-blur-sm overflow-hidden shadow-2xl animate-fade-up"
          style={{ animationFillMode: 'both', animationDelay: '360ms' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-muted text-xs font-mono">pilot — PRD Generator</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border min-h-[240px]">
            <div className="p-4">
              <p className="text-muted text-[10px] uppercase tracking-widest mb-2 font-body">Raw Input</p>
              <p className="text-paper/50 text-xs font-body leading-relaxed">
                Users keep complaining onboarding takes too long. Currently 8 steps, 60% drop at step 4.
                CEO wants DAU up 20% before the marketing campaign in Q2. We need to fix this...
              </p>
            </div>
            <div className="p-4">
              <p className="text-accent text-[10px] uppercase tracking-widest mb-2 font-body">Output</p>
              <div className="space-y-1.5">
                <p className="text-paper text-xs font-display">Onboarding Redesign — PRD</p>
                <p className="text-muted text-[11px] font-body">## Problem Statement</p>
                <p className="text-paper/60 text-[11px] font-body">60% of users drop at step 4 of 8, costing activation...</p>
                <p className="text-muted text-[11px] font-body mt-2">## Goals & Success Metrics</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-accent" />
                  <p className="text-paper/60 text-[11px] font-body">Reduce to 3 steps by Q2</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-accent" />
                  <p className="text-paper/60 text-[11px] font-body">Activation rate → 70%+</p>
                </div>
                <span className="inline-block w-0.5 h-3 bg-accent rounded-full animate-pulse ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <p className="text-muted text-center text-sm font-body uppercase tracking-widest mb-16">
              The PM tax is real
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Before */}
            <AnimatedSection delay={0}>
              <div className="rounded-2xl border border-border bg-surface/40 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-sm">✕</span>
                  </div>
                  <h3 className="font-display text-xl text-paper">Before Pilot</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Messy meeting notes collecting dust in Notion',
                    '3+ hours writing a PRD from scratch',
                    'User stories that miss edge cases',
                    'Stakeholder updates nobody reads',
                    'Context lost between standups',
                    'Saturday spent on the roadmap doc',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted text-sm font-body">
                      <span className="text-red-400/60 mt-0.5 flex-shrink-0">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Animated arrow */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
              <ArrowRight className="text-accent" size={24} />
            </div>

            {/* After */}
            <AnimatedSection delay={120}>
              <div className="rounded-2xl border p-8" style={{ borderColor: '#e8520a40', background: 'rgba(232,82,10,0.04)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,82,10,0.2)' }}>
                    <span className="text-accent text-sm">✓</span>
                  </div>
                  <h3 className="font-display text-xl text-paper">After Pilot</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Paste chaos, get a structured PRD in 30 seconds',
                    'Sprint-ready user stories with acceptance criteria',
                    'Stakeholder updates executives actually read',
                    'Quarterly roadmaps with explicit tradeoffs',
                    'Refine with one line of feedback',
                    'Ship the product, not the documentation',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-paper/80 text-sm font-body">
                      <span className="mt-0.5 flex-shrink-0" style={{ color: '#e8520a' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID ── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display text-4xl text-paper text-center mb-4">
              Four artifacts. One tool.
            </h2>
            <p className="text-muted text-center text-base font-body max-w-lg mx-auto mb-14">
              Everything a PM needs to communicate with clarity — without the hours of formatting.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <AnimatedSection key={feature.id} delay={i * 80}>
                  <div
                    className="card-hover rounded-2xl border border-border bg-surface/30 p-6 cursor-default h-full"
                    style={{ '--hover-border': feature.color }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: feature.color + '20' }}
                      >
                        <Icon size={18} style={{ color: feature.color }} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-paper mb-1">{feature.label}</h3>
                        <p className="text-muted text-sm font-body leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-ink/60 border border-border/60 p-3 font-mono text-[11px] text-paper/50 leading-relaxed whitespace-pre-wrap">
                      {feature.snippet}
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display text-4xl text-paper text-center mb-16">
              From chaos to shipped in 90 seconds.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Paste your chaos',
                desc: 'Meeting notes, Slack threads, customer complaints, Jira dumps — whatever raw material you have.',
              },
              {
                step: '02',
                title: 'Choose your artifact',
                desc: 'PRD, User Stories, Stakeholder Update, or Roadmap. Pick the format your team needs right now.',
              },
              {
                step: '03',
                title: 'Copy, refine, ship',
                desc: 'Get a polished artifact instantly. Refine with one sentence. Export as Markdown. Done.',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 100}>
                <div className="text-center">
                  <div className="font-display text-6xl text-muted/20 mb-4 leading-none">{item.step}</div>
                  <h3 className="font-display text-xl text-paper mb-3">{item.title}</h3>
                  <p className="text-muted text-sm font-body leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PITCH ── */}
      <section className="py-28 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-muted text-sm font-body uppercase tracking-widest mb-6">The thesis</p>
            <h2 className="font-display text-4xl md:text-5xl text-paper mb-6 leading-tight">
              "We're doing for PMs what{' '}
              <span className="shimmer-text">Cursor did for engineers.</span>"
            </h2>
            <p className="text-muted text-base font-body leading-relaxed mb-6 max-w-xl mx-auto">
              There are 50M+ product managers globally spending 60%+ of their time on documentation
              and communication — not thinking, not deciding, not shipping.
            </p>
            <p className="text-muted text-base font-body leading-relaxed mb-12 max-w-xl mx-auto">
              Cursor collapsed the gap between engineering intent and working code.
              Pilot collapses the gap between PM thinking and structured communication.
              The market is enormous. The problem is universal. The timing is now.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-white font-medium font-body text-base hover:bg-accent/90 transition-all duration-150 glow-accent"
            >
              Start building →
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <div>
              <span className="font-display text-base text-paper">Pilot</span>
              <p className="text-muted text-xs font-body">AI Copilot for Product Managers</p>
            </div>
          </div>
          <p className="text-muted text-xs font-body text-center md:text-right">
            Built for <span className="text-paper/60">c0mpiled</span> · San Fransokyo · YC RFS Spring 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
