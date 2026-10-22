// utils/printPDF.ts - Export PDF without a backend, using the browser's print dialog
import { Editor } from '@tiptap/react'
import { inlineStyles } from './inlineStyles'

interface PrintPdfOptions {
  title?: string
  // Margins in px, same as exportToPdf
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  orientation: 'landscape' | 'portrait'
}

// Editor-only UI that must not appear in the printed document
const EDITOR_ONLY_SELECTORS = [
  '.column-resize-handle',
  '.collaboration-caret',
  '.page-break-spacer',
  '[data-table-control]',
  '[data-resize-handle]',
  '.ProseMirror-gapcursor',
  '.ProseMirror-separator',
  '.ProseMirror-trailingBreak'
].join(',')

/**
 * Print only the document (not the toolbar) through a hidden iframe.
 * The browser's print dialog lets the user "Save as PDF".
 * Uses the rendered DOM so node views such as KaTeX math keep their output.
 */
export async function printToPdf (editor: Editor, options: PrintPdfOptions): Promise<void> {
  const {
    title = 'document',
    topMargin,
    bottomMargin,
    leftMargin,
    rightMargin,
    orientation
  } = options

  const content = editor.view.dom.cloneNode(true) as HTMLElement

  content.removeAttribute('contenteditable')
  // Keep the editor's page breaks in the PDF: the block after each spacer starts a new page
  content.querySelectorAll('.page-break-spacer').forEach((spacer) => {
    const next = spacer.nextElementSibling as HTMLElement | null

    if (next) next.style.breakBefore = 'page'
  })
  content.querySelectorAll(EDITOR_ONLY_SELECTORS).forEach((node) => node.remove())

  // App styles (fonts, KaTeX, editor classes) first, so the print styles from inlineStyles win
  const appStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('')

  const pageStyle = `<style>
    @page {
      size: A4 ${orientation};
      margin: ${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px;
    }
    html, body { background: #fff; }
  </style>`

  const html = inlineStyles(content.outerHTML)
    .replace('<head>', `<head><title>${title}</title>${appStyles}`)
    .replace('</head>', `${pageStyle}</head>`)

  const iframe = document.createElement('iframe')

  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)

  const frameWindow = iframe.contentWindow
  const frameDocument = iframe.contentDocument

  if (!frameWindow || !frameDocument) {
    iframe.remove()
    throw new Error('Cannot open print frame')
  }

  const loaded = new Promise<void>((resolve) => {
    iframe.addEventListener('load', () => resolve(), { once: true })
  })

  frameDocument.open()
  frameDocument.write(html)
  frameDocument.close()

  // Wait for stylesheets, images and fonts so the PDF matches the screen
  await loaded
  await frameDocument.fonts.ready

  // Chrome names the PDF after the top-level document title
  const previousTitle = document.title

  document.title = title

  const cleanup = () => {
    document.title = previousTitle
    iframe.remove()
  }

  frameWindow.addEventListener('afterprint', cleanup, { once: true })
  frameWindow.focus()
  frameWindow.print()
}
