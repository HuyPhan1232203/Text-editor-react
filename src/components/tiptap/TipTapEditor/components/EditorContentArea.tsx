import { TableCellToolbar } from '@/components/tiptap/tableTiptap/TableCellToolbar'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import TextBubbleToolbar from './TextBubbleToolbar'
import ImageBubbleToolbar from './ImageBubbleToolbar'
import LinkBubbleMenu from './LinkBubbleMenu'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { PageSettings } from '../types'
import { PAGE_GAP_PX } from '../constants'
import { usePageCount, usePageLayout } from '../hooks/usePageLayout'
import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { GripVertical } from 'lucide-react'
import { t } from '@/i18n'
import type * as Y from 'yjs'
import { PageChromeOverlay } from './PageChromeOverlay'
import { CommentsPanel } from './CommentsPanel'
import { MAX_ZOOM } from '../hooks/useZoom'
import type { Zoom } from '../hooks/useZoom'

export interface EditorContentAreaProps {
  editor: Editor
  ydoc: Y.Doc
  pageSettings: PageSettings
  zoom: Zoom
  onZoomChange: (zoom: Zoom) => void
  // Reports the scale in use (also for 'fit'), for the zoom control
  onScaleChange: (scale: number) => void
}

// Horizontal padding of the scroll area (p-8), left out when fitting the page to the width
const SCROLL_PADDING_X = 48
const FIT_MIN_SCALE = 0.25

export const EditorContentArea = memo(function EditorContentArea ({
  editor,
  ydoc,
  pageSettings,
  zoom,
  onZoomChange,
  onScaleChange
}: EditorContentAreaProps) {
  // A click in the page margins puts the cursor on the nearest line, like Word, instead of
  // jumping to the end of the document. Clicks in the text itself are handled by the editor.
  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    if (!editor || editor.view.dom.contains(event.target as Node)) return
    // Header, footer, comments and other controls keep their own clicks
    if ((event.target as HTMLElement).closest('input, textarea, button, select, a, [role="button"]')) return

    const box = editor.view.dom.getBoundingClientRect()
    const coords = {
      left: Math.min(Math.max(event.clientX, box.left + 1), box.right - 1),
      top: Math.min(Math.max(event.clientY, box.top + 1), box.bottom - 1)
    }
    const hit = editor.view.posAtCoords(coords)

    if (hit) editor.chain().setTextSelection(hit.pos).focus(undefined, { scrollIntoView: false }).run()
    else editor.commands.focus(undefined, { scrollIntoView: false })
  }, [editor])

  const layout = usePageLayout(pageSettings)
  const pageCount = usePageCount(editor)

  useEffect(() => {
    editor?.commands.setPageLayout({
      contentHeight: layout.contentHeight,
      marginTop: layout.marginTop,
      marginBottom: layout.marginBottom,
      gap: PAGE_GAP_PX
    })
  }, [editor, layout])

  // Zoom scales the page with a CSS transform; the sizer around it takes the scaled size, so the
  // scroll area and centering follow the zoom
  const scrollRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sizerRef = useRef<HTMLDivElement>(null)
  // Menus are attached to the sizer, outside the zoomed page
  const menuParent = useCallback(() => sizerRef.current ?? document.body, [])
  const [size, setSize] = useState({ width: 0, height: 0, available: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const scroller = scrollRef.current

    if (!wrapper || !scroller) return

    const update = () => setSize((previous) => {
      const next = {
        width: wrapper.offsetWidth,
        height: wrapper.offsetHeight,
        available: scroller.clientWidth - SCROLL_PADDING_X
      }
      const same = previous.width === next.width && previous.height === next.height
        && previous.available === next.available

      return same ? previous : next
    })
    const observer = new ResizeObserver(update)

    observer.observe(wrapper)
    observer.observe(scroller)
    update()
    return () => observer.disconnect()
  }, [editor])

  const scale = zoom === 'fit'
    // Fit may go below the typed minimum, so a page fits a phone screen
    ? Math.min(Math.max(size.width ? size.available / size.width : 1, FIT_MIN_SCALE), MAX_ZOOM / 100)
    : zoom / 100

  useEffect(() => onScaleChange(scale), [scale, onScaleChange])

  // The drag handle extension always attaches its element inside the page; move it out of the
  // zoomed page so the handle keeps its size and is placed next to the block on screen
  useEffect(() => {
    const host = editor?.view.dom.parentElement
    const sizer = sizerRef.current

    if (!host || !sizer) return

    const move = () => {
      const handle = host.querySelector(':scope > div:has(> .drag-handle)')

      if (handle) sizer.appendChild(handle)
    }
    // The extension may attach it after this effect; only direct children are watched
    const observer = new MutationObserver(move)

    move()
    observer.observe(host, { childList: true })
    return () => observer.disconnect()
  }, [editor])

  // Ctrl/Cmd + mouse wheel and trackpad pinch zoom the page instead of the browser
  useEffect(() => {
    const scroller = scrollRef.current

    if (!scroller) return

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      // About 20% per mouse wheel notch (deltaY ≈ 100), finer for trackpad pinches
      onZoomChange(scale * 100 * Math.exp(-event.deltaY * 0.002))
    }

    scroller.addEventListener('wheel', onWheel, { passive: false })
    return () => scroller.removeEventListener('wheel', onWheel)
  }, [scale, onZoomChange])

  if (!editor) return null

  return (
    <div ref={scrollRef} className='editor-scroll-container flex-1 overflow-auto bg-[#ECEEF1] px-6 pb-14 pt-10'>
      <div
        ref={sizerRef}
        className='relative mx-auto'
        style={{ width: size.width * scale || undefined, height: size.height * scale || undefined }}
      >
        {/* Menus and the drag handle stay outside the zoomed page, so they keep their size;
            they are positioned next to the (zoomed) text on screen */}
        <TextBubbleToolbar editor={editor} appendTo={menuParent} />
        <ImageBubbleToolbar editor={editor} appendTo={menuParent} />
        <LinkBubbleMenu editor={editor} appendTo={menuParent} />
        <TableCellToolbar editor={editor} appendTo={menuParent} />
        <DragHandle editor={editor}>
          <div className='drag-handle-grip' title={t('editor.dragHandle')} aria-label={t('editor.dragHandle')}>
            <GripVertical className='h-4 w-4' />
          </div>
        </DragHandle>
        <div
          ref={wrapperRef}
          onClick={handleContainerClick}
          className='page-wrapper absolute left-0 top-0 w-max'
          style={{ transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: '0 0' }}
        >
          <div
            className='document-page relative bg-white' style={{
              width: pageSettings.orientation === 'portrait' ? '210mm' : '297mm',
              minHeight: `${pageCount * layout.pitch - PAGE_GAP_PX}px`,
              paddingTop: `${pageSettings.topMargin}mm`,
              paddingBottom: `${pageSettings.bottomMargin}mm`,
              paddingLeft: `${pageSettings.leftMargin}mm`,
              paddingRight: `${pageSettings.rightMargin}mm`
            }}
          >
            <EditorContent editor={editor} />
            <PageChromeOverlay ydoc={ydoc} pageCount={pageCount} layout={layout} pageSettings={pageSettings} />
          </div>
          <CommentsPanel editor={editor} ydoc={ydoc} />
        </div>
      </div>
    </div>
  )
})
