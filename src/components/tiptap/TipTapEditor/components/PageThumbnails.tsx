import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import type { PageSettings } from '../types'
import { usePageCount, usePageLayout } from '../hooks/usePageLayout'
import type { PageLayoutPx } from '../hooks/usePageLayout'

interface PageThumbnailsProps {
  editor: Editor
  pageSettings: PageSettings
}

const THUMBNAIL_WIDTH = 120
// Wait for typing to pause before redrawing thumbnails
const REFRESH_DELAY_MS = 300
// Editor-only elements that must not show up in thumbnails
const EDITOR_ONLY_SELECTORS = '[data-resize-handle], [data-table-control], .collaboration-caret, .ProseMirror-gapcursor'

// Safari has no requestIdleCallback
const scheduleIdle = (callback: () => void) =>
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(callback, { timeout: 500 })
    : setTimeout(callback, 0)

/**
 * Draws one page by cloning only the top-level blocks that overlap it,
 * offset so they land where they sit on the real page.
 */
function drawPage (target: HTMLElement, editor: Editor, pageIndex: number, layout: PageLayoutPx) {
  const page = editor.view.dom.closest('.document-page')

  if (!page) return

  const pageTop = page.getBoundingClientRect().top + pageIndex * layout.pitch
  const pageBottom = pageTop + layout.pageHeight
  const contentTop = pageTop + layout.marginTop
  const content = document.createElement('div')

  // flow-root keeps the first block's margin inside, so the offset below is exact
  content.className = editor.view.dom.className
  content.style.display = 'flow-root'

  let first = true

  for (const block of Array.from(editor.view.dom.children)) {
    if (block.classList.contains('page-break-spacer')) continue

    const rect = block.getBoundingClientRect()

    if (rect.bottom <= pageTop) continue
    if (rect.top >= pageBottom) break

    if (first) {
      const marginTop = parseFloat(getComputedStyle(block).marginTop || '0')

      content.style.marginTop = `${rect.top - marginTop - contentTop}px`
      first = false
    }
    content.appendChild(block.cloneNode(true))
  }

  content.querySelectorAll(EDITOR_ONLY_SELECTORS).forEach((node) => node.remove())

  // Clip to the content area so blocks continuing from the previous page stay out of the margins
  const clip = document.createElement('div')

  clip.style.height = `${layout.contentHeight}px`
  clip.style.overflow = 'hidden'
  clip.appendChild(content)
  target.replaceChildren(clip)
}

export const PageThumbnails = memo(function PageThumbnails ({ editor, pageSettings }: PageThumbnailsProps) {
  const layout = usePageLayout(pageSettings)
  const pageCount = usePageCount(editor)
  const [activePage, setActivePage] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const targetsRef = useRef<(HTMLDivElement | null)[]>([])
  const visibleRef = useRef(new Set<number>())
  const drawnVersionRef = useRef<number[]>([])
  const versionRef = useRef(0)
  const scale = THUMBNAIL_WIDTH / layout.pageWidth

  // Draw the visible thumbnails that are out of date
  const drawVisible = useCallback(() => {
    for (const index of visibleRef.current) {
      const target = targetsRef.current[index]

      if (target && drawnVersionRef.current[index] !== versionRef.current) {
        drawPage(target, editor, index, layout)
        drawnVersionRef.current[index] = versionRef.current
      }
    }
  }, [editor, layout])

  // Mark every thumbnail stale after edits, then redraw once typing pauses
  useEffect(() => {
    let timer = 0
    const invalidate = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        versionRef.current++
        scheduleIdle(drawVisible)
      }, REFRESH_DELAY_MS)
    }

    invalidate()
    editor.on('transaction', invalidate)
    return () => {
      window.clearTimeout(timer)
      editor.off('transaction', invalidate)
    }
  }, [editor, drawVisible, pageCount])

  // Only thumbnails near the visible part of the list are drawn
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const index = Number((entry.target as HTMLElement).dataset.index)

        if (entry.isIntersecting) visibleRef.current.add(index)
        else visibleRef.current.delete(index)
      }
      drawVisible()
    }, { root: listRef.current, rootMargin: '300px 0px' })

    targetsRef.current.slice(0, pageCount).forEach((target) => {
      if (target?.parentElement) observer.observe(target.parentElement)
    })
    return () => observer.disconnect()
  }, [pageCount, drawVisible])

  // Highlight the page in view while the document scrolls
  useEffect(() => {
    const container = editor.view.dom.closest('.editor-scroll-container')
    const page = editor.view.dom.closest('.document-page')

    if (!container || !page) return

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const middle = container.getBoundingClientRect().top + container.clientHeight / 2
        const index = Math.floor((middle - page.getBoundingClientRect().top) / layout.pitch)

        setActivePage(Math.min(Math.max(index, 0), pageCount - 1))
      })
    }

    onScroll()
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      container.removeEventListener('scroll', onScroll)
    }
  }, [editor, layout, pageCount])

  // Keep the active thumbnail in view
  useEffect(() => {
    targetsRef.current[activePage]?.parentElement?.scrollIntoView({ block: 'nearest' })
  }, [activePage])

  const goToPage = (index: number) => {
    const container = editor.view.dom.closest('.editor-scroll-container')
    const page = editor.view.dom.closest('.document-page')

    if (!container || !page) return

    const offset = page.getBoundingClientRect().top - container.getBoundingClientRect().top

    container.scrollTo({ top: container.scrollTop + offset + index * layout.pitch - 16, behavior: 'smooth' })
  }

  return (
    <nav
      ref={listRef}
      aria-label='Danh sách trang'
      className='hidden lg:flex flex-col items-center gap-5 w-44 shrink-0 overflow-y-auto border-r border-gray-300 bg-gray-100 py-6'
    >
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={index}
          type='button'
          onClick={() => goToPage(index)}
          className='flex flex-col items-center gap-2 group rounded outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-4'
          aria-label={`Trang ${index + 1}`}
          aria-current={index === activePage ? 'page' : undefined}
        >
          <div
            data-index={index}
            className={`relative overflow-hidden bg-white shadow-sm transition-shadow ${
              index === activePage ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-300 group-hover:ring-gray-400'
            }`}
            style={{ width: THUMBNAIL_WIDTH, height: layout.pageHeight * scale }}
          >
            <div
              ref={(el) => { targetsRef.current[index] = el }}
              className='absolute top-0 left-0 origin-top-left pointer-events-none select-none'
              style={{
                width: layout.pageWidth,
                height: layout.pageHeight,
                transform: `scale(${scale})`,
                paddingTop: `${pageSettings.topMargin}mm`,
                paddingLeft: `${pageSettings.leftMargin}mm`,
                paddingRight: `${pageSettings.rightMargin}mm`
              }}
              aria-hidden
            />
          </div>
          <span className={`text-xs ${index === activePage ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            {index + 1}
          </span>
        </button>
      ))}
    </nav>
  )
})
