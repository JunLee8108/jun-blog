import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/* SPA에서는 브라우저 기본 스크롤 복원이 콘텐츠 교체 타이밍과 어긋나므로 직접 관리한다 */
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const savedPositions = new Map()
let activeKey = 'default'

// 리스너를 하나만 두고 activeKey로 귀속시킨다.
// 페이지 전환 직후 높이 축소로 생기는 클램프 스크롤(0)이
// 이전 페이지의 저장값을 덮어쓰지 않게 하기 위함이다 — 그 이벤트가
// 발생하는 시점에는 activeKey가 이미 새 페이지로 바뀌어 있다.
window.addEventListener(
  'scroll',
  () => savedPositions.set(activeKey, window.scrollY),
  { passive: true },
)

export default function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()

  // 페인트 전(= 클램프 스크롤 이벤트가 디스패치되기 전)에 동기화
  useLayoutEffect(() => {
    activeKey = location.key
  }, [location.key])

  // 새 이동은 맨 위로, 뒤로/앞으로 가기는 기억해 둔 위치로
  const prevPathRef = useRef(location.pathname)
  useEffect(() => {
    const pathChanged = prevPathRef.current !== location.pathname
    prevPathRef.current = location.pathname

    if (navigationType !== 'POP') {
      // 검색어 입력처럼 같은 경로에서 쿼리만 바뀔 때는 스크롤을 건드리지 않는다
      if (pathChanged) window.scrollTo(0, 0)
      return
    }
    const target = savedPositions.get(location.key) ?? 0
    let attempts = 0
    // 데이터 로딩으로 페이지 높이가 아직 짧으면 잠시 재시도
    const restore = () => {
      window.scrollTo(0, target)
      if (window.scrollY < target - 2 && attempts++ < 30) {
        requestAnimationFrame(restore)
      }
    }
    restore()
  }, [location.key, location.pathname, navigationType])

  return null
}
