'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Quote,
  Code,
  Image,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  Undo,
  Redo,
  ChevronDown,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

const headingOptions = [
  { label: 'Normal Text', tag: 'p' },
  { label: 'Heading 1', tag: 'h1' },
  { label: 'Heading 2', tag: 'h2' },
  { label: 'Heading 3', tag: 'h3' },
  { label: 'Heading 4', tag: 'h4' },
  { label: 'Heading 5', tag: 'h5' },
  { label: 'Heading 6', tag: 'h6' },
]

const headingStyles: Record<string, string> = {
  p: 'text-sm',
  h1: 'text-[32px] leading-tight font-bold',
  h2: 'text-[24px] leading-tight font-bold',
  h3: 'text-[20px] leading-snug font-bold',
  h4: 'text-[16px] leading-normal font-bold',
  h5: 'text-[13px] leading-normal font-bold',
  h6: 'text-[11px] leading-normal font-semibold',
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  minHeight = '400px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const [currentHeading, setCurrentHeading] = useState('p')
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const bgColorPickerRef = useRef<HTMLDivElement>(null)
  const headingDropdownRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current && editorRef.current) {
      editorRef.current.innerHTML = value
      isInitialMount.current = false
    }
  }, [value])

  // Check active formatting state
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('strikethrough')) formats.add('strikethrough')
    if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList')
    if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList')
    if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft')
    if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter')
    if (document.queryCommandState('justifyRight')) formats.add('justifyRight')
    setActiveFormats(formats)

    // Detect current heading
    const block = document.queryCommandValue('formatBlock')
    const normalized = block.replace(/<|>/g, '').toLowerCase()
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(normalized)) {
      setCurrentHeading(normalized)
    } else {
      setCurrentHeading('p')
    }
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
      if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(e.target as Node)) {
        setShowBgColorPicker(false)
      }
      if (headingDropdownRef.current && !headingDropdownRef.current.contains(e.target as Node)) {
        setShowHeadingDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Listen for selection changes to update active state
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current?.contains(document.activeElement)) {
        updateActiveFormats()
      }
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [updateActiveFormats])

  const execCommand = useCallback((command: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    setTimeout(updateActiveFormats, 0)
  }, [onChange, updateActiveFormats])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    updateActiveFormats()
  }, [onChange, updateActiveFormats])

  const handleKeyUp = useCallback(() => {
    updateActiveFormats()
  }, [updateActiveFormats])

  const handleInsertLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }, [execCommand])

  const handleInsertImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }, [execCommand])

  const handleHeadingSelect = (tag: string) => {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, `<${tag}>`)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    setCurrentHeading(tag)
    setShowHeadingDropdown(false)
    setTimeout(updateActiveFormats, 0)
  }

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#cccccc',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#dc2626',
    '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed',
  ]

  const toolbarButtons = [
    { icon: <Bold className="h-4 w-4" />, command: 'bold', label: 'Bold (Ctrl+B)' },
    { icon: <Italic className="h-4 w-4" />, command: 'italic', label: 'Italic (Ctrl+I)' },
    { icon: <Underline className="h-4 w-4" />, command: 'underline', label: 'Underline (Ctrl+U)' },
    { icon: <Strikethrough className="h-4 w-4" />, command: 'strikethrough', label: 'Strikethrough' },
  ]

  const insertButtons = [
    { icon: <Link className="h-4 w-4" />, command: 'link', label: 'Insert Link' },
    { icon: <Quote className="h-4 w-4" />, command: 'blockquote', label: 'Quote' },
    { icon: <Code className="h-4 w-4" />, command: 'pre', label: 'Code Block' },
    { icon: <Image className="h-4 w-4" />, command: 'image', label: 'Insert Image' },
  ]

  const listButtons = [
    { icon: <List className="h-4 w-4" />, command: 'insertUnorderedList', label: 'Bullet List' },
    { icon: <ListOrdered className="h-4 w-4" />, command: 'insertOrderedList', label: 'Numbered List' },
  ]

  const alignButtons = [
    { icon: <AlignLeft className="h-4 w-4" />, command: 'justifyLeft', label: 'Align Left' },
    { icon: <AlignCenter className="h-4 w-4" />, command: 'justifyCenter', label: 'Align Center' },
    { icon: <AlignRight className="h-4 w-4" />, command: 'justifyRight', label: 'Align Right' },
  ]

  const handleInsertClick = (cmd: string) => {
    if (cmd === 'link') handleInsertLink()
    else if (cmd === 'image') handleInsertImage()
    else execCommand('formatBlock', `<${cmd}>`)
  }

  const currentHeadingLabel = headingOptions.find(h => h.tag === currentHeading)?.label || 'Normal Text'

  return (
    <div className={cn('rounded-lg border border-gray-200 overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50/80 px-2 py-1.5">

        {/* Heading Dropdown */}
        <div className="relative" ref={headingDropdownRef}>
          <button
            type="button"
            onClick={() => { setShowHeadingDropdown(!showHeadingDropdown); setShowColorPicker(false); setShowBgColorPicker(false) }}
            className="flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <span className="min-w-[90px] text-left text-xs">{currentHeadingLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </button>
          {showHeadingDropdown && (
            <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {headingOptions.map((opt) => (
                <button
                  key={opt.tag}
                  type="button"
                  onClick={() => handleHeadingSelect(opt.tag)}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-left transition-colors hover:bg-blue-50',
                    currentHeading === opt.tag && 'bg-blue-50 text-blue-600'
                  )}
                >
                  <span className={cn(headingStyles[opt.tag], 'text-gray-800', currentHeading === opt.tag && 'text-blue-600')}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Text Formatting */}
        {toolbarButtons.map((btn) => (
          <button
            key={btn.command}
            type="button"
            onClick={() => execCommand(btn.command)}
            title={btn.label}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              activeFormats.has(btn.command)
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            )}
          >
            {btn.icon}
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Insert Tools */}
        {insertButtons.map((btn) => (
          <button
            key={btn.command}
            type="button"
            onClick={() => handleInsertClick(btn.command)}
            title={btn.label}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
          >
            {btn.icon}
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Lists */}
        {listButtons.map((btn) => (
          <button
            key={btn.command}
            type="button"
            onClick={() => execCommand(btn.command)}
            title={btn.label}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              activeFormats.has(btn.command)
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            )}
          >
            {btn.icon}
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Alignment */}
        {alignButtons.map((btn) => (
          <button
            key={btn.command}
            type="button"
            onClick={() => execCommand(btn.command)}
            title={btn.label}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              activeFormats.has(btn.command)
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            )}
          >
            {btn.icon}
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Text Color */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => { setShowColorPicker(!showColorPicker); setShowBgColorPicker(false); setShowHeadingDropdown(false) }}
            title="Text Color"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              showColorPicker ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            )}
          >
            <Type className="h-4 w-4" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Text Color</p>
              <div className="grid grid-cols-5 gap-1.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { execCommand('foreColor', color); setShowColorPicker(false) }}
                    className="h-6 w-6 rounded-full border border-gray-200 transition-transform hover:scale-125 hover:shadow-md"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative" ref={bgColorPickerRef}>
          <button
            type="button"
            onClick={() => { setShowBgColorPicker(!showBgColorPicker); setShowColorPicker(false); setShowHeadingDropdown(false) }}
            title="Highlight Color"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              showBgColorPicker ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            )}
          >
            <Palette className="h-4 w-4" />
          </button>
          {showBgColorPicker && (
            <div className="absolute top-full right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Highlight</p>
              <div className="grid grid-cols-5 gap-1.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { execCommand('hiliteColor', color); setShowBgColorPicker(false) }}
                    className="h-6 w-6 rounded-full border border-gray-200 transition-transform hover:scale-125 hover:shadow-md"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => execCommand('undo')}
          title="Undo (Ctrl+Z)"
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('redo')}
          title="Redo (Ctrl+Y)"
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={updateActiveFormats}
        data-placeholder={placeholder}
        className={cn(
          'px-4 py-3 text-sm leading-relaxed text-gray-800 outline-none',
          'prose prose-sm max-w-none',
          'prose-headings:font-semibold prose-headings:text-gray-900',
          'prose-h1:text-[32px] prose-h2:text-[24px] prose-h3:text-[20px] prose-h4:text-[16px] prose-h5:text-[13px] prose-h6:text-[11px]',
          'prose-p:my-2 prose-p:text-gray-600',
          'prose-a:text-blue-500 prose-a:underline',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-500',
          'prose-pre:bg-gray-100 prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-sm',
          'prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5',
          'prose-img:rounded-lg prose-img:max-w-full',
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400',
        )}
        style={{ minHeight }}
      />
    </div>
  )
}
