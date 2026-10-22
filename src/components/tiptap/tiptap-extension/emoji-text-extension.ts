import { InputRule, Node } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * Emojis as plain text characters, like Google Docs: the system font draws them,
 * with no image fallback from a CDN and no non-editable emoji node.
 *
 * - typing `:shortcode:` (e.g. `:heart:`) inserts the emoji character
 * - pasted TipTap emoji HTML (<span data-type="emoji" data-name="...">) becomes characters
 *   before parsing, so no extra transaction ends up in the undo history
 * - emoji nodes already in older documents still load, and render as characters
 */

// The emoji data (~1800 entries) is loaded in its own chunk the first time a ':' is typed
// or emoji HTML is pasted, so it is not downloaded with the page
let shortcodeMap: Map<string, string> | null = null
let loading: Promise<void> | null = null

function loadShortcodes (): Promise<void> {
  loading ??= import('@tiptap/extension-emoji').then(({ gitHubEmojis }) => {
    const map = new Map<string, string>()

    for (const item of gitHubEmojis) {
      if (!item.emoji) continue
      map.set(item.name, item.emoji)
      item.shortcodes.forEach((code) => map.set(code, item.emoji as string))
    }
    shortcodeMap = map
  })
  return loading
}

function emojiForShortcode (shortcode: string): string | undefined {
  return shortcodeMap?.get(shortcode)
}

// Converts a shortcode typed before the emoji data arrived, if it is still right before the cursor
function convertShortcodeBeforeCursor (editor: Editor, shortcode: string) {
  const emoji = emojiForShortcode(shortcode)

  if (!emoji || editor.isDestroyed) return

  const { $from, empty } = editor.state.selection
  const token = `:${shortcode}:`

  if (!empty || $from.parentOffset < token.length) return
  if ($from.parent.textBetween($from.parentOffset - token.length, $from.parentOffset) !== token) return

  editor.chain().insertContentAt({ from: $from.pos - token.length, to: $from.pos }, emoji).run()
}

export const EmojiText = Node.create({
  // Same name as the old emoji node, so existing documents still load
  name: 'emoji',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes () {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.dataset.name ?? null
      }
    }
  },

  parseHTML () {
    return [{ tag: 'span[data-type="emoji"]' }]
  },

  renderHTML ({ node }) {
    return ['span', {}, emojiForShortcode(node.attrs.name) ?? `:${node.attrs.name}:`]
  },

  // Legacy emoji nodes show their character once the (lazily loaded) emoji data has arrived
  addNodeView () {
    return ({ node }) => {
      const dom = document.createElement('span')
      const name = node.attrs.name as string
      const show = () => {
        dom.textContent = emojiForShortcode(name) ?? `:${name}:`
      }

      show()
      if (!shortcodeMap) loadShortcodes().then(show)

      return { dom }
    }
  },

  addInputRules () {
    return [
      new InputRule({
        find: /:([a-z0-9_+-]+):$/,
        handler: ({ range, match, chain }) => {
          const emoji = emojiForShortcode(match[1])

          if (!emoji) {
            // Data still loading: convert once it arrives (after the closing ':' is inserted)
            if (!shortcodeMap) {
              const { editor } = this

              loadShortcodes().then(() => convertShortcodeBeforeCursor(editor, match[1]))
            }
            return null
          }
          chain().insertContentAt(range, emoji).run()
        }
      })
    ]
  },

  addProseMirrorPlugins () {
    return [
      new Plugin({
        key: new PluginKey('emojiToText'),
        props: {
          handleTextInput: (_view, _from, _to, text) => {
            // Start loading the shortcode data as soon as a shortcode may be typed
            if (text === ':') loadShortcodes()
            return false
          },
          transformPastedHTML: (html) => {
            if (!html.includes('data-type="emoji"')) return html
            // Without the emoji data yet, keep the spans: they become emoji nodes,
            // which render their character as soon as the data has loaded
            if (!shortcodeMap) {
              loadShortcodes()
              return html
            }

            const doc = new DOMParser().parseFromString(html, 'text/html')

            doc.querySelectorAll('span[data-type="emoji"]').forEach((span) => {
              const name = span.getAttribute('data-name') ?? ''

              // Image-only emojis (e.g. :octocat:) have no character and empty text: keep the shortcode
              span.replaceWith(doc.createTextNode(emojiForShortcode(name) || span.textContent?.trim() || `:${name}:`))
            })
            return doc.body.innerHTML
          }
        }
      })
    ]
  }
})
