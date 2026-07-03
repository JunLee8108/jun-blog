import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('페이지를 찾을 수 없습니다')

  return (
    <div className="py-24 text-center">
      <p className="text-5xl font-bold text-neutral-200 dark:text-neutral-800">404</p>
      <p className="mt-4 text-neutral-500 dark:text-neutral-400">
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
