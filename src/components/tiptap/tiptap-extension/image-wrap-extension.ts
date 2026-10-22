import { Image } from '@tiptap/extension-image'
import type { NodeView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * Image with text wrapping, like "Wrap text" in Google Docs / Word.
 *
 * - none:  the image sits on its own line
 * - left:  the image floats left, text flows on its right
 * - right: the image floats right, text flows on its left
 */
export type ImageWrap = 'none' | 'left' | 'right'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWrap: {
      setImageWrap: (wrap: ImageWrap) => ReturnType
    }
  }
}

const WRAP_MARGIN: Record<ImageWrap, string> = {
  none: '',
  left: '4px 16px 8px 0',
  right: '4px 0 8px 16px'
}

function wrapStyle (wrap: ImageWrap): string {
  return wrap === 'none' ? '' : `float: ${wrap}; margin: ${WRAP_MARGIN[wrap]};`
}

function applyWrap (element: HTMLElement, wrap: ImageWrap) {
  element.style.float = wrap === 'none' ? '' : wrap
  element.style.margin = WRAP_MARGIN[wrap]
  element.dataset.wrap = wrap

  // renderHTML also puts the float on the <img>; inside the container it would double the margin
  const img = element.querySelector('img')

  img?.style.removeProperty('float')
  img?.style.removeProperty('margin')
}

export const ImageWrapExtension = Image.extend({
  addAttributes () {
    return {
      ...this.parent?.(),
      wrap: {
        default: 'none',
        parseHTML: (element) => {
          const wrap = element.getAttribute('data-wrap') ?? element.style.float

          return wrap === 'left' || wrap === 'right' ? wrap : 'none'
        },
        renderHTML: (attributes) => {
          const wrap = attributes.wrap as ImageWrap

          return wrap === 'none' ? {} : { 'data-wrap': wrap, style: wrapStyle(wrap) }
        }
      }
    }
  },

  addCommands () {
    return {
      ...this.parent?.(),
      setImageWrap:
        (wrap: ImageWrap) =>
          ({ commands }) => commands.updateAttributes(this.name, { wrap })
    }
  },

  // The resizable node view wraps the <img> in a container: float the container,
  // and re-apply the wrap when the attribute changes (the base view ignores updates)
  addNodeView () {
    const createView = this.parent?.()

    if (!createView) return null

    return (props) => {
      const view = createView(props) as NodeView & { dom: HTMLElement }
      const baseUpdate = view.update?.bind(view)

      applyWrap(view.dom, props.node.attrs.wrap)
      view.update = (node: PMNode, decorations, innerDecorations) => {
        const handled = baseUpdate ? baseUpdate(node, decorations, innerDecorations) : node.type === props.node.type

        if (handled) applyWrap(view.dom, node.attrs.wrap)
        return handled
      }

      return view
    }
  }
})
