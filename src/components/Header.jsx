import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
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

function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/* 검색어는 URL(/?q=…)로 관리해서 어느 페이지에서든 검색하면 홈 결과로 이동 */
function useSearchQuery() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlQuery = location.pathname === '/' ? searchParams.get('q') || '' : ''
  const [value, setValue] = useState(urlQuery)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)

  // 뒤로가기 등으로 URL이 바뀌면 입력값도 따라간다 (렌더 중 파생 상태 보정 패턴)
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery)
    setValue(urlQuery)
  }

  const onChange = (next) => {
    setValue(next)
    const target = next ? `/?q=${encodeURIComponent(next)}` : '/'
    // 홈에서 타이핑할 때는 히스토리를 쌓지 않는다
    navigate(target, { replace: location.pathname === '/' })
  }

  return [value, onChange]
}

const navLinkClass = ({ isActive }) =>
  `relative px-3 py-1.5 text-sm transition-colors duration-200 ${
    isActive
      ? 'font-medium text-ink after:absolute after:bottom-0 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-clay'
      : 'text-faded hover:text-ink'
  }`

export default function Header() {
  const { session } = useAuth()
  const [value, onChange] = useSearchQuery()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          to="/"
          className="shrink-0 text-[17px] font-semibold tracking-tight text-ink transition-colors duration-200 hover:text-clay"
        >
          jun<span className="text-clay">.</span>log
        </Link>

        <nav className="flex min-w-0 items-center gap-1">
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

          {/* 데스크톱: 인라인 검색 */}
          <div className="relative ml-2 hidden sm:block">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faded" />
            <input
              type="search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="검색"
              className="w-32 rounded-full border border-line bg-card py-1.5 pr-3 pl-8 text-sm outline-none transition-all duration-300 placeholder:text-faded/70 focus:w-48 focus:border-clay/60"
            />
          </div>

          {/* 모바일: 아이콘 토글 */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="검색 열기"
            aria-expanded={mobileSearchOpen}
            className={`rounded-full p-2 transition-colors duration-200 hover:bg-clay-soft hover:text-clay sm:hidden ${
              mobileSearchOpen ? 'text-clay' : 'text-faded'
            }`}
          >
            <SearchIcon className="size-4.5" />
          </button>

          <ThemeToggle />
        </nav>
      </div>

      {/* 모바일 검색 줄 */}
      {mobileSearchOpen && (
        <div className="mx-auto max-w-3xl px-4 pb-3 sm:hidden">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faded" />
            <input
              type="search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="지난 이야기 찾아보기"
              autoFocus
              className="w-full rounded-xl border border-line bg-card py-2 pr-3 pl-9 text-sm outline-none transition-colors duration-200 placeholder:text-faded/70 focus:border-clay/60"
            />
          </div>
        </div>
      )}
    </header>
  )
}
