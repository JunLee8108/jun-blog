import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deletePost, fetchAllPostsForAdmin } from '../../lib/queries'
import { formatDate } from '../../lib/utils'
import Spinner, { EmptyState, ErrorMessage } from '../../components/Spinner'
import usePageTitle from '../../hooks/usePageTitle'

export default function Dashboard() {
  usePageTitle('관리자')
  const queryClient = useQueryClient()

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['admin', 'posts'],
    queryFn: fetchAllPostsForAdmin,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] }),
  })

  const handleDelete = (post) => {
    if (window.confirm(`"${post.title}" 글을 삭제할까요? 되돌릴 수 없습니다.`)) {
      deleteMutation.mutate(post.id)
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          글 관리
        </h1>
        <Link
          to="/admin/write"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          새 글 쓰기
        </Link>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage />}
      {posts?.length === 0 && (
        <EmptyState message="아직 글이 없습니다. 첫 글을 작성해 보세요." />
      )}

      <ul className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
        {posts?.map((post) => (
          <li key={post.id} className="flex items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    post.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                  }`}
                >
                  {post.status === 'published' ? '발행됨' : '초안'}
                </span>
                <Link
                  to={
                    post.status === 'published'
                      ? `/posts/${post.slug}`
                      : `/admin/edit/${post.id}`
                  }
                  className="truncate text-sm font-medium text-neutral-900 hover:text-indigo-600 dark:text-neutral-100 dark:hover:text-indigo-400"
                >
                  {post.title}
                </Link>
              </div>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                {formatDate(post.published_at || post.created_at)}
                <span className="mx-1.5">·</span>조회 {post.view_count}
              </p>
            </div>
            <div className="flex shrink-0 gap-2 text-xs">
              <Link
                to={`/admin/edit/${post.id}`}
                className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-neutral-600 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(post)}
                className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-red-500 transition-colors hover:border-red-300 dark:border-neutral-800 dark:hover:border-red-900"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
