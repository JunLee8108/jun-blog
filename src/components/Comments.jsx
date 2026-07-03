import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addComment, deleteComment, fetchComments } from '../lib/queries'
import { formatDate } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

export default function Comments({ postId }) {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [authorName, setAuthorName] = useState(
    () => localStorage.getItem('comment_author') || '',
  )
  const [content, setContent] = useState('')

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['comments', postId] })

  const addMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      setContent('')
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
    <section className="mt-14 border-t border-neutral-200/70 pt-10 dark:border-neutral-800/70">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        댓글 {comments.length > 0 && `${comments.length}개`}
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="닉네임"
          maxLength={30}
          required
          className="w-40 rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-400 dark:border-neutral-800 dark:focus:border-indigo-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 남겨주세요"
          rows={3}
          maxLength={1000}
          required
          className="w-full resize-y rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-indigo-400 dark:border-neutral-800 dark:focus:border-indigo-500"
        />
        <div className="flex items-center justify-end gap-3">
          {addMutation.isError && (
            <p className="text-xs text-red-500">댓글 등록에 실패했습니다.</p>
          )}
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {addMutation.isPending ? '등록 중…' : '댓글 등록'}
          </button>
        </div>
      </form>

      <ul className="mt-8 space-y-6">
        {isLoading && (
          <li className="text-sm text-neutral-400">댓글을 불러오는 중…</li>
        )}
        {!isLoading && comments.length === 0 && (
          <li className="text-sm text-neutral-400 dark:text-neutral-500">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
          </li>
        )}
        {comments.map((comment) => (
          <li key={comment.id}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {comment.author_name}
              </span>
              <time className="text-xs text-neutral-400 dark:text-neutral-500">
                {formatDate(comment.created_at)}
              </time>
              {session && (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(comment.id)}
                  className="ml-auto text-xs text-neutral-400 transition-colors hover:text-red-500"
                >
                  삭제
                </button>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-neutral-600 dark:text-neutral-300">
              {comment.content}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
