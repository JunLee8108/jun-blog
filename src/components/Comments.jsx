import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addComment, deleteComment, fetchComments } from '../lib/queries'
import { formatDate } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 10
const GROUP_SIZE = 5

const fieldClass =
  'rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-clay/60'

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const groupStart = Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1
  const groupEnd = Math.min(groupStart + GROUP_SIZE - 1, totalPages)
  const pages = []
  for (let p = groupStart; p <= groupEnd; p++) pages.push(p)

  const buttonClass = (active) =>
    `min-w-8 rounded-lg px-2 py-1.5 text-xs tabular-nums transition-colors duration-200 ${
      active
        ? 'bg-clay font-medium text-[#fdf9f3]'
        : 'text-faded hover:bg-clay-soft hover:text-clay'
    }`

  return (
    <nav aria-label="댓글 페이지" className="mt-8 flex justify-center gap-1">
      {groupStart > 1 && (
        <button
          type="button"
          onClick={() => onChange(groupStart - 1)}
          aria-label="이전 페이지 그룹"
          className={buttonClass(false)}
        >
          ‹
        </button>
      )}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={buttonClass(p === page)}
        >
          {p}
        </button>
      ))}
      {groupEnd < totalPages && (
        <button
          type="button"
          onClick={() => onChange(groupEnd + 1)}
          aria-label="다음 페이지 그룹"
          className={buttonClass(false)}
        >
          ›
        </button>
      )}
    </nav>
  )
}

export default function Comments({ postId }) {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [authorName, setAuthorName] = useState(
    () => localStorage.getItem('comment_author') || '',
  )
  const [content, setContent] = useState('')
  const [page, setPage] = useState(1)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
  })

  const totalPages = Math.max(1, Math.ceil(comments.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageComments = comments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['comments', postId] })

  const addMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      setContent('')
      // 방금 남긴 댓글이 보이도록 마지막 페이지로
      setPage(Math.ceil((comments.length + 1) / PAGE_SIZE))
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: invalidate,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!authorName.trim() || !content.trim()) return
    localStorage.setItem('comment_author', authorName.trim())
    addMutation.mutate({
      postId,
      authorName: authorName.trim(),
      content: content.trim(),
    })
  }

  return (
    <section className="mt-4">
      <h2 className="text-base font-semibold text-ink">
        댓글{' '}
        {comments.length > 0 && (
          <span className="font-normal text-faded tabular-nums">
            {comments.length}
          </span>
        )}
      </h2>

      {/* 댓글 목록이 먼저, 입력은 아래에서 */}
      <ul className="mt-6 space-y-6">
        {isLoading && <li className="text-sm text-faded">댓글을 불러오는 중…</li>}
        {!isLoading && comments.length === 0 && (
          <li className="text-sm text-faded">
            아직 남겨진 이야기가 없어요. 첫 마디를 건네보세요.
          </li>
        )}
        {pageComments.map((comment) => (
          <li key={comment.id}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-ink">
                {comment.author_name}
              </span>
              <time className="text-xs text-faded tabular-nums">
                {formatDate(comment.created_at)}
              </time>
              {session && (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(comment.id)}
                  className="ml-auto text-xs text-faded transition-colors duration-200 hover:text-clay-strong"
                >
                  삭제
                </button>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-body">
              {comment.content}
            </p>
          </li>
        ))}
      </ul>

      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {/* 쪽지 카드 느낌의 입력 폼 */}
      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-3 rounded-2xl border border-line bg-card p-4 shadow-[0_2px_12px_-6px_rgba(43,38,32,0.08)]"
      >
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="닉네임"
          maxLength={30}
          required
          className={`${fieldClass} w-40`}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="따뜻한 한마디를 남겨주세요"
          rows={3}
          maxLength={1000}
          required
          className={`${fieldClass} w-full resize-y leading-relaxed`}
        />
        <div className="flex items-center justify-end gap-3">
          {addMutation.isError && (
            <p className="text-xs text-clay-strong">댓글 등록에 실패했어요.</p>
          )}
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="rounded-lg bg-clay px-4 py-2 text-sm font-medium text-[#fdf9f3] transition-colors duration-200 hover:bg-clay-strong disabled:opacity-50"
          >
            {addMutation.isPending ? '남기는 중…' : '남기기'}
          </button>
        </div>
      </form>
    </section>
  )
}
