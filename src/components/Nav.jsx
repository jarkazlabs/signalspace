// Nav.jsx — staticfield Nav: Logo · Fields · Manifesto · Your fields
import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'

export default function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function navigate(id) { setPage(id); setMenuOpen(false) }

  const links = [
    { id: 'fields',    label: 'Fields'    },
    { id: 'manifesto', label: 'Manifesto' },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300
        ${scrolled ? 'nav-scrolled' : 'bg-ss-bg/95 border-ss-border'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => navigate('landing')}
            className="hover:opacity-70 transition-opacity duration-200 flex-shrink-0">
            <Logo size="sm" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map(link => (
              <button key={link.id} onClick={() => navigate(link.id)}
                className={`text-sm transition-colors duration-200
                  ${page === link.id ? 'text-ss-ink font-medium' : 'text-ss-dim hover:text-ss-ink'}`}>
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <button onClick={() => navigate('fields')}
              className="flex items-center gap-1.5 px-4 py-2 bg-ss-ink text-white text-sm font-semibold rounded-lg hover:bg-ss-dim transition-colors">
              Your fields
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => navigate('fields')}
              className="px-3 py-1.5 bg-ss-ink text-white text-xs font-semibold rounded-lg">
              Your fields
            </button>
            <button onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-ss-surface transition-colors">
              <span className={`block w-5 h-0.5 bg-ss-ink transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
              <span className={`block w-5 h-0.5 bg-ss-ink transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}/>
              <span className={`block w-5 h-0.5 bg-ss-ink transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-ss-border shadow-lg"
            onClick={e => e.stopPropagation()}>
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map(link => (
                <button key={link.id} onClick={() => navigate(link.id)}
                  className={`text-left px-3 py-3 rounded-lg text-sm transition-colors
                    ${page === link.id ? 'bg-ss-surface text-ss-ink font-medium' : 'text-ss-dim hover:bg-ss-surface hover:text-ss-ink'}`}>
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
