import { Link } from 'react-router-dom'
import { Ornament } from '../components/Doodles'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('빈 페이지')

  return (
    <div className="py-24 text-center">
      <Ornament className="text-clay/40" />
      <p className="mt-6 text-lg font-medium text-ink">
        여긴 아직 빈 페이지네요.
      </p>
      <p className="mt-2 text-sm text-faded">
        찾으시는 글이 옮겨졌거나, 아직 쓰이지 않았을 수도 있어요.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block text-sm text-clay transition-colors duration-200 hover:text-clay-strong"
      >
        첫 장으로 돌아가기 →
      </Link>
    </div>
  )
}
