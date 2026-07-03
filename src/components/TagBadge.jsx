import { Link } from 'react-router-dom'

/* 마스킹테이프 딱지 느낌의 태그 */
export default function TagBadge({ tag }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      className="inline-block rounded-[4px] bg-clay-soft px-2 py-0.5 text-xs font-medium text-clay transition-all duration-200 hover:-rotate-2 hover:text-clay-strong"
    >
      {tag.name}
    </Link>
  )
}
