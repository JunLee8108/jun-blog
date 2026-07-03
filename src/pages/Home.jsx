import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPublishedPosts } from '../lib/queries'
import PostCard from '../components/PostCard'
import Spinner, { EmptyState, ErrorMessage } from '../components/Spinner'
import { Squiggle } from '../components/Doodles'
import useDebounce from '../hooks/useDebounce'
import usePageTitle from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle()
  const [search, setSearch] = useState('')
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

      <div className="relative mb-8">
        <svg
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faded"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="지난 이야기 찾아보기"
          className="w-full rounded-xl border border-line bg-card py-2.5 pr-4 pl-10 text-sm outline-none transition-colors duration-200 placeholder:text-faded/70 focus:border-clay/60"
        />
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
    </>
  )
}
