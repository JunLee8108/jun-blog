import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theme-fade')
    root.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    const timer = setTimeout(() => root.classList.remove('theme-fade'), 400)
    return () => clearTimeout(timer)
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="rounded-full p-2 text-faded transition-colors duration-200 hover:bg-clay-soft hover:text-clay"
    >
      {isDark ? (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  )
}

const navLinkClass = ({ isActive }) =>
  `relative px-3 py-1.5 text-sm transition-colors duration-200 ${
    isActive
      ? 'font-medium text-ink after:absolute after:bottom-0 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-clay'
      : 'text-faded hover:text-ink'
  }`

export default function Header() {
  const { session } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-[17px] font-semibold tracking-tight text-ink transition-colors duration-200 hover:text-clay"
        >
          jun<span className="text-clay">.</span>log
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            글
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            소개
          </NavLink>
          {session && (
            <NavLink to="/admin" className={navLinkClass}>
              관리
            </NavLink>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
