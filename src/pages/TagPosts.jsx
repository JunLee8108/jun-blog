import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPostsByTag } from '../lib/queries'
import PostCard from '../components/PostCard'
import Spinner, { EmptyState, ErrorMessage } from '../components/Spinner'
import { Squiggle } from '../components/Doodles'
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
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-ink">
          <span className="text-clay">#</span>
          {tagName}
        </h1>
        <Squiggle className="mt-2 h-2.5 w-24 text-clay/60" />
        {posts && (
          <p className="mt-3 text-sm text-faded tabular-nums">
            {posts.length}편의 이야기가 있어요
          </p>
        )}
      </header>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage />}
      {posts?.length === 0 && (
        <EmptyState message="이 태그로 적어둔 글이 아직 없어요." />
      )}
      <div className="divide-y divide-dashed divide-line">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  )
}
