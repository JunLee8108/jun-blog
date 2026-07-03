import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deletePost, fetchAllPostsForAdmin } from '../../lib/queries'
import { formatDate } from '../../lib/utils'
import Spinner, { EmptyState, ErrorMessage } from '../../components/Spinner'
import usePageTitle from '../../hooks/usePageTitle'

export default function Dashboard() {
  usePageTitle('글 관리')
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
    if (window.confirm(`"${post.title}" 글을 삭제할까요? 되돌릴 수 없어요.`)) {
      deleteMutation.mutate(post.id)
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">글 관리</h1>
        <Link
          to="/admin/write"
          className="rounded-lg bg-clay px-4 py-2 text-sm font-medium text-[#fdf9f3] transition-colors duration-200 hover:bg-clay-strong"
        >
          새 글 쓰기
        </Link>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage />}
      {posts?.length === 0 && (
        <EmptyState message="아직 글이 없어요. 첫 글을 적어보세요." />
      )}

      <ul className="divide-y divide-dashed divide-line">
        {posts?.map((post) => (
          <li key={post.id} className="flex items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 rounded-[4px] px-2 py-0.5 text-[11px] font-medium ${
                    post.status === 'published'
                      ? 'bg-[#eaefdf] text-[#657c3d] dark:bg-[#2b301f] dark:text-[#b3c283]'
                      : 'bg-[#f4ead6] text-[#a1782c] dark:bg-[#352c1a] dark:text-[#d3a95b]'
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
                  className="truncate text-sm font-medium text-ink transition-colors duration-200 hover:text-clay"
                >
                  {post.title}
                </Link>
              </div>
              <p className="mt-1 text-xs text-faded tabular-nums">
                {formatDate(post.published_at || post.created_at)}
                <span className="mx-1.5">·</span>
                {post.view_count}번 읽힘
              </p>
            </div>
            <div className="flex shrink-0 gap-2 text-xs">
              <Link
                to={`/admin/edit/${post.id}`}
                className="rounded-md border border-line px-2.5 py-1.5 text-body transition-colors duration-200 hover:border-faded"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(post)}
                className="rounded-md border border-line px-2.5 py-1.5 text-clay-strong transition-colors duration-200 hover:border-clay/50"
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
