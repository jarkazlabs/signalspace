// Landing.jsx — staticfield homepage
// ONLY this file changes. Nothing else.

function ConnectedField() {
  return (
    <div className="relative mx-auto w-full max-w-[760px] select-none lg:h-[620px] h-[520px]">
      <div className="absolute inset-0 rounded-[28px] bg-[#fbf7ef]/60 opacity-80 blur-3xl" />
      <div className="absolute -bottom-10 right-3 h-40 w-64 rotate-[-8deg] overflow-hidden rounded-xl border border-white/70 bg-white/45 p-2 shadow-[0_18px_50px_rgba(88,68,45,0.18)]">
        <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=520&q=70" alt="" className="h-full w-full rounded-lg object-cover opacity-80" />
      </div>
      <svg className="living-connection-layer absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 760 620" style={{ zIndex: 5 }}>
        <defs>
          <marker id="hero-dot-end" markerWidth="4" markerHeight="4" refX="2" refY="2">
            <circle cx="2" cy="2" r="1.5" fill="#c0c0b8" />
          </marker>
        </defs>
        {[
          'M 236 118 C 300 112 316 150 372 174',
          'M 438 176 C 500 186 500 240 540 258',
          'M 390 246 C 330 260 308 292 258 304',
          'M 402 288 C 418 350 462 376 482 426',
          'M 248 414 C 318 424 370 420 438 430',
          'M 586 344 C 546 370 538 404 512 428',
          'M 332 166 C 280 194 258 224 202 252',
        ].map((path, index) => (
          <path key={path} d={path} className="living-line" markerEnd="url(#hero-dot-end)" style={{ animationDelay: `${0.2 + index * 0.08}s` }} />
        ))}
        {[236,118,372,174,438,176,540,258,258,304,402,288,482,426,248,414,438,430,586,344,512,428,202,252].reduce((dots, value, index, arr) => {
          if (index % 2 === 0) dots.push([value, arr[index + 1]])
          return dots
        }, []).map(([cx, cy], index) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" className="living-dot" style={{ animationDelay: `${0.45 + index * 0.05}s` }} />
        ))}
      </svg>

      <div className="living-card absolute left-[4%] top-[6%] w-[225px]" style={{ zIndex: 9, animationDelay: '0s', '--hero-rotate': '-2deg' }}>
        <div className="overflow-hidden rounded-xl border border-ss-border bg-white shadow-[0_16px_38px_rgba(58,45,32,0.16)]">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=520&q=75" alt="" className="h-28 w-full object-cover" />
          <div className="px-3.5 py-3">
            <p className="mb-1 font-sans text-[0.68rem] font-semibold uppercase text-ss-ghost/75">Image Signal</p>
            <p className="text-sm font-semibold text-ss-ink">Morning layers</p>
            <p className="mt-0.5 text-xs text-ss-dim">Alps, 06:47</p>
          </div>
        </div>
      </div>

      <div className="living-card absolute left-[40%] top-[10%] w-[165px]" style={{ zIndex: 11, animationDelay: '0.9s', '--hero-rotate': '-1deg' }}>
        <div className="rounded-xl border border-ss-border bg-[#fbf6eb] px-4 py-4 shadow-[0_12px_28px_rgba(58,45,32,0.13)]">
          <p className="mb-3 font-sans text-[0.68rem] font-semibold uppercase text-ss-ghost/75">Note Signal</p>
          <p className="font-mono text-sm leading-relaxed text-ss-ink">leave more<br/>silence</p>
        </div>
      </div>

      <div className="living-card absolute left-[67%] top-[8%] w-[190px]" style={{ zIndex: 8, animationDelay: '0.5s', '--hero-rotate': '3deg' }}>
        <div className="overflow-hidden rounded-xl border border-ss-border bg-white shadow-[0_16px_34px_rgba(58,45,32,0.15)]">
          <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=420&q=70" alt="" className="h-28 w-full object-cover" />
          <div className="px-3.5 py-3">
            <p className="text-sm font-semibold text-ss-ink">Studio corner</p>
            <p className="mt-0.5 font-sans text-[0.68rem] font-semibold uppercase text-ss-ghost/75">Image Signal</p>
          </div>
        </div>
      </div>

      <div className="living-card absolute left-[18%] top-[34%] w-[215px]" style={{ zIndex: 10, animationDelay: '1.6s', '--hero-rotate': '1deg' }}>
        <div className="rounded-xl border border-ss-border bg-[#faf3df] p-4 shadow-[0_14px_32px_rgba(58,45,32,0.13)]">
          <p className="mb-2 font-sans text-[0.68rem] font-semibold uppercase text-ss-ghost/75">Signal Chain</p>
          <p className="mb-3 text-sm font-semibold text-ss-ink">Delay / Filter / Reverb</p>
          <div className="flex flex-wrap gap-1.5">
            {['Delay','Filter','Reverb'].map(item => (
              <span key={item} className="rounded-md border border-ss-border bg-white/85 px-2 py-1 font-mono text-2xs text-ss-ink">{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="living-card absolute left-[48%] top-[31%] w-[220px]" style={{ zIndex: 12, animationDelay: '1.1s', '--hero-rotate': '-1deg' }}>
        <div className="rounded-xl border border-ss-border bg-white p-4 shadow-[0_16px_38px_rgba(58,45,32,0.16)]">
          <p className="mb-2 font-sans text-[0.68rem] font-semibold uppercase text-ss-ghost/75">Link Signal</p>
          <p className="mb-1.5 text-sm font-semibold text-ss-ink">ModWiggler Thread</p>
          <p className="mb-3 font-mono text-2xs leading-relaxed text-ss-dim">Designing with space - minimal patches</p>
          <span className="font-mono text-2xs text-ss-accent">modwiggler.com</span>
        </div>
      </div>

      <div className="living-card absolute left-[6%] top-[58%] w-[190px]" style={{ zIndex: 9, animationDelay: '2.4s', '--hero-rotate': '-1deg' }}>
        <div className="rounded-xl border border-ss-border bg-white p-4 shadow-[0_14px_30px_rgba(58,45,32,0.12)]">
          <p className="mb-2 font-sans text-[0.68rem] font-semibold uppercase text-ss-ghost/75">Pattern Signal</p>
          <p className="mb-2 text-sm font-semibold text-ss-ink">Ambient Idea 01</p>
          <div className="rounded-md border border-ss-border/60 bg-ss-surface/70 px-2 py-2 font-mono text-2xs text-ss-dim">C4 - Eb4 - G4</div>
          <p className="mt-2 font-mono text-2xs text-ss-ghost">72 bpm</p>
        </div>
      </div>

      <div className="living-card absolute left-[43%] top-[64%] w-[215px]" style={{ zIndex: 10, animationDelay: '2s', '--hero-rotate': '2deg' }}>
        <div className="overflow-hidden rounded-xl border border-ss-border bg-white shadow-[0_16px_38px_rgba(58,45,32,0.16)]">
          <div className="relative aspect-video bg-ss-ink">
            <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=420&q=70" alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md">
                <span className="ml-0.5 text-sm text-ss-ink">▶</span>
              </div>
            </div>
          </div>
          <div className="px-3.5 py-3">
            <p className="mb-1 font-sans text-[0.68rem] font-semibold uppercase text-ss-ghost/75">YouTube Signal</p>
            <p className="text-sm font-semibold text-ss-ink">Making an ambient patch</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FEATURE STRIP ────────────────────────────────────────

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
    title: 'Capture signals',
    desc: 'Hold thoughts,\nlinks and images.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="4" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="16" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="16" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.4"/><line x1="6.5" y1="9" x2="13.5" y2="5.5" stroke="currentColor" strokeWidth="1.4"/><line x1="6.5" y1="11" x2="13.5" y2="14.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
    title: 'Connect ideas',
    desc: 'Patch thoughts together\ninside the same field.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10 L5 6 L8 12 L11 4 L14 14 L17 8 L19 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    title: 'Shape your field',
    desc: 'Let a creative space\ngrow around the idea.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/><line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    title: 'Find the thread',
    desc: 'Return to what mattered\nwhen the idea returns.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4"/><line x1="10" y1="2" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="10" y1="14" x2="10" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    title: 'Remember gently',
    desc: 'Unfinished thoughts\nstay alive over time.',
  },
]

// ─── APP PREVIEW — Living Mini Field ─────────────────────

function AppPreview() {
  return (
    <div className="relative min-h-[360px] w-full overflow-hidden rounded-[28px] border border-ss-border/70 bg-[#fbf7ef] shadow-[0_24px_70px_rgba(58,45,32,0.13)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.2)_35%,rgba(255,255,255,0)_62%),radial-gradient(circle_at_74%_70%,rgba(224,210,183,0.5)_0%,rgba(224,210,183,0)_46%)]" />
      <div className="absolute inset-0 opacity-35"
        style={{ backgroundImage: 'radial-gradient(circle, #d8d0c4 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 640 360">
        <defs>
          <marker id="preview-dot-end" markerWidth="4" markerHeight="4" refX="2" refY="2">
            <circle cx="2" cy="2" r="1.5" fill="#c0c0b8" />
          </marker>
        </defs>
        <path d="M 206 126 C 264 126 286 170 332 188" stroke="#c8c8c0" strokeWidth="1.4" fill="none" strokeDasharray="4 5" markerEnd="url(#preview-dot-end)" />
        <path d="M 394 108 C 438 116 454 146 480 178" stroke="#c8c8c0" strokeWidth="1.4" fill="none" strokeDasharray="4 5" markerEnd="url(#preview-dot-end)" />
        <path d="M 260 238 C 330 226 364 248 424 238" stroke="#c8c8c0" strokeWidth="1.4" fill="none" strokeDasharray="4 5" markerEnd="url(#preview-dot-end)" />
      </svg>

      <div className="absolute left-[7%] top-[15%] w-[190px] rotate-[-2deg] rounded-xl border border-ss-border bg-white shadow-[0_16px_36px_rgba(58,45,32,0.13)] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=420&q=70" alt="" className="h-24 w-full object-cover" />
        <div className="px-3.5 py-3">
          <p className="mb-1 font-sans text-[0.62rem] font-semibold uppercase text-ss-ghost/75">Image Signal</p>
          <p className="text-sm font-semibold text-ss-ink">Studio textures</p>
        </div>
      </div>

      <div className="absolute left-[43%] top-[9%] w-[165px] rotate-[1deg] rounded-xl border border-ss-border bg-white/92 px-4 py-4 shadow-[0_12px_30px_rgba(58,45,32,0.1)]">
        <p className="mb-3 font-sans text-[0.62rem] font-semibold uppercase text-ss-ghost/75">Note Signal</p>
        <p className="font-mono text-sm leading-relaxed text-ss-ink">texture first,<br/>structure later</p>
      </div>

      <div className="absolute right-[8%] top-[36%] w-[175px] rotate-[2deg] rounded-xl border border-ss-border bg-white px-4 py-4 shadow-[0_15px_34px_rgba(58,45,32,0.14)]">
        <p className="mb-2 font-sans text-[0.62rem] font-semibold uppercase text-ss-ghost/75">Link Signal</p>
        <p className="mb-2 text-sm font-semibold text-ss-ink">A Guide to Texture</p>
        <span className="font-mono text-2xs text-ss-accent">archive.org</span>
      </div>

      <div className="absolute left-[23%] bottom-[13%] w-[205px] rotate-[1deg] rounded-xl border border-ss-border bg-[#faf3df] p-4 shadow-[0_14px_32px_rgba(58,45,32,0.12)]">
        <p className="mb-2 font-sans text-[0.62rem] font-semibold uppercase text-ss-ghost/75">Signal Chain</p>
        <p className="mb-3 text-sm font-semibold text-ss-ink">Delay / Filter / Space</p>
        <div className="flex flex-wrap gap-1.5">
          {['Delay','Filter','Space'].map(item => (
            <span key={item} className="rounded-md border border-ss-border bg-white/85 px-2 py-1 font-mono text-2xs text-ss-ink">{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN LANDING ─────────────────────────────────────────

export default function Landing({ setPage, openField }) {
  return (
    <div className="min-h-screen bg-ss-bg">

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden pt-14 bg-[#fbf7ef]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_42%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.55)_28%,rgba(251,247,239,0)_58%),radial-gradient(circle_at_72%_34%,rgba(229,212,186,0.34)_0%,rgba(229,212,186,0)_42%),linear-gradient(90deg,rgba(251,247,239,0.98)_0%,rgba(251,247,239,0.88)_44%,rgba(245,238,226,0.82)_100%)]" />
        <div className="absolute inset-0 opacity-35"
          style={{ backgroundImage: 'radial-gradient(circle, #d8d0c4 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute left-0 bottom-0 h-52 w-80 bg-[#e5d4ba]/40 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 lg:pt-24 pb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 xl:gap-12 min-h-[700px] lg:-translate-y-6">

            {/* LEFT */}
            <div className="lg:w-[43%] flex-shrink-0 z-10 relative pt-4 lg:pt-0 lg:-translate-y-3">

              <h1 className="font-sans leading-[0.95] mb-7 animate-slide-up"
                style={{ fontWeight: 800, fontSize: 'clamp(3.6rem, 6.7vw, 6.4rem)',
                  animationFillMode: 'forwards', animationDelay: '0.04s' }}>
                <span className="whitespace-nowrap">Patch</span><br/>
                <span className="whitespace-nowrap" style={{
                  background: 'linear-gradient(135deg, #c45a64 0%, #6b8fc4 55%, #2e8a8a 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>signals</span><br/>
                <span className="whitespace-nowrap">into ideas.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#6f5842] leading-relaxed mb-8 max-w-md animate-slide-up"
                style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
                A creative memory for people working with sound.<br/>
                Capture what feels interesting. Return when it starts to matter.<br/>
                <span className="block mt-3">For modular musicians, ambient artists and <span className="whitespace-nowrap">curious collectors.</span></span>
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 animate-slide-up"
                style={{ animationFillMode: 'forwards', animationDelay: '0.16s' }}>
                <button onClick={() => setPage('fields')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-ss-ink text-white text-sm font-semibold rounded-lg hover:bg-ss-dim transition-colors">
                  Start your field →
                </button>
                <button onClick={() => openField('b01')}
                  className="text-sm text-ss-dim hover:text-ss-ink transition-colors underline underline-offset-4 decoration-ss-border">
                  Open demo field
                </button>
              </div>
            </div>

            {/* RIGHT — Field visualization, desktop only */}
            <div className="mt-8 lg:mt-0 lg:block flex-1 relative">
              <ConnectedField />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURE STRIP ══════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-9 sm:gap-12">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex flex-col gap-3.5">
                <div className="w-11 h-11 rounded-lg border border-ss-border flex items-center justify-center text-ss-dim [&_svg]:w-6 [&_svg]:h-6">
                  {f.icon}
                </div>
                <h3 className="font-sans font-semibold text-base text-ss-ink">{f.title}</h3>
                <p className="text-sm text-ss-dim leading-relaxed whitespace-pre-line">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════ DESIGNED FOR CREATIVES ══════════ */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

            {/* Left */}
            <div className="lg:w-[38%] flex-shrink-0">
              <h2 className="font-sans font-bold text-4xl sm:text-5xl text-ss-ink leading-tight mb-4">
                Everything you need.<br/>Nothing you don't.
              </h2>
              <p className="text-sm text-ss-dim leading-relaxed mb-8">
                Staticfield is a quiet studio space<br/>
                for thoughts, references<br/>
                and unfinished sonic ideas.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setPage('fields')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-ss-ink text-white text-sm font-semibold rounded-lg hover:bg-ss-dim transition-colors">
                  Start your field →
                </button>
                <button onClick={() => setPage('manifesto')}
                  className="text-sm text-ss-dim hover:text-ss-ink transition-colors underline underline-offset-4 decoration-ss-border">
                  Learn more
                </button>
              </div>
            </div>

            {/* Right: app preview */}
            <div className="flex-1">
              <AppPreview />
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
