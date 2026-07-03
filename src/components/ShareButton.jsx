import { useEffect, useRef, useState } from 'react'

function useShare() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const share = async ({ title, text }) => {
    const url = window.location.href

    // 모바일: 네이티브 공유 시트
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // 사용자가 공유 창을 닫은 경우 — 아무것도 하지 않음
      }
      return
    }

    // 데스크톱: 링크 복사 + 토스트
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('아래 링크를 복사하세요', url)
    }
  }

  return { share, copied }
}

function Toast({ show, children }) {
  if (!show) return null
  return (
    <div className="fade-up fixed bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-line bg-card px-4 py-2 text-sm text-ink shadow-[0_8px_24px_-8px_rgba(43,38,32,0.3)]">
      {children}
    </div>
  )
}

const shareIcon = (
  <svg
    className="size-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 10.7 6.8-3.4m-6.8 6.1 6.8 3.4" />
  </svg>
)

/* variant: 'icon'(상단 액션 줄) | 'minimal'(글 끝 텍스트 액션) */
export default function ShareButton({ title, text, variant = 'icon' }) {
  const { share, copied } = useShare()
  const handleClick = () => share({ title, text })

  if (variant === 'minimal') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 text-sm text-faded transition-colors duration-200 hover:text-clay"
        >
          {shareIcon}
          공유
        </button>
        <Toast show={copied}>링크를 복사했어요</Toast>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="공유하기"
        title="공유하기"
        className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-body transition-colors duration-200 hover:border-clay/50 hover:text-clay"
      >
        {shareIcon}
        공유
      </button>
      <Toast show={copied}>링크를 복사했어요</Toast>
    </>
  )
}
