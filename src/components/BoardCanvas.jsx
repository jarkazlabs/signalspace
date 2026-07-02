// BoardCanvas.jsx — Komplett überarbeitet
// - Echte Card-Höhe via ResizeObserver für korrekte Anchor-Punkte
// - Width + Height Resize
// - Chain-Card Fix
// - UX-Verbesserungen

import { useRef, useState, useEffect, useCallback } from 'react'
import CanvasSection     from './CanvasSection.jsx'
import DeleteCardModal   from './DeleteCardModal.jsx'
import PedalIcon         from './PedalIcon.jsx'
import SignalMenu        from './SignalMenu.jsx'
import { PatternCardContent } from './PatternCard.jsx'
import { CARD_TINTS } from '../data/tints.js'
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube.js'
import {
  CARD_HEIGHT_DEFAULT,
  CARD_WIDTH_DEFAULT,
  buildConnectionPath,
  findBestAnchors,
  getCanvasSize,
  getCardAnchors,
} from '../lib/canvasGeometry.js'

function getTintStyle(card) {
  const t = CARD_TINTS.find(t => t.id === card.tint)
  if (!t || t.id === 'none') return { backgroundColor: '#ffffff', borderColor: '#e8e8e4' }
  return { backgroundColor: t.bg, borderColor: t.border }
}

function getImageFileFromTransfer(transfer) {
  if (!transfer) return null
  const files = Array.from(transfer.files || [])
  const directFile = files.find(file => file.type?.startsWith('image/'))
  if (directFile) return directFile

  const items = Array.from(transfer.items || [])
  const imageItem = items.find(item => item.type?.startsWith('image/'))
  return imageItem?.getAsFile() || null
}

function resizeImageFile(file, maxSize = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load image.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.86))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// ─── Type Badge ───────────────────────────────────────────

function TypeBadge({ type }) {
  const labels = { note:'Note Signal', link:'Link Signal', image:'Image Signal', instagram:'Instagram Signal', chain:'Signal Chain', pattern:'Pattern Signal', youtube:'YouTube Signal' }
  return <span className="font-sans text-[0.68rem] font-semibold text-ss-ghost/75 uppercase">{labels[type]||type}</span>
}

function TapeIcon({ direction }) {
  const isBack = direction === 'back'
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden="true" className="flex-shrink-0">
      {isBack ? (
        <>
          <path d="M3 1.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M11 2L5 6L11 10V2Z" fill="currentColor"/>
          <path d="M19 2L13 6L19 10V2Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M19 1.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M11 2L17 6L11 10V2Z" fill="currentColor"/>
          <path d="M3 2L9 6L3 10V2Z" fill="currentColor"/>
        </>
      )}
    </svg>
  )
}

function HistoryButton({ type, disabled, onClick }) {
  const isUndo = type === 'undo'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={isUndo ? 'Undo (⌘/Ctrl + Z)' : 'Redo (⌘/Ctrl + Shift + Z)'}
      aria-label={isUndo ? 'Undo' : 'Redo'}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-ss-border rounded-lg text-xs font-semibold text-ss-dim hover:text-ss-ink hover:border-ss-muted hover:bg-ss-surface disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-ss-dim disabled:hover:border-ss-border transition-colors"
    >
      {isUndo && <TapeIcon direction="back" />}
      <span>{isUndo ? 'Undo' : 'Redo'}</span>
      {!isUndo && <TapeIcon direction="forward" />}
    </button>
  )
}

function SignalTintControl({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const activeTint = CARD_TINTS.find(tint => tint.id === (value || 'none')) || CARD_TINTS[0]

  return (
    <div className="relative flex items-center" data-action="tint">
      <button
        data-action="tint"
        type="button"
        onClick={e => {
          e.stopPropagation()
          setOpen(isOpen => !isOpen)
        }}
        className="group flex items-center justify-center px-2 py-1.5 rounded-lg text-ss-dim hover:text-ss-ink hover:bg-ss-surface transition-colors"
        title="Signal tone"
        aria-label="Signal tone"
      >
        <span
          className="h-4 w-4 rounded-full border border-ss-border transition-all duration-150 group-hover:scale-110 group-hover:border-ss-muted group-hover:shadow-sm"
          style={{
            backgroundColor: activeTint.bg,
            borderStyle: activeTint.id === 'none' ? 'dashed' : 'solid',
          }}
        />
      </button>
      {open && (
        <div
          className="absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 rounded-xl border border-ss-border bg-white px-2 py-2 shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            {CARD_TINTS.map(tint => (
              <button
                key={tint.id}
                data-action="tint"
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onChange(tint.id)
                  setOpen(false)
                }}
                className={`h-5 w-5 rounded-full border-2 transition-all ${
                  (value || 'none') === tint.id
                    ? 'border-ss-ink scale-110'
                    : 'border-ss-border hover:border-ss-muted hover:scale-105'
                }`}
                style={{
                  backgroundColor: tint.bg,
                  borderStyle: tint.id === 'none' ? 'dashed' : 'solid',
                }}
                title={tint.label}
                aria-label={tint.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InlineInput({ value = '', placeholder, onChange, className = '', multiline = false, rows = 2, autoFocus = false }) {
  const sharedProps = {
    'data-action': 'inline-edit',
    value,
    placeholder,
    autoFocus,
    onChange: e => onChange(e.target.value),
    onMouseDown: e => e.stopPropagation(),
    onClick: e => e.stopPropagation(),
    onDoubleClick: e => e.stopPropagation(),
    className: `w-full border-0 bg-transparent p-0 text-ss-ink placeholder-ss-ghost/55 focus:outline-none focus:ring-0 ${className}`,
  }

  if (multiline) {
    return (
      <textarea
        {...sharedProps}
        rows={rows}
        className={`${sharedProps.className} resize-none leading-relaxed`}
      />
    )
  }

  return <input {...sharedProps} />
}

// ─── Note Card mit Expand-Toggle ─────────────────────────
function NoteCardContent({ title, description, imageUrl, focused }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedHeight, setExpandedHeight] = useState(120)
  const COLLAPSED_H = 120 // px — ca. 6 Zeilen

  // Brauchen wir den Toggle überhaupt?
  const textRef = useRef(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    if (textRef.current) {
      setOverflows(textRef.current.scrollHeight > COLLAPSED_H + 4)
      setExpandedHeight(textRef.current.scrollHeight)
    }
  }, [description])

  return (
    <div className="flex flex-col gap-1.5">
      {imageUrl && (
        <div className="mb-1 aspect-video w-full overflow-hidden rounded-md border border-ss-border/70 bg-ss-surface">
          <img src={imageUrl} alt={title || 'Note Signal image'} className="h-full w-full object-cover" />
        </div>
      )}
      <p className="font-sans font-semibold text-sm text-ss-ink leading-snug">{title || 'Note Signal'}</p>
      {description && (
        <div className="relative">
          <div
            ref={textRef}
            className="text-xs text-ss-dim leading-relaxed transition-all duration-300 overflow-hidden break-words [overflow-wrap:anywhere]"
            style={{ maxHeight: (focused || expanded) ? `${expandedHeight}px` : `${COLLAPSED_H}px` }}
          >
            {description}
          </div>
          {/* Toggle-Button — nur wenn Text überläuft */}
          {overflows && !focused && (
            <button
              data-action="expand"
              onMouseDown={e => { e.stopPropagation(); setExpanded(v => !v) }}
              className="mt-1.5 flex items-center gap-1 font-mono text-2xs text-ss-ghost/60 hover:text-ss-accent transition-colors"
            >
              <span>{expanded ? '↑' : '↓'}</span>
              <span>{expanded ? 'less' : 'more'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Card Content ─────────────────────────────────────────

function buildChain(items) {
  const filled = items.map(item => item.trim()).filter(Boolean)
  return filled.reduce((acc, item, i) => {
    acc.push(item)
    if (i < filled.length - 1) acc.push('→')
    return acc
  }, [])
}

function EditableCardContent({ card, focused, onUpdate }) {
  const update = updates => onUpdate(card.id, updates)
  const chainItems = card.chain ? card.chain.filter(item => item !== '→') : ['']
  const editableChainItems = chainItems[chainItems.length - 1] === '' ? chainItems : [...chainItems, '']

  switch (card.type) {
    case 'note':
      return (
        <div className="flex flex-col gap-2">
          {card.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-md border border-ss-border/70 bg-ss-surface">
              <img src={card.imageUrl} alt={card.title || 'Note Signal image'} className="h-full w-full object-cover" />
            </div>
          )}
          <InlineInput
            value={card.title}
            placeholder="Untitled note"
            onChange={title => update({ title })}
            autoFocus
            className="font-sans text-sm font-semibold leading-snug"
          />
          <InlineInput
            value={card.description}
            placeholder="Write inside the signal..."
            onChange={description => update({ description })}
            multiline
            rows={8}
            className="min-h-[120px] text-xs text-ss-dim"
          />
        </div>
      )

    case 'image':
      return (
        <div className="flex flex-col gap-2">
          {card.imageUrl && <div className="w-full aspect-video overflow-hidden rounded-md"><img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover"/></div>}
          <InlineInput
            value={card.imageUrl}
            placeholder="Paste image URL..."
            onChange={imageUrl => update({ imageUrl })}
            autoFocus
            className="font-mono text-2xs text-ss-accent"
          />
          <InlineInput
            value={card.title}
            placeholder="Image title..."
            onChange={title => update({ title })}
            className="font-sans text-sm font-semibold leading-snug"
          />
          <InlineInput
            value={card.description}
            placeholder="What does this image signal?"
            onChange={description => update({ description })}
            multiline
            rows={2}
            className="text-xs text-ss-dim"
          />
        </div>
      )

    case 'link':
    case 'youtube':
      return (
        <div className="flex flex-col gap-2">
          {card.type === 'youtube' && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-mono text-2xs text-ss-ghost">YouTube</span>
            </div>
          )}
          <InlineInput
            value={card.url}
            placeholder={card.type === 'youtube' ? 'Paste YouTube URL...' : 'Paste link...'}
            onChange={url => update({ url })}
            autoFocus
            className="font-mono text-2xs text-ss-accent"
          />
          {card.type === 'youtube' && card.url && <YouTubePreview card={card} focused={focused} />}
          <InlineInput
            value={card.title}
            placeholder={card.type === 'youtube' ? 'Video title...' : 'Link title...'}
            onChange={title => update({ title })}
            className="font-sans text-sm font-semibold leading-snug"
          />
          <InlineInput
            value={card.description}
            placeholder="Add a note..."
            onChange={description => update({ description })}
            multiline
            rows={2}
            className="text-xs text-ss-dim"
          />
        </div>
      )

    case 'instagram':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📸</span>
            <span className="font-mono text-2xs text-ss-ghost">Instagram</span>
          </div>
          <InlineInput
            value={card.url}
            placeholder="Paste Instagram URL..."
            onChange={url => update({ url })}
            autoFocus
            className="font-mono text-2xs text-ss-accent"
          />
          <InlineInput
            value={card.title}
            placeholder="Signal title..."
            onChange={title => update({ title })}
            className="font-sans text-sm font-semibold leading-snug"
          />
        </div>
      )

    case 'chain':
      return (
        <div className="flex flex-col gap-2.5">
          <InlineInput
            value={card.title}
            placeholder="Signal Chain"
            onChange={title => update({ title })}
            autoFocus
            className="font-sans text-sm font-semibold leading-snug"
          />
          <div className="flex flex-col gap-1.5 rounded-lg border border-ss-border/60 bg-white/35 p-2">
            {editableChainItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-ss-ghost/50 text-xs">→</span>}
                <PedalIcon size={15} color="#9e9890" />
                <InlineInput
                  value={item}
                  placeholder={index === 0 ? 'First node...' : 'Next node...'}
                  onChange={value => {
                    const next = [...editableChainItems]
                    next[index] = value
                    update({ chain: buildChain(next) })
                  }}
                  className="font-mono text-2xs"
                />
              </div>
            ))}
            <button
              data-action="inline-edit"
              type="button"
              onMouseDown={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation()
                update({ chain: buildChain([...chainItems, 'Node']) })
              }}
              className="mt-1 text-left font-mono text-2xs text-ss-ghost hover:text-ss-accent transition-colors"
            >
              + add node
            </button>
          </div>
          <InlineInput
            value={card.description}
            placeholder="How does this chain move?"
            onChange={description => update({ description })}
            multiline
            rows={2}
            className="text-xs text-ss-dim"
          />
        </div>
      )

    case 'pattern':
      return (
        <div className="flex flex-col gap-2">
          <InlineInput
            value={card.title}
            placeholder="Pattern title..."
            onChange={title => update({ title })}
            autoFocus
            className="font-sans text-sm font-semibold leading-snug"
          />
          <InlineInput
            value={card.notes}
            placeholder="C4 Eb4 G4 — G4 C5"
            onChange={notes => update({ notes })}
            className="font-mono text-2xs text-ss-dim rounded-lg bg-ss-surface/60 px-2.5 py-2"
          />
          <div className="flex gap-2">
            <InlineInput
              value={card.bpm}
              placeholder="bpm"
              onChange={bpm => update({ bpm })}
              className="font-mono text-2xs text-ss-ghost"
            />
            <InlineInput
              value={card.scale}
              placeholder="scale"
              onChange={scale => update({ scale })}
              className="font-mono text-2xs text-ss-ghost"
            />
          </div>
          <InlineInput
            value={card.description}
            placeholder="Phrase note..."
            onChange={description => update({ description })}
            multiline
            rows={2}
            className="text-xs text-ss-dim"
          />
        </div>
      )

    default:
      return (
        <InlineInput
          value={card.title}
          placeholder="Signal title..."
          onChange={title => update({ title })}
          autoFocus
          className="font-sans text-sm font-semibold leading-snug"
        />
      )
  }
}

function YouTubePreview({ card, focused }) {
  const embedUrl = focused ? getYouTubeEmbedUrl(card.url, { autoplay: true }) : null
  const thumbnailUrl = getYouTubeThumbnailUrl(card.url)

  if (focused && embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-ss-border bg-black shadow-inner">
        <iframe
          data-action="youtube-preview"
          title={card.title || 'YouTube Signal preview'}
          src={embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  if (thumbnailUrl) {
    return (
      <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-ss-border/80 bg-black">
        <img
          src={thumbnailUrl}
          alt={card.title || 'YouTube video thumbnail'}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border border-white/55 bg-black/35 flex items-center justify-center text-white shadow-sm backdrop-blur-[1px]">
            <span className="ml-0.5 text-xs">▶</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full rounded-lg border border-ss-border/70 bg-ss-surface/80 flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border border-red-400/40 bg-white/70 flex items-center justify-center text-red-500 shadow-sm">
        <span className="ml-0.5 text-xs">▶</span>
      </div>
    </div>
  )
}

function CardContent({ card, focused }) {
  switch (card.type) {

    case 'image':
      return <div className="flex flex-col gap-2">
        {card.imageUrl && <div className="w-full aspect-video overflow-hidden rounded-md"><img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover"/></div>}
        <p className="font-sans font-semibold text-sm text-ss-ink leading-snug">{card.title || 'Image Signal'}</p>
        {card.description && <p className="text-xs text-ss-dim leading-relaxed">{card.description}</p>}
      </div>

    case 'note':
      return <NoteCardContent title={card.title} description={card.description} imageUrl={card.imageUrl} focused={focused} />

    case 'link':
    case 'youtube':
      return <div className="flex flex-col gap-2">
        {card.type === 'youtube' && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="font-mono text-2xs text-ss-ghost">YouTube</span>
          </div>
        )}
        {card.type === 'youtube' && card.url && <YouTubePreview card={card} focused={focused} />}
        {card.imageUrl && <div className="w-full aspect-video overflow-hidden rounded-md"><img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover opacity-90"/></div>}
        <p className="font-sans font-semibold text-sm text-ss-ink leading-snug">{card.title || (card.type === 'youtube' ? 'YouTube Signal' : 'Link Signal')}</p>
        {card.description && <p className="text-xs text-ss-dim leading-relaxed">{card.description}</p>}
        {card.url && <a href={card.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
          className="inline-flex items-center gap-1 font-mono text-2xs text-ss-accent hover:text-ss-ink transition-colors truncate">
          <span>↗</span><span className="truncate">{card.url.replace(/^https?:\/\/(www\.)?/,'')}</span>
        </a>}
      </div>

    case 'instagram':
      return <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📸</span>
          <span className="font-mono text-2xs text-ss-ghost">Instagram</span>
        </div>
        <p className="font-sans font-semibold text-sm text-ss-ink leading-snug">{card.title || 'Instagram Signal'}</p>
        {card.url && <a href={card.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
          className="font-mono text-2xs text-ss-accent hover:underline truncate">
          ↗ {card.url.replace('https://www.instagram.com/','instagram.com/')}
        </a>}
      </div>

    case 'chain': {
      // Chain-Items bereinigen: alle nicht-leeren, nicht-Pfeil Items
      const items = (card.chain || []).filter(i => i && i.trim() && i !== '→')
      return <div className="flex flex-col gap-2">
        {card.title && card.title !== 'Signal Chain' &&
          <p className="font-sans font-semibold text-sm text-ss-ink leading-snug">{card.title}</p>}
        {items.length > 0
          ? <div className="flex items-center flex-wrap gap-2 p-2.5 rounded-lg border border-ss-border/60" style={{backgroundColor:'rgba(0,0,0,0.02)'}}>
              {items.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="flex flex-col items-center gap-1">
                    <PedalIcon size={18} color="#9e9890" />
                    <span className="font-mono text-2xs text-ss-ink bg-white border border-ss-border px-1.5 py-0.5 rounded-md shadow-sm leading-tight text-center" style={{maxWidth:72, wordBreak:'break-word'}}>{item}</span>
                  </span>
                  {i < items.length-1 && <span className="text-ss-ghost/40 text-xs self-start mt-2">→</span>}
                </span>
              ))}
            </div>
          : <p className="text-xs text-ss-ghost/50 italic">No nodes patched yet</p>
        }
        {card.description && <p className="text-xs text-ss-dim leading-relaxed">{card.description}</p>}
      </div>
    }

    case 'pattern':
      return <PatternCardContent card={card} />

    default:
      return <p className="text-sm text-ss-ink">{card.title || 'Signal'}</p>
  }
}

// ─── Canvas Card ──────────────────────────────────────────

function CanvasCard({ card, connectingFrom, focused, editing, onFocus, onEditStart, onDragStart, onTouchStart, onConnectDotDown, onDelete, onDuplicate, onResize, onHeightChange, onInteractionStart, onInteractionEnd, onUpdate, onImageDrop }) {
  const [hovered,     setHovered]     = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const [imageOver,   setImageOver]   = useState(false)
  const cardRef      = useRef(null)
  const contentRef   = useRef(null)
  const mouseDownPos = useRef(null)
  const tintStyle  = getTintStyle(card)
  const cardW      = card.width || CARD_WIDTH_DEFAULT
  const locked     = card.locked || false

  // Echte Höhe messen und nach oben melden
  useEffect(() => {
    if (!contentRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        onHeightChange(card.id, entry.contentRect.height)
      }
    })
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [card.id, onHeightChange])

  function detectSide(e) {
    if (!cardRef.current) return 'right'
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left, y = e.clientY - rect.top
    const dL = x, dR = rect.width - x, dT = y, dB = rect.height - y
    const min = Math.min(dL, dR, dT, dB)
    if (min === dT) return 'top'
    if (min === dB) return 'bottom'
    if (min === dL) return 'left'
    return 'right'
  }

  function handleMouseMove(e) { if (hovered) setHoveredSide(detectSide(e)) }

  // Resize: Breite UND Höhe
  function handleResizeMouseDown(e) {
    e.stopPropagation(); e.preventDefault()
    onInteractionStart()
    const startX = e.clientX, startY = e.clientY
    const startW = cardW
    const startH = contentRef.current?.offsetHeight || CARD_HEIGHT_DEFAULT
    function onMove(ev) {
      const newW = Math.max(180, startW + ev.clientX - startX)
      const newH = Math.max(80,  startH + ev.clientY - startY)
      onResize(card.id, newW, newH)
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      onInteractionEnd()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleResizeTouchStart(e) {
    e.stopPropagation()
    if (e.touches.length !== 1) return
    onInteractionStart()
    const t0 = e.touches[0]
    const startX = t0.clientX, startY = t0.clientY
    const startW = cardW, startH = contentRef.current?.offsetHeight || CARD_HEIGHT_DEFAULT
    function onMove(ev) {
      if (ev.touches.length !== 1) return; ev.preventDefault()
      onResize(card.id,
        Math.max(180, startW + ev.touches[0].clientX - startX),
        Math.max(80,  startH + ev.touches[0].clientY - startY)
      )
    }
    function onEnd() {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      onInteractionEnd()
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  const dotsConfig = {
    top:    { style: { top: -7,    left: '50%', transform: 'translateX(-50%)' } },
    bottom: { style: { bottom: -7, left: '50%', transform: 'translateX(-50%)' } },
    left:   { style: { left: -7,   top: '50%',  transform: 'translateY(-50%)' } },
    right:  { style: { right: -7,  top: '50%',  transform: 'translateY(-50%)' } },
  }

  // Dots alleen bij hover en niet selected (zodat toolbar en dots nooit tegelijk)
  const visibleDots = connectingFrom
    ? (connectingFrom === card.id ? Object.keys(dotsConfig) : [])
    : ((hovered || focused) && hoveredSide ? [hoveredSide] : [])

  // Minimale Höhe falls card.height gesetzt
  const minHeight = card.height ? { minHeight: card.height } : {}

  function handleDragOver(e) {
    if (!getImageFileFromTransfer(e.dataTransfer)) return
    e.preventDefault()
    e.stopPropagation()
    setImageOver(true)
  }

  async function handleDrop(e) {
    const file = getImageFileFromTransfer(e.dataTransfer)
    if (!file) return
    e.preventDefault()
    e.stopPropagation()
    setImageOver(false)
    await onImageDrop(card.id, file)
  }

  return (
    <div
      className="absolute select-none"
      style={{
        left: card.position.x,
        top: card.position.y,
        width: cardW,
        zIndex: (focused || hovered) ? 20 : 2,
        transform: focused ? 'scale(1.03)' : 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 180ms ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
      onMouseMove={handleMouseMove}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setImageOver(false)
      }}
      onDrop={handleDrop}
      onMouseDown={e => {
        if (e.target.closest('[data-action]')) return
        mouseDownPos.current = { x: e.clientX, y: e.clientY }
        if (connectingFrom || locked) return
        onDragStart(e, card.id)
      }}
      onTouchStart={e => {
        if (e.target.closest('[data-action]')) return
        if (connectingFrom) return
        if (!locked) onTouchStart(e, card.id)
      }}
      onClick={e => {
        if (e.target.closest('[data-action]')) return
        if (connectingFrom) return
        // Check dat het geen drag was
        const down = mouseDownPos.current
        if (down && (Math.abs(e.clientX - down.x) > 5 || Math.abs(e.clientY - down.y) > 5)) return
        e.stopPropagation()
        onFocus(card.id)
      }}
      onDoubleClick={e => {
        if (e.target.closest('[data-action]')) return
        e.stopPropagation()
        onFocus(card.id)
        onEditStart(card.id)
      }}

    >
      {/* Card Shell */}
      <div
        ref={cardRef}
        className={`
          border rounded-xl flex flex-col relative overflow-hidden
          transition-all duration-200
          ${locked
            ? 'cursor-default shadow-sm'
            : connectingFrom && connectingFrom !== card.id
              ? 'ring-2 ring-ss-accent/40 cursor-crosshair shadow-lg'
              : focused
                ? 'ring-1 ring-ss-ink/15 cursor-grab'
                : hovered ? 'shadow-lg cursor-grab' : 'shadow-sm cursor-grab'
          }
        `}
        style={{
          ...tintStyle,
          ...minHeight,
          boxShadow: focused ? '0 8px 24px rgba(0,0,0,0.12)' : undefined,
          filter: focused ? 'contrast(1.02)' : undefined,
          transition: 'box-shadow 180ms ease, filter 180ms ease',
        }}
      >
        {imageOver && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-xl border border-ss-accent/50 bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ss-accent shadow-sm">
              Drop image
            </span>
          </div>
        )}
        {/* Type Badge oben */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <TypeBadge type={card.type} />
          {locked && <span className="text-2xs text-red-400 mr-1">🔒</span>}
        </div>

        {/* Content */}
        <div ref={contentRef} className="px-3 pb-3 flex-1">
          {editing
            ? <EditableCardContent card={card} focused={focused} onUpdate={onUpdate} />
            : <CardContent card={card} focused={focused} />}
        </div>

        {/* Resize Handle */}
        {(hovered || focused) && !locked && (
          <div data-action="resize"
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1.5 opacity-60 hover:opacity-100 transition-opacity"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
            title="Resize signal"
          >
            <svg width="9" height="9" viewBox="0 0 9 9">
              <path d="M9 0 L9 9 L0 9 Z" fill="#c8c8c2"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Focus Controls ── */}
      {focused && !connectingFrom && (
        <div data-action="toolbar"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white border border-ss-border rounded-xl shadow-lg px-1.5 py-1"
          style={{ bottom: -42, zIndex: 30, whiteSpace: 'nowrap' }}
        >
          {/* Duplicate */}
          <button data-action="duplicate"
            onClick={e => { e.stopPropagation(); onDuplicate(card) }}
            className="flex items-center px-2 py-1.5 rounded-lg text-ss-dim hover:text-ss-ink hover:bg-ss-surface transition-colors"
            title="Duplicate signal">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M3 9H2a1 1 0 01-1-1V2a1 1 0 011-1h6a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="w-px h-5 bg-ss-border mx-0.5"/>
          <SignalTintControl
            value={card.tint || 'none'}
            onChange={tint => onUpdate(card.id, { tint })}
          />
          <div className="w-px h-5 bg-ss-border mx-0.5"/>
          <button data-action="delete"
            onClick={e => { e.stopPropagation(); onDelete(card.id) }}
            className="flex items-center px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="Delete signal">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 3.2h9M5 3.2V2h3v1.2M4.2 5l.4 5.2M8.8 5l-.4 5.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Verbindungspunkte */}
      {visibleDots.map(side => (
        <div key={side} data-action="connect"
          className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center cursor-crosshair z-20 transition-all duration-100 hover:scale-125"
          style={{
            ...dotsConfig[side].style,
            backgroundColor: connectingFrom === card.id ? '#7a8c3c' : '#a8a8a0',
            boxShadow: '0 0 0 2.5px white, 0 2px 4px rgba(0,0,0,0.1)',
          }}
          onMouseDown={e=>{e.stopPropagation(); e.preventDefault(); onConnectDotDown(card.id, side)}}
          title="Patch connection"
        >
          <span style={{fontSize:7, color:'white', fontWeight:800, lineHeight:1}}>+</span>
        </div>
      ))}

      {/* Ziel-Highlight */}
      {connectingFrom && connectingFrom !== card.id && hovered && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-ss-accent pointer-events-none" style={{zIndex:11}} />
      )}
    </div>
  )
}

// ─── Hauptkomponente ──────────────────────────────────────

export default function BoardCanvas({ boardId, cards, connections, sections, addCard, updateCard, moveCard, deleteCard, addConnection, deleteConnection, addSection, updateSection, moveSection, deleteSection, lockSection, canUndo, canRedo, undo, redo, beginHistoryGroup, endHistoryGroup }) {
  const canvasRef        = useRef(null)
  const [dragging,       setDragging]       = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [connectLine,    setConnectLine]    = useState(null)
  const [signalMenuAnchor, setSignalMenuAnchor] = useState(null)
  const [capturePadPosition, setCapturePadPosition] = useState(null)
  const [activeSection,  setActiveSection]  = useState(null)
  const [focusedSignalId, setFocusedSignalId] = useState(null)
  const [editingSignalId, setEditingSignalId] = useState(null)
  const [signalToDelete, setSignalToDelete] = useState(null)
  // Echte gemessene Höhen der Cards
  const [cardHeights,    setCardHeights]    = useState({})

  const handleHeightChange = useCallback((cardId, h) => {
    setCardHeights(prev => prev[cardId] === h ? prev : { ...prev, [cardId]: h })
  }, [])

  const canvasSize = getCanvasSize(cards, cardHeights)

  function canvasPos(clientX, clientY) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: clientX - rect.left + canvasRef.current.scrollLeft,
      y: clientY - rect.top  + canvasRef.current.scrollTop,
    }
  }

  function anchorPoint(cardId, side) {
    const c = cards.find(c => c.id === cardId)
    if (!c) return { x:0, y:0 }
    const anchors = getCardAnchors(c, cardHeights[cardId])
    return anchors[side] || anchors.right
  }

  function handleMouseMove(e) {
    const pos = canvasPos(e.clientX, e.clientY)
    if (dragging) {
      if (dragging.sectionId) {
        moveSection(dragging.sectionId, Math.max(0, pos.x - dragging.offX), Math.max(0, pos.y - dragging.offY))
      } else {
        moveCard(dragging.cardId, Math.max(0, pos.x - dragging.offX), Math.max(0, pos.y - dragging.offY))
      }
    }
    if (connectingFrom) {
      const from = anchorPoint(connectingFrom.cardId, connectingFrom.side)
      setConnectLine({ x1:from.x, y1:from.y, x2:pos.x, y2:pos.y })
    }
  }

  function handleMouseUp(e) {
    if (dragging) {
      setDragging(null)
      endHistoryGroup()
      return
    }
    if (connectingFrom) {
      const pos = canvasPos(e.clientX, e.clientY)
      const target = cards.find(c => {
        const h = cardHeights[c.id] || CARD_HEIGHT_DEFAULT
        return c.id !== connectingFrom.cardId &&
          pos.x >= c.position.x && pos.x <= c.position.x + (c.width||CARD_WIDTH_DEFAULT) &&
          pos.y >= c.position.y && pos.y <= c.position.y + h
      })
      if (target) addConnection(connectingFrom.cardId, target.id)
      setConnectingFrom(null); setConnectLine(null)
    }
  }

  function handleDragStart(e, cardId) {
    const pos = canvasPos(e.clientX, e.clientY)
    const card = cards.find(c => c.id === cardId)
    if (!card || card.locked) return
    beginHistoryGroup()
    setDragging({ cardId, offX: pos.x - card.position.x, offY: pos.y - card.position.y })
  }

  function handleSectionDragStart(e, sectionId) {
    e.preventDefault()
    const sec = sections.find(s => s.id === sectionId)
    if (!sec || sec.locked) return
    beginHistoryGroup()
    const pos = canvasPos(e.clientX, e.clientY)
    setDragging({ sectionId, offX: pos.x - sec.position.x, offY: pos.y - sec.position.y })
  }

  function handleSectionTouchStart(e, sectionId) {
    if (e.touches.length !== 1) return
    const sec = sections.find(s => s.id === sectionId)
    if (!sec || sec.locked) return
    beginHistoryGroup()
    const pos = canvasPos(e.touches[0].clientX, e.touches[0].clientY)
    setDragging({ sectionId, offX: pos.x - sec.position.x, offY: pos.y - sec.position.y })
  }

  function handleTouchStart(e, cardId) {
    if (e.touches.length !== 1) return
    const card = cards.find(c => c.id === cardId)
    if (!card || card.locked) return
    beginHistoryGroup()
    const pos = canvasPos(e.touches[0].clientX, e.touches[0].clientY)
    setDragging({ cardId, offX: pos.x - card.position.x, offY: pos.y - card.position.y })
  }

  function handleTouchMove(e) {
    if (!dragging || e.touches.length !== 1) return
    e.preventDefault()
    const pos = canvasPos(e.touches[0].clientX, e.touches[0].clientY)
    if (dragging.sectionId) moveSection(dragging.sectionId, Math.max(0,pos.x-dragging.offX), Math.max(0,pos.y-dragging.offY))
    else moveCard(dragging.cardId, Math.max(0,pos.x-dragging.offX), Math.max(0,pos.y-dragging.offY))
  }

  function handleConnectDotDown(cardId, side) {
    setConnectingFrom({ cardId, side })
    const from = anchorPoint(cardId, side)
    setConnectLine({ x1:from.x, y1:from.y, x2:from.x, y2:from.y })
  }

  function handleResizeCard(cardId, newW, newH) {
    updateCard(cardId, { width: newW, height: newH })
  }

  function handleDuplicate(card) {
    const { id: _id, boardId: _b, position, ...rest } = card
    addCard(boardId, card.type, {
      ...rest,
      position: { x: (position?.x || 100) + 24, y: (position?.y || 100) + 24 },
    })
  }

  function handleAddSection() {
    const el = canvasRef.current
    const cx = el.scrollLeft + el.clientWidth  / 2 - 170
    const cy = el.scrollTop  + el.clientHeight / 2 - 110
    const sectionId = addSection(boardId, { x: cx, y: cy })
    setActiveSection(sectionId)
    setFocusedSignalId(null)
    setEditingSignalId(null)
    setSignalMenuAnchor(null)
  }

  function focusSection(sectionId) {
    setActiveSection(sectionId)
    setFocusedSignalId(null)
    setEditingSignalId(null)
    setSignalMenuAnchor(null)
  }

  function openCapturePad() {
    const el = canvasRef.current
    if (!el) return
    const position = {
      x: Math.max(0, el.scrollLeft + el.clientWidth / 2 - 150),
      y: Math.max(0, el.scrollTop + el.clientHeight / 2 - 150),
    }
    setCapturePadPosition(position)
    setSignalMenuAnchor(anchor => anchor === 'canvas' ? null : 'canvas')
    setActiveSection(null)
    setFocusedSignalId(null)
    setEditingSignalId(null)
  }

  function patchSignal(type, data) {
    const position = signalMenuAnchor === 'canvas' && capturePadPosition
      ? capturePadPosition
      : undefined
    const id = addCard(boardId, type, {
      ...data,
      ...(position ? { position } : {}),
    })
    setFocusedSignalId(id)
    setEditingSignalId(id)
    setSignalMenuAnchor(null)
  }

  const attachImageToSignal = useCallback(async (cardId, file) => {
    const imageUrl = await resizeImageFile(file)
    const card = cards.find(card => card.id === cardId)
    updateCard(cardId, {
      imageUrl,
      ...(card?.type === 'image' && !card.title ? { title: file.name?.replace(/\.[^.]+$/, '') || 'Image Signal' } : {}),
    })
    setFocusedSignalId(cardId)
  }, [cards, updateCard])

  const createImageSignalAt = useCallback(async (file, position) => {
    const imageUrl = await resizeImageFile(file)
    const id = addCard(boardId, 'image', {
      title: file.name?.replace(/\.[^.]+$/, '') || 'Image Signal',
      description: '',
      imageUrl,
      position,
    })
    setFocusedSignalId(id)
    setEditingSignalId(id)
    setSignalMenuAnchor(null)
  }, [addCard, boardId])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setConnectingFrom(null)
        setConnectLine(null)
        setFocusedSignalId(null)
        setEditingSignalId(null)
        setSignalMenuAnchor(null)
        setSignalToDelete(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    async function onPaste(e) {
      const file = getImageFileFromTransfer(e.clipboardData)
      if (!file) return

      e.preventDefault()
      const focusedCard = cards.find(card => card.id === focusedSignalId)
      if (focusedCard) {
        await attachImageToSignal(focusedCard.id, file)
        return
      }

      const el = canvasRef.current
      if (!el) return
      await createImageSignalAt(file, {
        x: el.scrollLeft + el.clientWidth / 2 - CARD_WIDTH_DEFAULT / 2,
        y: el.scrollTop + el.clientHeight / 2 - CARD_HEIGHT_DEFAULT / 2,
      })
    }

    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [attachImageToSignal, cards, createImageSignalAt, focusedSignalId])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="bg-white border-b border-ss-border px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <div className="relative">
          <button onClick={openCapturePad}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ss-ink text-white text-xs font-semibold rounded-lg hover:bg-ss-dim transition-colors">
            Add Signal
          </button>
        </div>
        <button onClick={handleAddSection}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-ss-border text-ss-dim text-xs font-semibold rounded-lg hover:border-ss-muted hover:text-ss-ink transition-colors">
          Add Field Area
        </button>
        <div className="hidden sm:flex items-center gap-1.5 ml-1 pl-2 border-l border-ss-border">
          <HistoryButton type="undo" disabled={!canUndo} onClick={undo} />
          <HistoryButton type="redo" disabled={!canRedo} onClick={redo} />
        </div>
        {connectingFrom && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ss-accentBg border border-ss-accent/30 rounded-lg ml-1">
            <div className="w-2 h-2 rounded-full bg-ss-accent animate-pulse" />
            <span className="text-xs text-ss-accent font-medium">Release on target signal — ESC cancels</span>
          </div>
        )}
        <span className="ml-auto hidden sm:block font-sans text-xs font-medium text-ss-ghost">{cards.length} signals · click line to disconnect</span>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto"
        style={{
          background: 'radial-gradient(circle at 1px 1px, #e8e8e4 1px, transparent 0) 0 0 / 24px 24px',
          backgroundColor: '#fafaf8',
          cursor: connectingFrom ? 'crosshair' : 'default',
          touchAction: dragging ? 'none' : 'pan-x pan-y',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (dragging) endHistoryGroup()
          setDragging(null)
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          if (dragging) endHistoryGroup()
          setDragging(null)
        }}
        onClick={() => {
          setActiveSection(null)
          setFocusedSignalId(null)
          setEditingSignalId(null)
          setSignalMenuAnchor(null)
        }}
        onDragOver={e => {
          if (!getImageFileFromTransfer(e.dataTransfer)) return
          e.preventDefault()
        }}
        onDrop={async e => {
          const file = getImageFileFromTransfer(e.dataTransfer)
          if (!file) return
          e.preventDefault()
          const pos = canvasPos(e.clientX, e.clientY)
          await createImageSignalAt(file, { x: Math.max(0, pos.x - CARD_WIDTH_DEFAULT / 2), y: Math.max(0, pos.y - 80) })
        }}
      >
        <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
          {signalMenuAnchor === 'canvas' && capturePadPosition && (
            <SignalMenu
              onSelect={patchSignal}
              style={{
                left: capturePadPosition.x,
                top: capturePadPosition.y,
              }}
            />
          )}

          {/* Sections */}
          {sections.map(section => (
            <CanvasSection key={section.id} section={section}
              isActive={activeSection === section.id}
              onActivate={() => focusSection(section.id)}
              onDragStart={handleSectionDragStart}
              onTouchStart={handleSectionTouchStart}
              onUpdate={updateSection}
              onDelete={deleteSection}
              onLockToggle={lockSection}
              onInteractionStart={beginHistoryGroup}
              onInteractionEnd={endHistoryGroup}
            />
          ))}

          {/* SVG Linien */}
          <svg className="absolute inset-0 pointer-events-none" width={canvasSize.width} height={canvasSize.height} style={{zIndex:1}}>
            <defs>
              <marker id="dot-end" markerWidth="4" markerHeight="4" refX="2" refY="2">
                <circle cx="2" cy="2" r="1.5" fill="#c0c0b8"/>
              </marker>
            </defs>
            {connections.map(cn => {
              const fc = cards.find(c => c.id === cn.from)
              const tc = cards.find(c => c.id === cn.to)
              if (!fc || !tc) return null
              const pts = findBestAnchors(fc, tc, cardHeights)
              if (!pts) return null
              const { from: f, to: t, fromSide, toSide } = pts
              const path = buildConnectionPath(f, t, fromSide, toSide)
              return (
                <g key={cn.id}>
                  <path d={path} stroke="transparent" strokeWidth="12" fill="none"
                    style={{pointerEvents:'stroke', cursor:'pointer'}} onClick={()=>deleteConnection(cn.id)} />
                  <path d={path} stroke="#c8c8c0" strokeWidth="1.5" fill="none" strokeDasharray="4 5"
                    markerEnd="url(#dot-end)" style={{pointerEvents:'none'}} />
                </g>
              )
            })}
            {connectLine && (
              <line x1={connectLine.x1} y1={connectLine.y1} x2={connectLine.x2} y2={connectLine.y2}
                stroke="#7a8c3c" strokeWidth="1.5" strokeDasharray="5 4" />
            )}
          </svg>

          {/* Signals */}
          {cards.map(card => (
            <CanvasCard key={card.id} card={card}
              connectingFrom={connectingFrom?.cardId}
              focused={focusedSignalId === card.id}
              editing={editingSignalId === card.id}
              onFocus={setFocusedSignalId}
              onEditStart={setEditingSignalId}
              onDragStart={handleDragStart}
              onTouchStart={handleTouchStart}
              onConnectDotDown={handleConnectDotDown}
              onDelete={id => setSignalToDelete(cards.find(card => card.id === id) || null)}
              onDuplicate={handleDuplicate}
              onResize={handleResizeCard}
              onHeightChange={handleHeightChange}
              onInteractionStart={beginHistoryGroup}
              onInteractionEnd={endHistoryGroup}
              onUpdate={updateCard}
              onImageDrop={attachImageToSignal}
            />
          ))}

          {cards.length === 0 && sections.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <p className="text-ss-ghost/60 text-sm">Empty field.</p>
            </div>
          )}
        </div>
      </div>

      {signalToDelete && (
        <DeleteCardModal
          card={signalToDelete}
          onClose={() => setSignalToDelete(null)}
          onConfirm={() => {
            deleteCard(signalToDelete.id)
            if (focusedSignalId === signalToDelete.id) setFocusedSignalId(null)
            if (editingSignalId === signalToDelete.id) setEditingSignalId(null)
            setSignalToDelete(null)
          }}
        />
      )}

    </div>
  )
}
