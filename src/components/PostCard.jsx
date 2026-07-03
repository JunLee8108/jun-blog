import { Link } from 'react-router-dom'
import { formatDate, readingTime, relativeDate } from '../lib/utils'
import TagBadge from './TagBadge'

export default function PostCard({ post }) {
  const relative = relativeDate(post.published_at)

  return (
    <article className="group py-8 first:pt-0">
      <p className="mb-2 text-xs tracking-wide text-faded tabular-nums">
        <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
        {relative && <span className="text-clay/80"> · {relative}</span>}
        <span> · {readingTime(post.content)} 읽기</span>
      </p>
      <h2 className="text-lg font-semibold text-ink">
        <Link to={`/posts/${post.slug}`}>
          <span className="bg-gradient-to-r from-clay to-clay bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
            {post.title}
          </span>
        </Link>
      </h2>
      {post.excerpt && (
        <p className="mt-2.5 line-clamp-2 text-[15px] leading-relaxed text-body/85">
          {post.excerpt}
        </p>
      )}
      {post.tags?.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </article>
  )
}
