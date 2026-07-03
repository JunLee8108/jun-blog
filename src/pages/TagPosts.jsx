import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPostsByTag } from '../lib/queries'
import PostCard from '../components/PostCard'
import Spinner, { EmptyState, ErrorMessage } from '../components/Spinner'
import usePageTitle from '../hooks/usePageTitle'

export default function TagPosts() {
  const { slug } = useParams()

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['posts', 'tag', slug],
    queryFn: () => fetchPostsByTag(slug),
  })

  const tagName = posts?.[0]?.tags?.find((t) => t.slug === slug)?.name || slug
  usePageTitle(`#${tagName}`)

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        <span className="text-indigo-600 dark:text-indigo-400">#</span>
        {tagName}
        {posts && (
          <span className="ml-2 text-base font-normal text-neutral-400">
            {posts.length}개의 글
          </span>
        )}
      </h1>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage />}
      {posts?.length === 0 && <EmptyState message="이 태그의 글이 없습니다." />}
      <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  )
}
