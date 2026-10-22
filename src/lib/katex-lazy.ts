/**
 * Lazy KaTeX: `katex` is aliased to this module (see vite.config.ts), so the ~260 KB library
 * is only downloaded when a document actually contains math.
 *
 * Until KaTeX has loaded, formulas show their LaTeX source; they are rendered as soon as it arrives.
 */
import type { KatexOptions } from 'katex'

type Katex = typeof import('katex').default

let katex: Katex | null = null
let loading: Promise<Katex> | null = null

function load (): Promise<Katex> {
  // A path the alias does not match, so this imports the real library
  loading ??= import('katex/dist/katex.mjs').then((module) => {
    katex = module.default as Katex
    return katex
  })
  return loading
}

function render (expression: string, element: HTMLElement, options?: KatexOptions): void {
  if (katex) {
    katex.render(expression, element, options)
    return
  }

  element.textContent = expression
  load().then((loaded) => {
    // The node may have been re-rendered or removed meanwhile
    if (element.isConnected && element.textContent === expression) {
      loaded.render(expression, element, options)
    }
  })
}

function renderToString (expression: string, options?: KatexOptions): string {
  if (katex) return katex.renderToString(expression, options)
  load()
  return expression
}

export default { render, renderToString }
