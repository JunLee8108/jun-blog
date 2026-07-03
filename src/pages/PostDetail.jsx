import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deletePost, fetchPostBySlug, incrementViewCount } from '../lib/queries'
import { useAuth } from '../context/AuthContext'
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
  const { session } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate('/', { replace: true })
    },
  })

  const handleDelete = () => {
    if (window.confirm(`"${post.title}" 글을 삭제할까요? 되돌릴 수 없어요.`)) {
      deleteMutation.mutate(post.id)
    }
  }

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
      <div className="mb-10 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-faded transition-colors duration-200 hover:text-clay"
        >
          ← 목록으로
        </Link>
        {session && (
          <div className="flex gap-2 text-xs">
            <Link
              to={`/admin/edit/${post.id}`}
              className="rounded-md border border-line px-2.5 py-1.5 text-body transition-colors duration-200 hover:border-faded"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-md border border-line px-2.5 py-1.5 text-clay-strong transition-colors duration-200 hover:border-clay/50 disabled:opacity-50"
            >
              {deleteMutation.isPending ? '삭제 중…' : '삭제'}
            </button>
          </div>
        )}
      </div>

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
