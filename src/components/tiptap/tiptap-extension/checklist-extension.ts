import { Extension } from '@tiptap/core'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * Checklists (☐ / ☑), like the checklist in Google Docs.
 *
 * Google Docs copies checklist items as <li role="checkbox" aria-checked="true|false">,
 * sometimes with a checkbox <img> inside; these are pasted as task items here.
 */

const DOCS_CHECKLIST_ITEM = 'li[role="checkbox"], li[aria-checked]'

const ChecklistItem = TaskItem.extend({
  addAttributes () {
    return {
      ...this.parent?.(),
      checked: {
        default: false,
        keepOnSplit: false,
        // TipTap applies attribute parsers over rule attrs, so Docs' aria-checked is read here
        parseHTML: (element) => {
          const dataChecked = element.getAttribute('data-checked')

          return dataChecked === '' || dataChecked === 'true' || element.getAttribute('aria-checked') === 'true'
        },
        renderHTML: (attributes) => ({ 'data-checked': attributes.checked })
      }
    }
  },

  parseHTML () {
    return [
      ...(this.parent?.() ?? []),
      { tag: DOCS_CHECKLIST_ITEM, priority: 60 }
    ]
  }
}).configure({ nested: true })

const Checklist = TaskList.extend({
  parseHTML () {
    return [
      ...(this.parent?.() ?? []),
      {
        // A list whose items are Docs checklist items (higher priority than bullet/ordered lists)
        tag: 'ul, ol',
        priority: 60,
        getAttrs: (element) => (element.querySelector(`:scope > :is(${DOCS_CHECKLIST_ITEM})`) ? {} : false)
      }
    ]
  }
})

// Drop the checkbox images Google Docs puts inside checklist items; the task item draws its own checkbox
const StripDocsCheckboxImages = Extension.create({
  name: 'stripDocsCheckboxImages',

  addProseMirrorPlugins () {
    return [
      new Plugin({
        key: new PluginKey('stripDocsCheckboxImages'),
        props: {
          transformPastedHTML: (html) => {
            if (!html.includes('aria-checked')) return html

            const doc = new DOMParser().parseFromString(html, 'text/html')

            doc.querySelectorAll(DOCS_CHECKLIST_ITEM).forEach((item) => {
              // The marker is a checkbox-sized image placed before any text of the item;
              // images next to or after the text are user content and are kept
              const img = item.querySelector('img')
              const size = parseFloat(img?.getAttribute('width') ?? img?.style.width ?? '')

              if (!img || !(size > 0 && size <= 24)) return

              const before = doc.createRange()

              before.setStart(item, 0)
              before.setEndBefore(img)
              if (before.toString().trim() === '') img.remove()
            })

            return doc.body.innerHTML
          }
        }
      })
    ]
  }
})

export const ChecklistExtensions = [Checklist, ChecklistItem, StripDocsCheckboxImages]
