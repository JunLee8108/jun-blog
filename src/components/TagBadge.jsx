import { Link } from 'react-router-dom'

export default function TagBadge({ tag }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-400"
    >
      {tag.name}
    </Link>
  )
}
