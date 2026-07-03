import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marked } from 'marked'
import { fetchPostById, savePost, uploadImage } from '../../lib/queries'
import { slugify } from '../../lib/utils'
import RichEditor from '../../components/RichEditor'
import Spinner, { ErrorMessage } from '../../components/Spinner'
import usePageTitle from '../../hooks/usePageTitle'

const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-clay/60'

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
  const editorRef = useRef(null)

  const [title, setTitle] = useState(post?.title || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [tagsInput, setTagsInput] = useState(
    post?.tags?.map((t) => t.name).join(', ') || '',
  )
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '')
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ── 자동 임시저장 (localStorage) ─────────────────────────────
  const draftKey = `draft_${post?.id || 'new'}`
  const [draft] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(draftKey))
      // 저장된 글보다 오래된 초안은 버린다
      if (
        parsed &&
        post?.updated_at &&
        parsed.savedAt < new Date(post.updated_at).getTime()
      ) {
        localStorage.removeItem(draftKey)
        return null
      }
      return parsed
    } catch {
      return null
    }
  })
  const [showRestore, setShowRestore] = useState(Boolean(draft))
  const [contentVersion, setContentVersion] = useState(0)

  useEffect(() => {
    if (showRestore) return // 복구 여부를 정하기 전에는 초안을 덮어쓰지 않는다
    const timer = setTimeout(() => {
      const editor = editorRef.current
      if (!title.trim() && (editor?.isEmpty ?? true)) return
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          title,
          excerpt,
          tagsInput,
          coverImageUrl,
          content: editor?.getHTML() || '',
          savedAt: Date.now(),
        }),
      )
    }, 1500)
    return () => clearTimeout(timer)
  }, [title, excerpt, tagsInput, coverImageUrl, contentVersion, showRestore, draftKey])

  const restoreDraft = () => {
    setTitle(draft.title || '')
    setExcerpt(draft.excerpt || '')
    setTagsInput(draft.tagsInput || '')
    setCoverImageUrl(draft.coverImageUrl || '')
    editorRef.current?.commands.setContent(draft.content || '')
    setShowRestore(false)
  }

  const discardDraft = () => {
    localStorage.removeItem(draftKey)
    setShowRestore(false)
  }

  // 예전 마크다운 글은 열 때 HTML로 변환해서 리치 에디터로 이어서 편집
  const initialContent = post
    ? post.format === 'html'
      ? post.content
      : marked.parse(post.content || '', { breaks: true, gfm: true })
    : ''

  const saveMutation = useMutation({
    mutationFn: savePost,
    onSuccess: () => {
      localStorage.removeItem(draftKey)
      queryClient.invalidateQueries()
      navigate('/admin')
    },
    onError: (error) => setErrorMessage(`저장에 실패했습니다: ${error.message}`),
  })

  const handleSave = (status) => {
    const editor = editorRef.current
    if (!title.trim() || !editor || editor.isEmpty) {
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
        content: editor.getHTML(),
        format: 'html',
        cover_image_url: coverImageUrl || null,
        status,
        published_at: post?.published_at || null,
      },
      tagNames: tagsInput.split(','),
    })
  }

  const handleCoverUpload = async (file) => {
    if (!file) return
    setUploading(true)
    setErrorMessage('')
    try {
      setCoverImageUrl(await uploadImage(file))
    } catch (error) {
      setErrorMessage(`이미지 업로드에 실패했습니다: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink">
        {isEdit ? '글 수정' : '새 글 쓰기'}
      </h1>

      {showRestore && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-clay/30 bg-clay-soft px-4 py-3 text-sm">
          <p className="text-body">
            임시저장된 글이 있어요{' '}
            <span className="text-faded">
              (
              {new Date(draft.savedAt).toLocaleString('ko-KR', {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
              )
            </span>
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-lg bg-clay px-3 py-1.5 text-xs font-medium text-[#fdf9f3] transition-colors duration-200 hover:bg-clay-strong"
            >
              이어서 쓰기
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-body transition-colors duration-200 hover:border-faded"
            >
              지우기
            </button>
          </div>
        </div>
      )}

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
            <label className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-body transition-colors duration-200 hover:border-faded">
              {coverImageUrl ? '커버 바꾸기' : '이미지 올리기'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCoverUpload(e.target.files[0])}
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
          <span className="mb-1.5 flex items-baseline gap-1.5 text-[13px] font-medium text-ink">
            본문
            <span className="font-normal text-faded">
              이미지는 붙여넣기·드래그로도 넣을 수 있어요
            </span>
          </span>
          <RichEditor
            initialContent={initialContent}
            editorRef={editorRef}
            onUpdate={() => setContentVersion((v) => v + 1)}
          />
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
