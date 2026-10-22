import { InputRule, Node } from '@tiptap/core'
import { gitHubEmojis } from '@tiptap/extension-emoji'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * Emojis as plain text characters, like Google Docs: the system font draws them,
 * with no image fallback from a CDN and no non-editable emoji node.
 *
 * - typing `:shortcode:` (e.g. `:heart:`) inserts the emoji character
 * - emoji nodes from older documents or pasted TipTap HTML
 *   (<span data-type="emoji" data-name="...">) are turned into characters
 */

let shortcodeMap: Map<string, string> | null = null

function emojiForShortcode (shortcode: string): string | undefined {
  if (!shortcodeMap) {
    shortcodeMap = new Map()
    for (const item of gitHubEmojis) {
      if (!item.emoji) continue
      shortcodeMap.set(item.name, item.emoji)
      item.shortcodes.forEach((code) => shortcodeMap?.set(code, item.emoji as string))
    }
  }
  return shortcodeMap.get(shortcode)
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

  addInputRules () {
    return [
      new InputRule({
        find: /:([a-z0-9_+-]+):$/,
        handler: ({ range, match, chain }) => {
          const emoji = emojiForShortcode(match[1])

          if (!emoji) return null
          chain().insertContentAt(range, emoji).run()
        }
      })
    ]
  },

  addProseMirrorPlugins () {
    return [
      new Plugin({
        key: new PluginKey('emojiToText'),
        // Replace any legacy emoji node with its character
        appendTransaction: (transactions, _oldState, state) => {
          if (!transactions.some((tr) => tr.docChanged)) return null

          const emojis: { pos: number, size: number, text: string }[] = []

          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name) {
              emojis.push({ pos, size: node.nodeSize, text: emojiForShortcode(node.attrs.name) ?? `:${node.attrs.name}:` })
            }
          })
          if (emojis.length === 0) return null

          const tr = state.tr

          // From the end, so earlier positions stay valid
          emojis.reverse().forEach(({ pos, size, text }) => {
            tr.replaceWith(pos, pos + size, state.schema.text(text, state.doc.resolve(pos).marks()))
          })
          return tr.setMeta('addToHistory', false)
        }
      })
    ]
  }
})
