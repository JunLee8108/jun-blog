import { Link } from 'react-router-dom'
import { autoExcerpt, formatDate, readingTime } from '../lib/utils'
import TagBadge from './TagBadge'

export default function PostCard({ post }) {
  const summary = post.excerpt || autoExcerpt(post.content, post.format)
  const commentCount = post.comments?.[0]?.count || 0

  return (
    <article className="group flex items-start gap-5 py-8 first:pt-0 sm:gap-7">
      <div className="min-w-0 flex-1">
        <p className="mb-2 flex items-center gap-1.5 text-xs tracking-wide text-faded tabular-nums">
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} 읽기</span>
          {commentCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span
                className="inline-flex items-center gap-1"
                aria-label={`댓글 ${commentCount}개`}
              >
                <svg
                  className="size-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 1 1 16.1-3.8Z" />
                </svg>
                {commentCount}
              </span>
            </>
          )}
        </p>
        <h2 className="text-lg font-semibold text-ink">
          <Link to={`/posts/${post.slug}`}>
            <span className="bg-gradient-to-r from-clay to-clay bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
              {post.title}
            </span>
          </Link>
        </h2>
        {summary && (
          <p className="mt-2.5 line-clamp-2 text-[15px] leading-relaxed text-body/85">
            {summary}
          </p>
        )}
        {post.tags?.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {/* 커버가 있으면 폴라로이드 느낌의 썸네일 */}
      {post.cover_image_url && (
        <Link
          to={`/posts/${post.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="mt-1 shrink-0"
        >
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            className="h-20 w-28 rounded-lg object-cover ring-1 ring-line sm:h-24 sm:w-36"
          />
        </Link>
      )}
    </article>
  )
}
