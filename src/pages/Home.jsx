import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPublishedPostsPage } from '../lib/queries'
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

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', debouncedSearch],
    queryFn: ({ pageParam }) =>
      fetchPublishedPostsPage({ search: debouncedSearch, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.posts.length, 0)
      return loaded < lastPage.count ? allPages.length : undefined
    },
  })

  const posts = data?.pages.flatMap((page) => page.posts)
  const totalCount = data?.pages[0]?.count

  return (
    <>
      {/* 일기장 첫 장 */}
      <section className="mb-14">
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

      {/* 목록 섹션 시작: 라벨 + 실선 (글 사이 점선과 역할 구분) */}
      <div className="mb-7 border-b border-line pb-3">
        {search ? (
          <p className="text-sm text-faded">
            <span className="font-medium text-clay">"{search}"</span> 검색 결과
            {typeof totalCount === 'number' && (
              <span className="tabular-nums"> — {totalCount}편</span>
            )}
          </p>
        ) : (
          <p className="text-[13px] font-medium tracking-[0.14em] text-clay">
            최근 이야기
          </p>
        )}
      </div>

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

      {hasNextPage && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-body transition-colors duration-200 hover:border-clay/50 hover:text-clay disabled:opacity-50"
          >
            {isFetchingNextPage ? '불러오는 중…' : '지난 이야기 더 보기'}
          </button>
        </div>
      )}
    </>
  )
}
