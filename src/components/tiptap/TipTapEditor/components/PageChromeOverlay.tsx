import { memo } from 'react'
import type { MouseEvent } from 'react'
import type * as Y from 'yjs'
import type { PageSettings } from '../types'
import type { PageLayoutPx } from '../hooks/usePageLayout'
import { usePageChrome } from '../hooks/usePageChrome'
import { pageLabel } from '@/lib/page-chrome'
import { t } from '@/i18n'

interface PageChromeOverlayProps {
  ydoc: Y.Doc
  pageCount: number
  layout: PageLayoutPx
  pageSettings: PageSettings
}

const LINE_HEIGHT = 20

// Clicks here must not reach the page, which would move the focus into the editor
const keepFocus = (event: MouseEvent) => event.stopPropagation()

/**
 * Header and footer in the top and bottom margin of every page, like Word.
 * The text is the same on all pages: editing it on one page updates the others.
 */
export const PageChromeOverlay = memo(function PageChromeOverlay ({
  ydoc,
  pageCount,
  layout,
  pageSettings
}: PageChromeOverlayProps) {
  const [chrome, setChrome] = usePageChrome(ydoc)
  const side = { left: `${pageSettings.leftMargin}mm`, right: `${pageSettings.rightMargin}mm` }

  return (
    <div className='pointer-events-none absolute inset-0' aria-hidden={false}>
      {Array.from({ length: pageCount }, (_, index) => {
        const pageTop = index * layout.pitch
        const headerTop = pageTop + Math.max((layout.marginTop - LINE_HEIGHT) / 2, 2)
        const footerTop = pageTop + layout.pageHeight - layout.marginBottom
          + Math.max((layout.marginBottom - LINE_HEIGHT) / 2, 2)

        return (
          <div key={index}>
            <input
              className='page-chrome-input pointer-events-auto absolute'
              style={{ ...side, top: headerTop, height: LINE_HEIGHT }}
              value={chrome.header}
              onChange={(event) => setChrome('header', event.target.value)}
              onClick={keepFocus}
              placeholder={t('chrome.header')}
              aria-label={t('chrome.header')}
            />
            <div className='absolute flex items-center gap-4' style={{ ...side, top: footerTop, height: LINE_HEIGHT }}>
              <input
                className='page-chrome-input pointer-events-auto relative flex-1'
                style={{ height: LINE_HEIGHT }}
                value={chrome.footer}
                onChange={(event) => setChrome('footer', event.target.value)}
                onClick={keepFocus}
                placeholder={t('chrome.footer')}
                aria-label={t('chrome.footer')}
              />
              <span className='shrink-0 select-none text-[8pt] text-gray-500'>{pageLabel(index + 1, pageCount)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
