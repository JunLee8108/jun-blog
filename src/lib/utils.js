import GithubSlugger from 'github-slugger'
import DOMPurify from 'dompurify'

export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 일주일 안쪽 글에는 사람 말투의 상대 시간을 병기
export function relativeDate(dateString) {
  if (!dateString) return null
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000)
  if (days < 0 || days > 7) return null
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days === 2) return '그제'
  return `${days}일 전`
}

// 한글 기준 분당 약 500자로 계산 (HTML 본문은 태그를 제외하고 셈)
export function readingTime(content = '') {
  const text = content.replace(/<[^>]*>/g, ' ')
  const chars = text.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.round(chars / 500))
  return `${minutes}분`
}

// 리치 에디터(HTML) 글: sanitize + 제목에 앵커 id 부여 + 목차 추출
export function prepareHtml(html = '') {
  const clean = DOMPurify.sanitize(html)
  const doc = new DOMParser().parseFromString(clean, 'text/html')
  const slugger = new GithubSlugger()
  const headings = []

  doc.querySelectorAll('h1, h2, h3').forEach((el) => {
    const text = el.textContent.trim()
    if (!text) return
    const id = slugger.slug(text)
    el.id = id
    headings.push({ depth: Number(el.tagName[1]), text, id })
  })

  return { html: doc.body.innerHTML, headings }
}

export function slugify(text) {
  const slug = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || `post-${Date.now().toString(36)}`
}

export function extractHeadings(markdown = '') {
  const slugger = new GithubSlugger()
  const headings = []
  let inCodeBlock = false

  for (const line of markdown.split('\n')) {
    if (/^(```|~~~)/.test(line.trim())) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = /^(#{1,3})\s+(.+)/.exec(line)
    if (match) {
      const text = match[2].replace(/[*_`~[\]]/g, '').trim()
      headings.push({ depth: match[1].length, text, id: slugger.slug(text) })
    }
  }
  return headings
}
