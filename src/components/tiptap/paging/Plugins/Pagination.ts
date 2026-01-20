/**
 * @file /src/Plugins/Pagination.ts
 * @name Pagination
 * @description Custom plugin for paginating the editor content.
 */

import { Editor } from '@tiptap/core'
import { Plugin, PluginKey, EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { buildPageView } from '../utils/buildPageView'
import { isNodeEmpty } from '../utils/nodes/node'
import { doesDocHavePageNodes } from '../utils/nodes/page/page'
import type { PaginationOptions } from '../PaginationExtension'

type PaginationPluginProps = {
  editor: Editor
  options: PaginationOptions
}

// Tạo PluginKey bên ngoài để có thể reference
const paginationPluginKey = new PluginKey('pagination')

const PaginationPlugin = ({ editor, options }: PaginationPluginProps) => {
  return new Plugin({
    key: paginationPluginKey,

    state: {
      init () {
        return {
          currentMargins: options.defaultMarginConfig
        }
      },
      apply (tr, value) {
        // Đọc margins từ transaction meta nếu có update
        const newMargins = tr.getMeta('updatePaginationMargins')

        if (newMargins) {
          return { currentMargins: newMargins }
        }
        return value
      }
    },

    view () {
      let isPaginating = false

      return {
        update (view: EditorView, prevState: EditorState) {
          if (isPaginating) return

          const { state } = view
          const { doc, schema } = state
          const pageType = schema.nodes.page

          if (!pageType) return

          const docChanged = !doc.eq(prevState.doc)
          const initialLoad = isNodeEmpty(prevState.doc) && !isNodeEmpty(doc)
          const hasPageNodes = doesDocHavePageNodes(state)

          if (!docChanged && hasPageNodes && !initialLoad) return

          isPaginating = true

          // Đọc margins từ plugin state sử dụng pluginKey
          const pluginState = paginationPluginKey.getState(state)
          const currentOptions = {
            ...options,
            defaultMarginConfig:
              pluginState?.currentMargins || options.defaultMarginConfig
          }

          buildPageView(editor, view, currentOptions)

          isPaginating = false
        }
      }
    }
  })
}

export default PaginationPlugin
