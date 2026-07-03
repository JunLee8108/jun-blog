import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPublishedPosts } from '../lib/queries'
import PostCard from '../components/PostCard'
import Spinner, { EmptyState, ErrorMessage } from '../components/Spinner'
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
      <section className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          안녕하세요, Jun입니다 👋
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          일상과 개발, 그 사이의 기록들을 남기는 공간입니다.
        </p>
      </section>

      <div className="relative mb-6">
        <svg
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
          placeholder="글 검색"
          className="w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-9 text-sm outline-none transition-colors focus:border-indigo-400 dark:border-neutral-800 dark:focus:border-indigo-500"
        />
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage />}
      {posts?.length === 0 && (
        <EmptyState
          message={search ? '검색 결과가 없습니다.' : '아직 발행된 글이 없습니다.'}
        />
      )}
      <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  )
}
