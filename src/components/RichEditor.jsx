import { useEffect, useReducer, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { uploadImage } from '../lib/queries'

/* 라이트/다크 양쪽에서 읽히도록 조율한 글자색 프리셋 */
const COLORS = [
  { name: '테라코타', value: '#bc5f43' },
  { name: '모스', value: '#6f8f4f' },
  { name: '하늘', value: '#4e8fb8' },
  { name: '자두', value: '#a3679e' },
  { name: '골드', value: '#b28a3a' },
  { name: '먹색', value: '#8d8375' },
]

function insertImageFiles(view, files, event, pos) {
  const images = Array.from(files || []).filter((f) => f.type.startsWith('image/'))
  if (images.length === 0) return false
  event.preventDefault()
  images.forEach(async (file) => {
    try {
      const url = await uploadImage(file)
      const node = view.state.schema.nodes.image.create({ src: url })
      const tr =
        pos != null
          ? view.state.tr.insert(pos, node)
          : view.state.tr.replaceSelectionWith(node)
      view.dispatch(tr)
    } catch {
      // 업로드 실패 시 삽입하지 않음 (저장 시점에 다시 시도 가능)
    }
  })
  return true
}

function ToolButton({ active, disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // 에디터 선택 영역 유지
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md text-sm transition-colors duration-150 disabled:opacity-30 ${
        active
          ? 'bg-clay-soft text-clay'
          : 'text-body hover:bg-clay-soft/60 hover:text-clay'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true" />
}

const icon = (d) => (
  <svg
    className="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
)

function ColorPicker({ editor }) {
  const [open, setOpen] = useState(false)
  const currentColor = editor.getAttributes('textStyle').color

  return (
    <div className="relative">
      <ToolButton
        label="글자색"
        active={Boolean(currentColor) || open}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="text-[15px] font-semibold underline decoration-2 underline-offset-2"
          style={{ textDecorationColor: currentColor || 'var(--clay)' }}
        >
          A
        </span>
      </ToolButton>
      {open && (
        <div className="absolute top-9 left-0 z-20 flex items-center gap-1 rounded-lg border border-line bg-card p-1.5 shadow-[0_8px_24px_-8px_rgba(43,38,32,0.25)]">
          <button
            type="button"
            title="기본색"
            aria-label="기본색"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().unsetColor().run()
              setOpen(false)
            }}
            className="grid size-6 place-items-center rounded-full border border-line text-[11px] text-faded hover:border-faded"
          >
            ✕
          </button>
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.name}
              aria-label={color.name}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().setColor(color.value).run()
                setOpen(false)
              }}
              className={`size-6 rounded-full transition-transform duration-150 hover:scale-110 ${
                currentColor === color.value ? 'ring-2 ring-ink ring-offset-1' : ''
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Toolbar({ editor }) {
  const imageInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleImagePick = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch {
      window.alert('이미지 업로드에 실패했어요.')
    } finally {
      setUploading(false)
    }
  }

  const setLink = () => {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('링크 주소를 입력하세요', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-line bg-card/95 px-2 py-1.5 backdrop-blur-sm">
      <ToolButton
        label="제목"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="text-[13px] font-bold">H2</span>
      </ToolButton>
      <ToolButton
        label="소제목"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span className="text-[13px] font-bold">H3</span>
      </ToolButton>

      <Divider />

      <ToolButton
        label="굵게 (Ctrl+B)"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-extrabold">B</span>
      </ToolButton>
      <ToolButton
        label="기울임 (Ctrl+I)"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="font-serif italic">I</span>
      </ToolButton>
      <ToolButton
        label="밑줄 (Ctrl+U)"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline underline-offset-2">U</span>
      </ToolButton>
      <ToolButton
        label="취소선"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolButton>

      <Divider />

      <ColorPicker editor={editor} />
      <ToolButton
        label="형광펜"
        active={editor.isActive('highlight')}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        {icon(
          <>
            <path d="m9 11-6 6v3h9l3-3" />
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
          </>,
        )}
      </ToolButton>

      <Divider />

      <ToolButton
        label="인용구"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        {icon(
          <path d="M17 6H3M21 12H8M21 18H8M3 12v6" />,
        )}
      </ToolButton>
      <ToolButton
        label="인라인 코드"
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        {icon(
          <>
            <path d="m16 18 6-6-6-6" />
            <path d="m8 6-6 6 6 6" />
          </>,
        )}
      </ToolButton>
      <ToolButton
        label="코드 블록"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {icon(
          <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="m9 10-2 2 2 2m6-4 2 2-2 2" />
          </>,
        )}
      </ToolButton>

      <Divider />

      <ToolButton
        label="글머리 목록"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        {icon(
          <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <circle cx="4" cy="6" r="0.5" fill="currentColor" />
            <circle cx="4" cy="12" r="0.5" fill="currentColor" />
            <circle cx="4" cy="18" r="0.5" fill="currentColor" />
          </>,
        )}
      </ToolButton>
      <ToolButton
        label="번호 목록"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        {icon(
          <>
            <path d="M10 6h11M10 12h11M10 18h11" />
            <path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </>,
        )}
      </ToolButton>

      <Divider />

      <ToolButton
        label="링크"
        active={editor.isActive('link')}
        onClick={setLink}
      >
        {icon(
          <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </>,
        )}
      </ToolButton>
      <ToolButton
        label="이미지 넣기 (붙여넣기·드래그도 돼요)"
        disabled={uploading}
        onClick={() => imageInputRef.current?.click()}
      >
        {uploading ? (
          <span className="size-3.5 animate-spin rounded-full border-2 border-line border-t-clay" />
        ) : (
          icon(
            <>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </>,
          )
        )}
      </ToolButton>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleImagePick(e.target.files[0])
          e.target.value = ''
        }}
      />
      <ToolButton
        label="구분선"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        {icon(<path d="M4 12h16" />)}
      </ToolButton>

      <Divider />

      <ToolButton
        label="되돌리기 (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        {icon(<path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />)}
      </ToolButton>
      <ToolButton
        label="다시 실행"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        {icon(<path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />)}
      </ToolButton>
    </div>
  )
}

export default function RichEditor({ initialContent, editorRef }) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false },
      }),
      Image,
      TextStyle,
      Color,
      Highlight,
      Placeholder.configure({ placeholder: '오늘은 어떤 하루였나요…' }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'tiptap prose max-w-none min-h-96 px-5 py-5 focus:outline-none',
      },
      handlePaste: (view, event) =>
        insertImageFiles(view, event.clipboardData?.files, event),
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false
        const pos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos
        return insertImageFiles(view, event.dataTransfer?.files, event, pos)
      },
    },
  })

  // 부모(저장 버튼)에서 editor.getHTML() 등을 쓸 수 있게 노출
  useEffect(() => {
    if (editorRef) editorRef.current = editor
  }, [editor, editorRef])

  // 선택/입력 변화에 따라 툴바 활성 상태 갱신
  useEffect(() => {
    if (!editor) return
    editor.on('transaction', forceUpdate)
    return () => editor.off('transaction', forceUpdate)
  }, [editor])

  if (!editor) return null

  return (
    <div className="rounded-lg border border-line bg-card">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
