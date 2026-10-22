import { InputRule, Node } from '@tiptap/core'
import { gitHubEmojis } from '@tiptap/extension-emoji'
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
        props: {
          transformPastedHTML: (html) => {
            if (!html.includes('data-type="emoji"')) return html

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
