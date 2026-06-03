import { useState, useEffect } from 'react'
import { Smartphone, Sun, Moon, Github } from 'lucide-react'
import MockFrameDemo from './demos/MockFrameDemo'

function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-14 h-8 rounded-full transition-colors"
      style={{
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-strong)',
      }}
      aria-label="Toggle theme"
    >
      <span
        className="absolute top-1 w-6 h-6 rounded-full transition-all flex items-center justify-center"
        style={{
          background: 'var(--color-accent)',
          left: theme === 'dark' ? '26px' : '4px',
        }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5" style={{ color: 'var(--color-bg-primary)' }} />
        ) : (
          <Sun className="w-3.5 h-3.5" style={{ color: 'var(--color-bg-primary)' }} />
        )}
      </span>
    </button>
  )
}

function Navigation({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'var(--color-bg-card)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-accent)' }}
            >
              <Smartphone className="w-5 h-5" style={{ color: 'var(--color-bg-primary)' }} />
            </div>
            <div>
              <h1
                className="font-serif text-lg leading-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                MockFrame
              </h1>
              <p
                className="text-xs leading-tight"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                React Component Library
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <a
              href="https://github.com/mbdev3/react-mockframe"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <Navigation theme={theme} setTheme={setTheme} />

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto">
          <MockFrameDemo />
        </div>
      </main>

      <footer
        className="py-8 text-center text-sm"
        style={{
          color: 'var(--color-text-tertiary)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <p>
          Developed by{' '}
          <a
            href="https://mohammedbanani.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)' }}
            className="hover:underline"
          >
            Mohammed Banani
          </a>
          {' '}· MIT License · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
