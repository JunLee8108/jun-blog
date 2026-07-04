import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPostDays } from '../lib/queries'
import { formatDate } from '../lib/utils'

const dateKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

/* 최근 1년, 글을 쓴 날이 칠해지는 잔디 달력 */
export default function RecordCalendar() {
  const { data: posts } = useQuery({
    queryKey: ['post-days'],
    queryFn: fetchPostDays,
  })

  const byDate = new Map()
  for (const post of posts || []) {
    const key = dateKey(new Date(post.published_at))
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key).push(post)
  }

  // 오늘로 끝나는 53주 그리드 (일요일 시작)
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const start = new Date(end)
  start.setDate(start.getDate() - 364)
  start.setDate(start.getDate() - start.getDay())

  const weeks = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(cursor <= end ? new Date(cursor) : null)
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  // 달이 바뀌는 주 위에 라벨 (겹치지 않게 최소 3주 간격)
  let lastLabelIndex = -3
  const monthLabels = weeks.map((week, i) => {
    const first = week.find(Boolean)
    if (!first) return ''
    const prevFirst = i > 0 ? weeks[i - 1].find(Boolean) : null
    const monthChanged = !prevFirst || prevFirst.getMonth() !== first.getMonth()
    if (monthChanged && i - lastLabelIndex >= 3) {
      lastLabelIndex = i
      return `${first.getMonth() + 1}월`
    }
    return ''
  })

  const writtenDays = byDate.size

  return (
    <div>
      <p className="text-sm text-faded">
        최근 1년,{' '}
        <span className="font-medium text-clay tabular-nums">{writtenDays}일</span>을
        기록했어요
      </p>
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="w-max">
          <div className="mb-1.5 flex gap-[3px]">
            {monthLabels.map((label, i) => (
              <span
                key={i}
                className="w-3 shrink-0 text-[9px] whitespace-nowrap text-faded"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  if (!day) {
                    return <span key={di} className="size-3" aria-hidden="true" />
                  }
                  const dayPosts = byDate.get(dateKey(day))
                  if (!dayPosts) {
                    return (
                      <span
                        key={di}
                        className="size-3 rounded-[3px]"
                        style={{
                          background:
                            'color-mix(in srgb, var(--ink) 7%, transparent)',
                        }}
                        title={formatDate(day.toISOString())}
                      />
                    )
                  }
                  return (
                    <Link
                      key={di}
                      to={`/posts/${dayPosts[0].slug}`}
                      title={`${formatDate(day.toISOString())} · ${dayPosts
                        .map((p) => p.title)
                        .join(', ')}`}
                      className="size-3 rounded-[3px] bg-clay transition-transform duration-150 hover:scale-125"
                      style={{
                        opacity: dayPosts.length >= 3 ? 1 : dayPosts.length === 2 ? 0.8 : 0.6,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
