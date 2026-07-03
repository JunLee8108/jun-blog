import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      {isDark ? (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  )
}

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm transition-colors ${
    isActive
      ? 'font-medium text-neutral-900 dark:text-neutral-100'
      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
  }`

export default function Header() {
  const { session } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:border-neutral-800/70 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          Jun<span className="text-indigo-600 dark:text-indigo-400">.</span>blog
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
