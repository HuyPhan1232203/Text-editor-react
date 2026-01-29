// extensions/PreserveMarksOnEnter.ts
import { Extension } from '@tiptap/core'

export const PreserveMarksOnEnter = Extension.create({
  name: 'preserveMarksOnEnter',

  addKeyboardShortcuts () {
    return {
      Enter: () => {
        const { state } = this.editor
        const { selection, storedMarks } = state
        const { $from } = selection

        // Kiểm tra xem cursor có đang trong list không
        // Nếu có, để list extension xử lý Enter để tạo bullet/order mới
        const isInList = $from.parent.type.name === 'paragraph'
          && $from.node(-1)?.type.name === 'listItem'

        if (isInList) {
          // Trả về false để cho list extension (ListItem) xử lý
          return false
        }

        // Lấy marks hiện tại từ vị trí cursor
        const marks = storedMarks || $from.marks()

        // Thực hiện splitBlock mặc định
        const result = this.editor.commands.splitBlock()

        // Sau khi split, set lại marks
        if (result && marks.length > 0) {
          // Đợi một tick để đảm bảo paragraph mới đã được tạo
          requestAnimationFrame(() => {
            this.editor.view.dispatch(
              this.editor.state.tr.setStoredMarks(marks)
            )
          })
        }

        return result
      }
    }
  },

  // Priority cao hơn để override default Enter behavior
  priority: 1000
})
