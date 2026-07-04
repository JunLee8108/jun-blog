import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/* 스크롤에 따라 차오르는 상단 읽기 진행 바 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf
    const update = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // main의 fade-up transform이 fixed의 기준을 바꾸므로 body에 포털로 렌더링
  return createPortal(
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-20 h-[3px] rounded-r-full bg-clay/80"
      style={{ width: `${progress * 100}%` }}
    />,
    document.body,
  )
}
