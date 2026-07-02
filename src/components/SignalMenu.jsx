import { useState } from 'react'
import { getYouTubeVideoId } from '../lib/youtube.js'

const MODES = [
  { id: 'signal', label: 'Signal' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'chain', label: 'Chain' },
]

function normalizeUrl(value) {
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) return null
  const looksLikeUrl = /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed) || /^[^\s@]+\.[^\s@]+/.test(trimmed)
  if (!looksLikeUrl) return null

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    return parsed.href
  } catch {
    return null
  }
}

function createSignalFromInput(value, headline = '') {
  const trimmed = value.trim()
  if (!trimmed) return null
  const title = headline.trim()

  const youtubeId = getYouTubeVideoId(trimmed)
  if (youtubeId) {
    return {
      type: 'youtube',
      data: {
        title: title || 'YouTube Signal',
        url: normalizeUrl(trimmed) || trimmed,
        description: '',
      },
    }
  }

  const url = normalizeUrl(trimmed)
  if (url) {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return {
      type: 'link',
      data: {
        title: title || host,
        url,
        description: '',
      },
    }
  }

  const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const fallbackTitle = lines[0]?.slice(0, 90) || 'Note Signal'
  const description = title ? trimmed : (lines.length > 1 ? lines.slice(1).join('\n') : trimmed)

  return {
    type: 'note',
    data: {
      title: title || fallbackTitle,
      description,
      tint: 'paper',
    },
  }
}

function Field({ value, onChange, placeholder, className = '', multiline = false, autoFocus = false }) {
  const base = 'w-full rounded-lg border border-ss-border bg-ss-surface/45 px-2.5 py-2 text-sm text-ss-ink outline-none transition-colors placeholder:text-ss-ghost focus:border-ss-muted focus:bg-white'
  if (multiline) {
    return (
      <textarea
        autoFocus={autoFocus}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${base} resize-none leading-relaxed ${className}`}
      />
    )
  }

  return (
    <input
      autoFocus={autoFocus}
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${base} ${className}`}
    />
  )
}

export default function SignalMenu({ onSelect, style }) {
  const [mode, setMode] = useState('signal')
  const [signal, setSignal] = useState({ title: '', content: '' })
  const [pattern, setPattern] = useState({ title: '', notes: '', bpm: '', scale: '' })
  const [chain, setChain] = useState({ title: 'Signal Chain', nodes: '', description: '' })

  function canAdd() {
    if (mode === 'signal') return Boolean(signal.title.trim() || signal.content.trim())
    if (mode === 'pattern') return Boolean(pattern.title.trim() || pattern.notes.trim())
    return Boolean(chain.title.trim() || chain.nodes.trim() || chain.description.trim())
  }

  function capture() {
    if (mode === 'signal') {
      const nextSignal = createSignalFromInput(signal.content, signal.title)
      if (!nextSignal) return
      onSelect(nextSignal.type, nextSignal.data)
      setSignal({ title: '', content: '' })
      return
    }

    if (mode === 'pattern') {
      onSelect('pattern', {
        title: pattern.title.trim(),
        notes: pattern.notes.trim(),
        bpm: pattern.bpm.trim(),
        scale: pattern.scale.trim(),
        description: '',
      })
      return
    }

    onSelect('chain', {
      title: chain.title.trim() || 'Signal Chain',
      chain: chain.nodes
        .split(/\n|,|→/)
        .map(node => node.trim())
        .filter(Boolean),
      description: chain.description.trim(),
      tint: 'sage',
    })
  }

  function submit(event) {
    event.preventDefault()
    capture()
  }

  return (
    <div
      className="absolute z-50 flex h-[300px] w-[300px] flex-col rounded-xl border border-ss-border bg-white/95 p-3 shadow-[0_18px_48px_rgba(58,45,32,0.16)] backdrop-blur-md"
      style={style}
      onClick={event => event.stopPropagation()}
    >
      <div className="mb-2 grid grid-cols-3 rounded-lg border border-ss-border bg-ss-surface/45 p-1">
        {MODES.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              mode === item.id
                ? 'bg-white text-ss-ink shadow-sm'
                : 'text-ss-ghost hover:text-ss-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-2">
        {mode === 'signal' && (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Field
              autoFocus
              value={signal.title}
              onChange={title => setSignal(current => ({ ...current, title }))}
              placeholder="Signal headline..."
            />
            <Field
              multiline
              value={signal.content}
              onChange={content => setSignal(current => ({ ...current, content }))}
              placeholder="Paste or write anything..."
              className="min-h-0 flex-1"
            />
          </div>
        )}

        {mode === 'pattern' && (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Field
              autoFocus
              value={pattern.title}
              onChange={title => setPattern(current => ({ ...current, title }))}
              placeholder="Pattern title..."
            />
            <Field
              multiline
              value={pattern.notes}
              onChange={notes => setPattern(current => ({ ...current, notes }))}
              placeholder="C4 - Eb4 - G4"
              className="min-h-0 flex-1 font-mono text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                value={pattern.bpm}
                onChange={bpm => setPattern(current => ({ ...current, bpm }))}
                placeholder="bpm"
                className="font-mono text-xs"
              />
              <Field
                value={pattern.scale}
                onChange={scale => setPattern(current => ({ ...current, scale }))}
                placeholder="scale"
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}

        {mode === 'chain' && (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Field
              autoFocus
              value={chain.title}
              onChange={title => setChain(current => ({ ...current, title }))}
              placeholder="Signal Chain"
            />
            <Field
              multiline
              value={chain.nodes}
              onChange={nodes => setChain(current => ({ ...current, nodes }))}
              placeholder={'Delay\nFilter\nReverb'}
              className="min-h-0 flex-1 font-mono text-xs"
            />
            <Field
              value={chain.description}
              onChange={description => setChain(current => ({ ...current, description }))}
              placeholder="What does it do?"
              className="text-xs"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!canAdd()}
          className="mt-auto rounded-lg bg-ss-ink px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-ss-dim disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-ss-ink"
        >
          Add Signal
        </button>
      </form>
    </div>
  )
}
