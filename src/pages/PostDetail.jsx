import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPostBySlug, incrementViewCount } from '../lib/queries'
import {
  extractHeadings,
  formatDate,
  prepareHtml,
  readingTime,
  relativeDate,
} from '../lib/utils'
import Markdown from '../components/Markdown'
import TagBadge from '../components/TagBadge'
import Spinner, { EmptyState, ErrorMessage } from '../components/Spinner'
import Comments from '../components/Comments'
import { Ornament } from '../components/Doodles'
import usePageTitle from '../hooks/usePageTitle'

/* 노트 여백에 적어둔 메모 같은 목차 */
function TableOfContents({ headings }) {
  if (headings.length < 2) return null

  // 부드러운 스크롤은 목차 클릭에만 적용 (전역 smooth는 페이지 이동을 출렁이게 함)
  const handleClick = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav aria-label="목차" className="mb-12 border-l-2 border-clay/35 pl-5">
      <p className="text-xs font-medium tracking-[0.14em] text-faded">목차</p>
      <ul className="mt-2.5 space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.depth - 1) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className="text-body/80 transition-colors duration-200 hover:text-clay"
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

  // 리치 에디터 글은 HTML, 예전 글은 마크다운
  const prepared = useMemo(() => {
    if (!post) return { html: null, headings: [] }
    if (post.format === 'html') return prepareHtml(post.content)
    return { html: null, headings: extractHeadings(post.content) }
  }, [post])

  if (isLoading) return <Spinner />
  if (isError) return <ErrorMessage />
  if (!post) return <EmptyState message="존재하지 않는 글이에요." />

  const relative = relativeDate(post.published_at)

  return (
    <article>
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-1 text-sm text-faded transition-colors duration-200 hover:text-clay"
      >
        ← 목록으로
      </Link>

      <header className="mb-10">
        {/* 일기니까 날짜부터 */}
        <p className="text-[13px] font-medium tracking-wide text-clay tabular-nums">
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          {relative && <span className="opacity-80"> · {relative}</span>}
        </p>
        <h1 className="mt-3 text-[27px] leading-snug font-semibold text-ink sm:text-3xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-faded tabular-nums">
          {readingTime(post.content)} 읽기
          {post.view_count > 0 && (
            <>
              <span className="mx-1.5">·</span>
              {post.view_count.toLocaleString()}번 읽힘
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
        {/* 폴라로이드 커버 */}
        {post.cover_image_url && (
          <figure className="mt-10">
            <div className="rounded-md bg-card p-2 shadow-[0_10px_28px_-14px_rgba(43,38,32,0.3)] ring-1 ring-line">
              <img
                src={post.cover_image_url}
                alt=""
                className="max-h-80 w-full rounded-[3px] object-cover"
              />
            </div>
          </figure>
        )}
      </header>

      <TableOfContents headings={prepared.headings} />
      {prepared.html !== null ? (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: prepared.html }}
        />
      ) : (
        <Markdown content={post.content} />
      )}

      {/* 글의 끝맺음 */}
      <Ornament className="my-14 text-clay/60" />
      <Comments postId={post.id} />
    </article>
  )
}
