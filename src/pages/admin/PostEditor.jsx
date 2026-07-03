import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPostById, savePost, uploadImage } from '../../lib/queries'
import { slugify } from '../../lib/utils'
import Markdown from '../../components/Markdown'
import Spinner, { ErrorMessage } from '../../components/Spinner'
import usePageTitle from '../../hooks/usePageTitle'

const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-clay/60'

const uploadButtonClass =
  'cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm text-body transition-colors duration-200 hover:border-faded'

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-[13px] font-medium text-ink">
        {label}
        {hint && <span className="font-normal text-faded">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function EditorForm({ post }) {
  const isEdit = Boolean(post)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const contentRef = useRef(null)

  const [title, setTitle] = useState(post?.title || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '')
  const [tagsInput, setTagsInput] = useState(
    post?.tags?.map((t) => t.name).join(', ') || '',
  )
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '')
  const [showPreview, setShowPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const saveMutation = useMutation({
    mutationFn: savePost,
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate('/admin')
    },
    onError: (error) => setErrorMessage(`저장에 실패했습니다: ${error.message}`),
  })

  const handleSave = (status) => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage('제목과 본문을 입력해 주세요.')
      return
    }
    setErrorMessage('')
    saveMutation.mutate({
      id: post?.id,
      post: {
        title: title.trim(),
        slug: isEdit ? post.slug : slugify(title),
        excerpt: excerpt.trim(),
        content,
        cover_image_url: coverImageUrl || null,
        status,
        published_at: post?.published_at || null,
      },
      tagNames: tagsInput.split(','),
    })
  }

  const handleImageUpload = async (file, asCover = false) => {
    if (!file) return
    setUploading(true)
    setErrorMessage('')
    try {
      const url = await uploadImage(file)
      if (asCover) {
        setCoverImageUrl(url)
      } else {
        const textarea = contentRef.current
        const markdownImage = `\n![](${url})\n`
        const pos = textarea?.selectionStart ?? content.length
        setContent((prev) => prev.slice(0, pos) + markdownImage + prev.slice(pos))
      }
    } catch (error) {
      setErrorMessage(`이미지 업로드에 실패했습니다: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">
          {isEdit ? '글 수정' : '새 글 쓰기'}
        </h1>
        {/* 데스크톱(lg+)은 항상 나란히 보이므로 토글은 그 아래에서만 */}
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-body transition-colors duration-200 hover:border-faded lg:hidden"
        >
          {showPreview ? '편집' : '미리보기'}
        </button>
      </div>

      <div className="space-y-5">
        <Field label="제목">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="오늘의 이야기"
            className={`${inputClass} text-lg font-semibold`}
          />
        </Field>

        <Field label="요약" hint="홈 목록에 표시돼요">
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="글을 한두 문장으로 소개해 주세요"
            className={inputClass}
          />
        </Field>

        <Field label="태그" hint="쉼표로 구분">
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="일상, 개발"
            className={inputClass}
          />
        </Field>

        <div>
          <span className="mb-1.5 flex items-baseline gap-1.5 text-[13px] font-medium text-ink">
            커버 이미지
            <span className="font-normal text-faded">
              홈 목록과 글 상단에 보여요
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className={uploadButtonClass}>
              {coverImageUrl ? '커버 바꾸기' : '이미지 올리기'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0], true)}
              />
            </label>
            {coverImageUrl && (
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                className="text-clay-strong hover:underline"
              >
                제거
              </button>
            )}
            {uploading && <span className="text-faded">업로드 중…</span>}
          </div>
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="커버 이미지 미리보기"
              className="mt-3 max-h-56 rounded-xl object-cover ring-1 ring-line"
            />
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="flex items-baseline gap-1.5 text-[13px] font-medium text-ink">
              본문
              <span className="font-normal text-faded">
                마크다운 · 이미지는 미리보기에 바로 보여요
              </span>
            </span>
            <label className="cursor-pointer text-[13px] text-clay transition-colors duration-200 hover:text-clay-strong">
              + 본문에 이미지 삽입
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
            </label>
          </div>

          {/* 데스크톱: 편집·미리보기 나란히 (넓게 브레이크아웃) */}
          <div className="grid gap-4 lg:-mx-24 lg:grid-cols-2 xl:-mx-40">
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="본문을 마크다운으로 작성하세요…"
              rows={22}
              className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed ${
                showPreview ? 'hidden lg:block' : ''
              }`}
            />
            <div
              className={`max-h-[75vh] min-h-96 overflow-y-auto rounded-lg border border-line bg-card px-5 py-4 ${
                showPreview ? '' : 'hidden lg:block'
              }`}
            >
              {content ? (
                <Markdown content={content} />
              ) : (
                <p className="text-sm text-faded">
                  본문을 쓰면 여기에 바로 미리보여요.
                </p>
              )}
            </div>
          </div>
        </div>

        {errorMessage && <p className="text-sm text-clay-strong">{errorMessage}</p>}

        <div className="flex justify-end gap-2 border-t border-dashed border-line pt-4">
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => handleSave('draft')}
            className="rounded-lg border border-line px-4 py-2 text-sm text-body transition-colors duration-200 hover:border-faded disabled:opacity-50"
          >
            임시저장
          </button>
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => handleSave('published')}
            className="rounded-lg bg-clay px-4 py-2 text-sm font-medium text-[#fdf9f3] transition-colors duration-200 hover:bg-clay-strong disabled:opacity-50"
          >
            {saveMutation.isPending ? '저장 중…' : '발행하기'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function PostEditor() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  usePageTitle(isEdit ? '글 수정' : '새 글 쓰기')

  const { data: post, isLoading } = useQuery({
    queryKey: ['admin', 'post', id],
    queryFn: () => fetchPostById(id),
    enabled: isEdit,
  })

  if (isEdit && isLoading) return <Spinner />
  if (isEdit && !post) return <ErrorMessage message="글을 찾을 수 없습니다." />

  return <EditorForm key={post?.id || 'new'} post={post} />
}
