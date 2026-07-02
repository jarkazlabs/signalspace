// PatternCard.jsx — Isolierte Pattern Card Komponente
// Parst Noten-Text und zeigt Dot-Visualisierung

import { MAX_STEPS, parseNotes } from '../lib/pattern.js'

// Alle einzigartigen Noten-Namen (ohne Pausen) für die Y-Achse
function uniqueNotes(steps) {
  const seen = new Set()
  const result = []
  steps.forEach(s => {
    if (!s.isPause && !seen.has(s.token)) {
      seen.add(s.token)
      result.push(s.token)
    }
  })
  return result
}

// Dot-Grid Visualisierung
function DotGrid({ steps }) {
  if (!steps.length) return null
  const notes = uniqueNotes(steps)
  if (!notes.length) return null

  return (
    <div className="font-mono text-2xs leading-none select-none">
      {notes.map(note => (
        <div key={note} className="flex items-center gap-1.5 mb-1.5">
          {/* Note label */}
          <span className="text-ss-dim w-8 flex-shrink-0 text-right pr-1"
            style={{ fontSize: 10 }}>{note}</span>
          {/* Dots */}
          <div className="flex items-center gap-1">
            {steps.map((step, i) => {
              const active = !step.isPause && step.token === note
              return (
                <div key={i}
                  className="rounded-full flex-shrink-0 transition-colors"
                  style={{
                    width:  active ? 7 : 5,
                    height: active ? 7 : 5,
                    backgroundColor: active ? '#1a1814' : 'transparent',
                    border: active ? 'none' : '1px solid #d4d0c8',
                    opacity: step.isPause ? 0.2 : 1,
                  }}
                />
              )
            })}
          </div>
        </div>
      ))}
      {/* Step numbers */}
      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-ss-border/40">
        <span className="w-8 flex-shrink-0" />
        <div className="flex items-center gap-1">
          {steps.map((step, i) => (
            <span key={i} className="flex-shrink-0 text-center text-ss-ghost/40"
              style={{ width: 7, fontSize: 8 }}>
              {step.isPause ? '·' : i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Card-Inhalt (read-only, auf dem Canvas) ──────────────
export function PatternCardContent({ card }) {
  const steps = parseNotes(card.notes)

  return (
    <div className="flex flex-col gap-2.5">
      {card.title && (
        <p className="font-sans font-semibold text-sm text-ss-ink leading-snug">{card.title}</p>
      )}

      {/* Meta-Zeile */}
      {(card.bpm || card.scale) && (
        <div className="flex items-center gap-3">
          {card.bpm   && <span className="font-mono text-2xs text-ss-ghost">{card.bpm} bpm</span>}
          {card.scale && <span className="font-mono text-2xs text-ss-ghost">{card.scale}</span>}
        </div>
      )}

      {/* Noten-Input Anzeige */}
      {card.notes && (
        <div className="font-mono text-2xs text-ss-dim bg-ss-surface/60 rounded-lg px-2.5 py-2 border border-ss-border/50 leading-relaxed">
          {card.notes}
        </div>
      )}

      {/* Dot-Visualisierung */}
      {steps.length > 0 && (
        <div className="px-1 py-1.5">
          <DotGrid steps={steps} />
        </div>
      )}

      {/* Beschreibung */}
      {card.description && (
        <p className="text-xs text-ss-dim leading-relaxed">{card.description}</p>
      )}
    </div>
  )
}

// ─── Pattern Form (für Add + Edit Modal) ─────────────────
export function PatternForm({ data, onChange }) {
  const steps = parseNotes(data.notes || '')
  const remaining = MAX_STEPS - steps.length

  return (
    <div className="flex flex-col gap-4">

      {/* Titel */}
      <div>
        <label className="text-xs font-semibold text-ss-dim uppercase tracking-wide block mb-1.5">
          Titel <span className="font-normal text-ss-ghost normal-case">(optional)</span>
        </label>
        <input
          value={data.title || ''}
          onChange={e => onChange({ ...data, title: e.target.value })}
          placeholder="z.B. Ambient Idea 01"
          className="w-full border border-ss-border rounded-lg px-3 py-2 text-sm text-ss-ink focus:outline-none focus:border-ss-ink transition-colors"
        />
      </div>

      {/* Noten-Eingabe */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-ss-dim uppercase tracking-wide">
            Notes / Steps
          </label>
          <span className={`font-mono text-2xs ${remaining <= 0 ? 'text-red-400' : 'text-ss-ghost/60'}`}>
            {steps.length}/{MAX_STEPS}
          </span>
        </div>
        <input
          value={data.notes || ''}
          onChange={e => onChange({ ...data, notes: e.target.value })}
          placeholder="C4 Eb4 G4 — G4 C5"
          className="w-full border border-ss-border rounded-lg px-3 py-2 text-sm text-ss-ink font-mono focus:outline-none focus:border-ss-ink transition-colors bg-white/60"
        />
        <p className="font-mono text-2xs text-ss-ghost/60 mt-1.5">
          Space-separated. Use — for pause. Max {MAX_STEPS} steps.
        </p>
      </div>

      {/* Live-Vorschau */}
      {steps.length > 0 && (
        <div className="p-3 rounded-lg border border-ss-border bg-ss-surface/40">
          <p className="font-mono text-2xs text-ss-ghost/60 uppercase tracking-widest mb-2.5">Preview</p>
          <DotGrid steps={steps} />
        </div>
      )}

      {/* BPM + Scale — nebeneinander */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-ss-dim uppercase tracking-wide block mb-1.5">BPM <span className="font-normal text-ss-ghost normal-case">(optional)</span></label>
          <input
            value={data.bpm || ''}
            onChange={e => onChange({ ...data, bpm: e.target.value })}
            placeholder="120"
            className="w-full border border-ss-border rounded-lg px-3 py-2 text-sm text-ss-ink font-mono focus:outline-none focus:border-ss-ink transition-colors"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-ss-dim uppercase tracking-wide block mb-1.5">Scale <span className="font-normal text-ss-ghost normal-case">(optional)</span></label>
          <input
            value={data.scale || ''}
            onChange={e => onChange({ ...data, scale: e.target.value })}
            placeholder="C minor"
            className="w-full border border-ss-border rounded-lg px-3 py-2 text-sm text-ss-ink focus:outline-none focus:border-ss-ink transition-colors"
          />
        </div>
      </div>

      {/* Notiz */}
      <div>
        <label className="text-xs font-semibold text-ss-dim uppercase tracking-wide block mb-1.5">Notes <span className="font-normal text-ss-ghost normal-case">(optional)</span></label>
        <textarea
          value={data.description || ''}
          onChange={e => onChange({ ...data, description: e.target.value })}
          rows={3}
          placeholder="slow movement, use in verse..."
          className="w-full border border-ss-border rounded-lg px-3 py-2 text-sm text-ss-ink focus:outline-none focus:border-ss-ink transition-colors resize-none"
        />
      </div>
    </div>
  )
}
