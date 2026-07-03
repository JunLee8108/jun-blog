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
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-body transition-colors duration-200 hover:border-faded"
        >
          {showPreview ? '편집' : '미리보기'}
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className={`${inputClass} text-lg font-semibold`}
        />
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="요약 (목록에 표시됩니다)"
          className={inputClass}
        />
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="태그 (쉼표로 구분: 일상, 개발)"
          className={inputClass}
        />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-body transition-colors duration-200 hover:border-faded">
            커버 이미지
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files[0], true)}
            />
          </label>
          <label className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-body transition-colors duration-200 hover:border-faded">
            본문에 이미지 삽입
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
          </label>
          {uploading && <span className="text-faded">업로드 중…</span>}
          {coverImageUrl && (
            <span className="flex items-center gap-2 text-faded">
              커버 설정됨
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                className="text-clay-strong hover:underline"
              >
                제거
              </button>
            </span>
          )}
        </div>

        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt="커버 이미지 미리보기"
            className="max-h-56 rounded-xl object-cover"
          />
        )}

        {showPreview ? (
          <div className="min-h-96 rounded-lg border border-line bg-card px-5 py-4">
            {content ? (
              <Markdown content={content} />
            ) : (
              <p className="text-sm text-faded">본문이 비어 있어요.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="본문을 마크다운으로 작성하세요…"
            rows={20}
            className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
          />
        )}

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
