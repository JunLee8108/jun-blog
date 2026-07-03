import { Link } from 'react-router-dom'
import { formatDate, readingTime } from '../lib/utils'
import TagBadge from './TagBadge'

export default function PostCard({ post }) {
  return (
    <article className="group py-7 first:pt-0">
      <p className="mb-1.5 text-xs text-neutral-400 dark:text-neutral-500">
        <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
        <span className="mx-1.5">·</span>
        {readingTime(post.content)} 읽기
      </p>
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        <Link
          to={`/posts/${post.slug}`}
          className="transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
        >
          {post.title}
        </Link>
      </h2>
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {post.excerpt}
        </p>
      )}
      {post.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </article>
  )
}
