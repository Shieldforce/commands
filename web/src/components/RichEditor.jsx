import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback } from 'react'

// ── Toolbar button ─────────────────────────────────────────────────────────

function Btn({ onClick, active, title, children, disabled }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => { e.preventDefault(); onClick?.() }}
      disabled={disabled}
      title={title}
      className={`px-1.5 py-1 rounded text-xs font-medium transition-colors select-none
        ${active
          ? 'bg-blue-600 text-white dark:bg-gh-green dark:text-gh-dark'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gh-muted dark:hover:text-gh-text dark:hover:bg-gh-border'
        } disabled:opacity-30`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="w-px h-4 bg-gray-200 dark:bg-gh-border mx-0.5 shrink-0" />
}

// ── Toolbar ────────────────────────────────────────────────────────────────

function Toolbar({ editor }) {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('URL do link:', 'https://')
    if (!url) return
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
  }

  const addImage = () => {
    const url = window.prompt('URL da imagem:')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  const addYoutube = () => {
    const url = window.prompt('URL do vídeo (YouTube/Vimeo):')
    if (!url) return
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b
      border-gray-200 dark:border-gh-border bg-gray-50 dark:bg-gh-dark/50 rounded-t-lg">

      {/* Text style */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')} title="Negrito (Ctrl+B)">
        <strong>B</strong>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')} title="Itálico (Ctrl+I)">
        <em>I</em>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')} title="Sublinhado (Ctrl+U)">
        <span className="underline">U</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')} title="Tachado">
        <span className="line-through">S</span>
      </Btn>

      <Sep />

      {/* Headings */}
      {[1, 2, 3].map((n) => (
        <Btn key={n}
          onClick={() => editor.chain().focus().toggleHeading({ level: n }).run()}
          active={editor.isActive('heading', { level: n })}
          title={`Título ${n}`}>
          H{n}
        </Btn>
      ))}

      <Sep />

      {/* Alignment */}
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })} title="Alinhar esquerda">
        ≡
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })} title="Centralizar">
        ≡
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })} title="Alinhar direita">
        ≡
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')} title="Lista com marcadores">
        • —
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')} title="Lista numerada">
        1.—
      </Btn>

      <Sep />

      {/* Blocks */}
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')} title="Citação">
        "
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')} title="Código inline">
        {'`'}
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')} title="Bloco de código">
        {'</>'}
      </Btn>

      <Sep />

      {/* Insert */}
      <Btn onClick={addLink}
        active={editor.isActive('link')} title="Inserir link">
        🔗
      </Btn>
      <Btn onClick={addImage} title="Inserir imagem (URL)">
        🖼
      </Btn>
      <Btn onClick={addYoutube} title="Inserir vídeo (YouTube / Vimeo)">
        ▶
      </Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Linha horizontal">
        —
      </Btn>

      <Sep />

      {/* History */}
      <Btn onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()} title="Desfazer (Ctrl+Z)">
        ↩
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()} title="Refazer (Ctrl+Y)">
        ↪
      </Btn>
    </div>
  )
}

// ── Editor ─────────────────────────────────────────────────────────────────

export default function RichEditor({ value, onChange, placeholder = 'Escreva aqui...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Image.configure({ allowBase64: false }),
      Youtube.configure({ width: '100%', height: 360, nocookie: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  })

  // Sync external value changes (ex: modal reset)
  useEffect(() => {
    if (!editor) return
    if (value === '' && editor.getHTML() !== '<p></p>') {
      editor.commands.clearContent()
    }
  }, [value, editor])

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gh-border overflow-hidden
      focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-gh-green
      focus-within:border-transparent transition-all">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="rich-editor min-h-[180px] max-h-[420px] overflow-y-auto"
      />
    </div>
  )
}
