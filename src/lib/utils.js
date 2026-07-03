import GithubSlugger from 'github-slugger'

export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 한글 기준 분당 약 500자로 계산
export function readingTime(content = '') {
  const chars = content.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.round(chars / 500))
  return `${minutes}분`
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
