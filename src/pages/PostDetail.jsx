import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPostBySlug, incrementViewCount } from '../lib/queries'
import { extractHeadings, formatDate, readingTime } from '../lib/utils'
import Markdown from '../components/Markdown'
import TagBadge from '../components/TagBadge'
import Spinner, { EmptyState, ErrorMessage } from '../components/Spinner'
import Comments from '../components/Comments'
import usePageTitle from '../hooks/usePageTitle'

function TableOfContents({ headings }) {
  if (headings.length < 2) return null

  return (
    <nav
      aria-label="목차"
      className="mb-10 rounded-xl border border-neutral-200/70 bg-neutral-50 px-5 py-4 dark:border-neutral-800/70 dark:bg-neutral-900/50"
    >
      <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-400 uppercase dark:text-neutral-500">
        목차
      </p>
      <ul className="space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.depth - 1) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className="text-neutral-500 transition-colors hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function PostDetail() {
  const { slug } = useParams()

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug),
  })

  usePageTitle(post?.title)

  useEffect(() => {
    if (post?.id) incrementViewCount(slug)
  }, [post?.id, slug])

  const headings = useMemo(
    () => (post ? extractHeadings(post.content) : []),
    [post],
  )

  if (isLoading) return <Spinner />
  if (isError) return <ErrorMessage />
  if (!post) return <EmptyState message="존재하지 않는 글입니다." />

  return (
    <article>
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        ← 목록으로
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl leading-snug font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500">
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          <span className="mx-1.5">·</span>
          {readingTime(post.content)} 읽기
          {post.view_count > 0 && (
            <>
              <span className="mx-1.5">·</span>
              조회 {post.view_count.toLocaleString()}
            </>
          )}
        </p>
        {post.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            className="mt-8 w-full rounded-2xl object-cover"
          />
        )}
      </header>

      <TableOfContents headings={headings} />
      <Markdown content={post.content} />
      <Comments postId={post.id} />
    </article>
  )
}
