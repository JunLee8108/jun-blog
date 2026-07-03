import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPublishedPosts } from '../lib/queries'
import PostCard from '../components/PostCard'
import Spinner, { EmptyState, ErrorMessage } from '../components/Spinner'
import { Squiggle } from '../components/Doodles'
import useDebounce from '../hooks/useDebounce'
import usePageTitle from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const debouncedSearch = useDebounce(search, 300)

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['posts', debouncedSearch],
    queryFn: () => fetchPublishedPosts(debouncedSearch),
  })

  return (
    <>
      {/* 일기장 첫 장 */}
      <section className="mb-12">
        <p className="text-[13px] font-medium tracking-[0.14em] text-clay">
          일상과 개발 사이
        </p>
        <h1 className="mt-3 text-[27px] font-semibold text-ink sm:text-3xl">
          안녕하세요, Jun입니다
        </h1>
        <Squiggle className="mt-2.5 h-2.5 w-32 text-clay/70" />
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-body/90">
          거창한 이야기보다, 오늘 하루와 배운 것들을 천천히 적어두는 곳이에요.
        </p>
      </section>

      {search && (
        <p className="mb-6 text-sm text-faded">
          <span className="font-medium text-clay">"{search}"</span> 검색 결과
          {posts && (
            <span className="tabular-nums"> — {posts.length}편</span>
          )}
        </p>
      )}

      {isLoading && <Spinner />}
      {isError && <ErrorMessage />}
      {posts?.length === 0 && (
        <EmptyState
          message={
            search ? '그런 이야기는 아직 없네요.' : '아직 적어둔 글이 없어요.'
          }
        />
      )}
      <div className="divide-y divide-dashed divide-line">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  )
}
