import { useRef, useState } from 'react'
import { toggleLike } from '../lib/queries'

function getLikedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem('liked_posts') || '[]'))
  } catch {
    return new Set()
  }
}

function saveLikedSet(set) {
  localStorage.setItem('liked_posts', JSON.stringify([...set]))
}

export default function LikeButton({ slug, initialCount = 0 }) {
  const [liked, setLiked] = useState(() => getLikedSet().has(slug))
  const [count, setCount] = useState(initialCount)
  const pendingRef = useRef(false)

  const handleToggle = async () => {
    if (pendingRef.current) return
    pendingRef.current = true

    const nextLiked = !liked
    // 낙관적 업데이트
    setLiked(nextLiked)
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)))
    const set = getLikedSet()
    if (nextLiked) set.add(slug)
    else set.delete(slug)
    saveLikedSet(set)

    try {
      const serverCount = await toggleLike(slug, nextLiked ? 1 : -1)
      if (typeof serverCount === 'number') setCount(serverCount)
    } catch {
      // 실패 시 롤백
      setLiked(!nextLiked)
      setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)))
      const rollback = getLikedSet()
      if (nextLiked) rollback.delete(slug)
      else rollback.add(slug)
      saveLikedSet(rollback)
    } finally {
      pendingRef.current = false
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={liked}
      aria-label={liked ? '마음 거두기' : '마음 남기기'}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors duration-200 ${
        liked ? 'text-clay' : 'text-faded hover:text-clay'
      }`}
    >
      <svg
        className={`size-3.5 transition-transform duration-300 ${liked ? 'rotate-90 scale-110' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M12 3.5v17M4.6 7.75l14.8 8.5M4.6 16.25l14.8-8.5" />
      </svg>
      마음
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  )
}
