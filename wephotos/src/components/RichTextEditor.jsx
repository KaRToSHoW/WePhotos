import React, { useEffect, useRef } from 'react'

export default function RichTextEditor({ value = '', onChange, placeholder = 'Описание...', className = '' }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  function exec(command, arg) {
    document.execCommand(command, false, arg)
    if (editorRef.current) onChange?.(editorRef.current.innerHTML)
  }

  function handleInput() {
    if (editorRef.current) onChange?.(editorRef.current.innerHTML)
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2 text-cyan-200/80">
        <button type="button" onClick={() => exec('bold')} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10">B</button>
        <button type="button" onClick={() => exec('italic')} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 italic">I</button>
        <button type="button" onClick={() => exec('underline')} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 underline">U</button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10">•</button>
        <button type="button" onClick={() => exec('insertOrderedList')} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10">1.</button>
        <button type="button" onClick={() => exec('formatBlock', '<h4>')} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10">H4</button>
        <button type="button" onClick={() => exec('removeFormat')} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10">CLR</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[96px] p-3 rounded-xl bg-white/5 border border-cyan-200/20 text-cyan-100 placeholder-cyan-400 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: rgb(103 232 249 / 0.5);
        }
      `}</style>
    </div>
  )
}
