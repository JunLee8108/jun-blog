import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deletePost,
  fetchAdjacentPosts,
  fetchPostBySlug,
  fetchRelatedPosts,
  incrementViewCount,
} from '../lib/queries'
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
import ShareButton from '../components/ShareButton'
import LikeButton from '../components/LikeButton'
import ReadingProgress from '../components/ReadingProgress'
import { Ornament, Squiggle } from '../components/Doodles'
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

/* 이전/다음 글 + 같은 태그의 다른 글 */
function PostFooterNav({ post }) {
  const { data: adjacent } = useQuery({
    queryKey: ['adjacent', post.slug],
    queryFn: () => fetchAdjacentPosts(post.published_at),
    enabled: Boolean(post.published_at),
  })

  const tagSlugs = post.tags?.map((t) => t.slug) || []
  const { data: related } = useQuery({
    queryKey: ['related', post.id],
    queryFn: () => fetchRelatedPosts(post.id, tagSlugs),
    enabled: tagSlugs.length > 0,
  })

  // 이전/다음에 이미 나온 글은 관련 글에서 제외
  const adjacentSlugs = [adjacent?.prev?.slug, adjacent?.next?.slug]
  const relatedPosts =
    related?.filter((r) => !adjacentSlugs.includes(r.slug)) || []

  const hasAdjacent = Boolean(adjacent?.prev || adjacent?.next)
  if (!hasAdjacent && relatedPosts.length === 0) return null

  // 부록 카드: 서피스 배경으로 본문보다 낮은 계층임을 표현
  const cardClass =
    'block rounded-xl border border-line bg-card px-4 py-3 transition-colors duration-200 hover:border-clay/50'

  return (
    <section className="mt-12 border-t border-dashed border-line pt-10">
      <p className="text-[13px] font-medium tracking-[0.14em] text-clay">
        이어서 읽기
      </p>

      {hasAdjacent && (
        <nav aria-label="이전/다음 글" className="mt-4 grid gap-3 sm:grid-cols-2">
          {adjacent.prev ? (
            <Link to={`/posts/${adjacent.prev.slug}`} className={cardClass}>
              <p className="text-xs text-faded">← 이전 이야기</p>
              <p className="mt-1 truncate text-sm font-medium text-ink">
                {adjacent.prev.title}
              </p>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {adjacent.next && (
            <Link
              to={`/posts/${adjacent.next.slug}`}
              className={`${cardClass} text-right`}
            >
              <p className="text-xs text-faded">다음 이야기 →</p>
              <p className="mt-1 truncate text-sm font-medium text-ink">
                {adjacent.next.title}
              </p>
            </Link>
          )}
        </nav>
      )}

      {relatedPosts.length > 0 && (
        <div className={hasAdjacent ? 'mt-6' : 'mt-4'}>
          <h2 className="text-sm font-medium text-faded">이런 이야기도 있어요</h2>
          <ul className="mt-3 space-y-2">
            {relatedPosts.map((relatedPost) => (
              <li key={relatedPost.id} className="flex items-baseline gap-3">
                <Link
                  to={`/posts/${relatedPost.slug}`}
                  className="truncate text-[15px] text-ink transition-colors duration-200 hover:text-clay"
                >
                  {relatedPost.title}
                </Link>
                <time className="shrink-0 text-xs text-faded tabular-nums">
                  {formatDate(relatedPost.published_at)}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
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
      <ReadingProgress />
      <div className="mb-10 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-faded transition-colors duration-200 hover:text-clay"
        >
          ← 목록으로
        </Link>
        <div className="flex gap-2 text-xs">
          <ShareButton title={post.title} text={post.excerpt} />
          {session && (
            <>
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
            </>
          )}
        </div>
      </div>

      <header className="mb-12">
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
        {/* 표지의 끝: 제목 영역을 닫는 구불선 */}
        <Squiggle className="mt-7 h-2.5 w-24 text-clay/60" />
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

      {/* 글의 끝맺음: ✱ 아래 조용한 액션 한 줄 */}
      <Ornament className="mt-14 mb-4 text-clay/60" />
      <div className="flex items-center justify-center gap-3">
        <LikeButton slug={post.slug} initialCount={post.like_count || 0} />
        <span aria-hidden="true" className="text-faded/50">
          ·
        </span>
        <ShareButton title={post.title} text={post.excerpt} variant="minimal" />
      </div>

      <PostFooterNav post={post} />
      <div className="mt-12 border-t border-dashed border-line pt-10">
        <Comments postId={post.id} />
      </div>
    </article>
  )
}
