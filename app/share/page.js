'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

const MODES = {
  prd: { label: 'PRD', color: '#e8520a' },
  stories: { label: 'User Stories', color: '#7c6af7' },
  stakeholder: { label: 'Stakeholder Update', color: '#2dd4bf' },
  roadmap: { label: 'Roadmap', color: '#f59e0b' },
}

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-paper font-semibold">{part.slice(2, -2)}</strong>
      : part
  )
}

function OutputRenderer({ content, color }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1 font-body text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="font-display text-2xl mt-4 mb-2 first:mt-0" style={{ color }}>{line.slice(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i} className="font-display text-lg text-paper mt-4 mb-1 font-normal">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="text-paper/80 font-semibold mt-3 mb-1 text-sm uppercase tracking-wide">{line.slice(4)}</h3>
        if (line.startsWith('- [ ] ')) return <div key={i} className="flex items-start gap-2 ml-4 text-paper/70"><span className="mt-0.5 text-muted">☐</span><span>{parseBold(line.slice(6))}</span></div>
        if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} className="flex items-start gap-2 ml-4 text-paper/80"><span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} /><span>{parseBold(line.slice(2))}</span></div>
        if (/^\d+\. /.test(line)) { const m = line.match(/^(\d+)\. (.*)/); return <div key={i} className="flex items-start gap-2 ml-4 text-paper/80"><span className="font-mono text-xs mt-0.5 w-5 text-right flex-shrink-0" style={{ color }}>{m[1]}.</span><span>{parseBold(m[2])}</span></div> }
        if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 pl-3 text-paper/60 italic my-2" style={{ borderColor: color }}>{line.slice(2)}</blockquote>
        if (line === '---') return <hr key={i} className="border-border my-4" />
        if (line.trim() === '') return <div key={i} className="h-2" />
        return <p key={i} className="text-paper/75">{parseBold(line)}</p>
      })}
    </div>
  )
}

export default function SharePage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1)
      if (!hash) { setError(true); return }
      const decoded = decodeURIComponent(escape(atob(hash)))
      const parsed = JSON.parse(decoded)
      setData(parsed)
    } catch {
      setError(true)
    }
  }, [])

  const mode = data ? (MODES[data.mode] || MODES.prd) : null

  return (
    <div className="min-h-screen bg-ink text-paper font-body">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-display text-lg text-paper">Pilot</span>
          {mode && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-body font-medium ml-1"
              style={{ background: mode.color + '20', color: mode.color }}>
              {mode.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium font-body hover:bg-accent/90 transition-all duration-150">
            Try Pilot →
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {error && (
          <div className="text-center">
            <p className="text-muted text-sm font-body mb-4">This share link is invalid or has expired.</p>
            <Link href="/app" className="text-accent text-sm font-body hover:underline">Open Pilot →</Link>
          </div>
        )}
        {!data && !error && (
          <div className="flex items-center justify-center h-40">
            <span className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        )}
        {data && (
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Link href="/app" className="flex items-center gap-1.5 text-muted text-xs font-body hover:text-paper transition-colors duration-150">
                <ArrowLeft size={12} /> Back to Pilot
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-surface/30 p-8">
              <OutputRenderer content={data.output} color={mode?.color || '#e8520a'} />
            </div>
            <div className="mt-6 text-center">
              <p className="text-muted text-xs font-body mb-3">Generated with Pilot — AI Copilot for Product Managers</p>
              <Link href="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium font-body text-sm hover:bg-accent/90 transition-all duration-150">
                Generate your own →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
