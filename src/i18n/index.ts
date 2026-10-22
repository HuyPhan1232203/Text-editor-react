/**
 * Minimal i18n: English by default, Vietnamese for Vietnamese browsers or when chosen.
 * Switching language reloads the page, so plain `t()` calls (also outside React,
 * e.g. in node views and alerts) always use the current language.
 */

const en = {
  // Toolbar
  'toolbar.bold': 'Bold (Ctrl+B)',
  'toolbar.italic': 'Italic (Ctrl+I)',
  'toolbar.underline': 'Underline (Ctrl+U)',
  'toolbar.strike': 'Strikethrough',
  'toolbar.link': 'Insert link',
  'toolbar.linkPrompt': 'URL:',
  'toolbar.undo': 'Undo (Ctrl+Z)',
  'toolbar.redo': 'Redo (Ctrl+Y)',
  'toolbar.bulletList': 'Bulleted list',
  'toolbar.orderedList': 'Numbered list',
  'toolbar.taskList': 'Checklist',
  'toolbar.blockquote': 'Quote',
  'toolbar.inlineMath': 'Insert inline formula',
  'toolbar.blockMath': 'Insert block formula',
  'toolbar.inlineMathPrompt': 'Inline LaTeX formula (e.g. x^2 + y^2 = z^2):',
  'toolbar.blockMathPrompt': 'Block LaTeX formula (e.g. \\frac{a}{b}):',
  'toolbar.image': 'Insert image',
  'toolbar.table': 'Insert table',
  'toolbar.emoji': 'Insert emoji',
  'toolbar.textStyle': 'Text style',
  'toolbar.textStyleLabel': 'Text style: {style}',
  'toolbar.font': 'Font',
  'toolbar.fontDefault': 'Default',
  'toolbar.fontSize': 'Font size',
  'toolbar.fontSizeCustom': 'Custom (e.g. 22pt)',
  'toolbar.lineHeight': 'Line spacing',
  'toolbar.lineHeightDefault': 'Default',
  'toolbar.lineHeightCustom': 'Custom (e.g. 1.8)',
  'toolbar.textColor': 'Text color',
  'toolbar.presetColors': 'Preset colors',
  'toolbar.customColor': 'Custom color',
  'toolbar.alignLeft': 'Align left',
  'toolbar.alignCenter': 'Center',
  'toolbar.alignRight': 'Align right',
  'toolbar.alignJustify': 'Justify',
  'toolbar.highlightYellow': 'Yellow highlight',
  'toolbar.highlightGreen': 'Green highlight',
  'toolbar.highlightBlue': 'Blue highlight',
  'toolbar.highlightPink': 'Pink highlight',
  'toolbar.highlightOrange': 'Orange highlight',

  // Colors
  'color.black': 'Black',
  'color.darkGray': 'Dark gray',
  'color.gray': 'Gray',
  'color.red': 'Red',
  'color.orange': 'Orange',
  'color.yellow': 'Yellow',
  'color.green': 'Green',
  'color.blue': 'Blue',
  'color.purple': 'Purple',
  'color.pink': 'Pink',

  // Emoji picker
  'emoji.search': 'Search emoji…',
  'emoji.notFound': 'No emoji found',
  'emoji.loading': 'Loading emoji…',
  'emoji.loadFailed': 'Could not load emoji',

  // PDF export
  'export.button': 'Export PDF',
  'export.title': 'Export to PDF',
  'export.failed': 'PDF export failed: {error}',

  // Images
  'image.inline': 'Image on its own line',
  'image.wrapLeft': 'Image on the left, text wraps around',
  'image.wrapRight': 'Image on the right, text wraps around',
  'image.delete': 'Delete image',
  'image.tooLarge': 'Image "{name}" is larger than {size}MB',

  // Tables
  'table.merge': 'Merge cells',
  'table.mergeHint': 'Select several cells to merge',
  'table.split': 'Split cell',
  'table.splitHint': 'Only merged cells can be split',
  'table.rowAbove': 'Insert row above',
  'table.rowBelow': 'Insert row below',
  'table.deleteRow': 'Delete row',
  'table.columnLeft': 'Insert column left',
  'table.columnRight': 'Insert column right',
  'table.deleteColumn': 'Delete column',
  'table.toggleHeader': 'Toggle header cell',
  'table.background': 'Cell background',
  'table.backgroundColor': 'Background {color}',
  'table.noBackground': 'No color',
  'table.alignTop': 'Align top',
  'table.alignMiddle': 'Align middle',
  'table.alignBottom': 'Align bottom',
  'table.delete': 'Delete table',
  'table.hideBorders': 'Hide table borders',
  'table.showBorders': 'Show table borders',

  // Page setup
  'page.setup': 'Page setup',
  'page.setupTitle': 'A4 page setup',
  'page.orientation': 'Orientation',
  'page.portrait': 'Portrait',
  'page.landscape': 'Landscape',
  'page.marginPresets': 'Margins (presets)',
  'page.presetPlaceholder': 'Choose a margin preset',
  'page.presetDefault': 'Default',
  'page.presetNarrow': 'Narrow',
  'page.presetNormal': 'Moderate',
  'page.presetWide': 'Wide',
  'page.quickAdjust': 'Quick adjust (all margins): {mm}mm',
  'page.customMargins': 'Custom margins',
  'page.hideDetails': 'Hide details',
  'page.marginTop': 'Top (mm)',
  'page.marginBottom': 'Bottom (mm)',
  'page.marginLeft': 'Left (mm)',
  'page.marginRight': 'Right (mm)',
  'page.reset': 'Reset to default',
  'page.cancel': 'Cancel',
  'page.save': 'Save',
  'page.summary': 'Margins: top {top}mm · bottom {bottom}mm · left {left}mm · right {right}mm · {orientation}',
  'page.list': 'Pages',
  'page.number': 'Page {n}',

  // Editor
  'editor.placeholder': "Type '/' for commands…",
  'editor.dragHandle': 'Drag to move this block',
  'toolbar.subscript': 'Subscript',
  'toolbar.superscript': 'Superscript',
  'toolbar.codeBlock': 'Code block',
  'toolbar.youtube': 'Embed YouTube video',

  // Slash menu
  'slash.menu': 'Insert block',
  'slash.empty': 'No matching blocks',
  'slash.text': 'Text',
  'slash.textHint': 'Plain paragraph',
  'slash.heading1': 'Heading 1',
  'slash.heading1Hint': 'Big section heading',
  'slash.heading2': 'Heading 2',
  'slash.heading2Hint': 'Medium section heading',
  'slash.heading3': 'Heading 3',
  'slash.heading3Hint': 'Small section heading',
  'slash.bulletList': 'Bulleted list',
  'slash.bulletListHint': 'A simple bulleted list',
  'slash.orderedList': 'Numbered list',
  'slash.orderedListHint': 'A list with numbers',
  'slash.taskList': 'Checklist',
  'slash.taskListHint': 'Track tasks with checkboxes',
  'slash.quote': 'Quote',
  'slash.quoteHint': 'Capture a quote',
  'slash.codeBlock': 'Code block',
  'slash.codeBlockHint': 'Code with syntax highlighting',
  'slash.table': 'Table',
  'slash.tableHint': '3 × 3 table with a header row',
  'slash.image': 'Image',
  'slash.imageHint': 'Upload or drop an image',
  'slash.math': 'Formula',
  'slash.mathHint': 'LaTeX math block',
  'slash.divider': 'Divider',
  'slash.dividerHint': 'Horizontal line',
  'slash.youtube': 'YouTube',
  'slash.youtubeHint': 'Embed a video',
  'slash.youtubePrompt': 'YouTube URL:',

  // Find & replace
  'search.find': 'Find',
  'search.replace': 'Replace with',
  'search.replaceOne': 'Replace',
  'search.replaceAll': 'Replace all',
  'search.noResults': 'No results',
  'search.previous': 'Previous match (Shift+Enter)',
  'search.next': 'Next match (Enter)',
  'search.caseSensitive': 'Match case',
  'search.toggleReplace': 'Toggle replace',
  'search.close': 'Close (Esc)',

  // Sidebar and status bar
  'sidebar.pages': 'Pages',
  'sidebar.outline': 'Outline',
  'outline.empty': 'Headings you add to the document appear here.',
  'status.page': 'Page {n} of {total}',
  'status.word': '1 word',
  'status.words': '{n} words',
  'status.characters': '{n} characters',

  // Language
  'language.switch': 'Tiếng Việt',
  'language.switchTitle': 'Chuyển sang tiếng Việt'
}

export type MessageKey = keyof typeof en

const vi: Record<MessageKey, string> = {
  'toolbar.bold': 'In đậm (Ctrl+B)',
  'toolbar.italic': 'In nghiêng (Ctrl+I)',
  'toolbar.underline': 'Gạch chân (Ctrl+U)',
  'toolbar.strike': 'Gạch ngang',
  'toolbar.link': 'Thêm liên kết',
  'toolbar.linkPrompt': 'URL:',
  'toolbar.undo': 'Hoàn tác (Ctrl+Z)',
  'toolbar.redo': 'Làm lại (Ctrl+Y)',
  'toolbar.bulletList': 'Danh sách dấu chấm',
  'toolbar.orderedList': 'Danh sách đánh số',
  'toolbar.taskList': 'Danh sách việc cần làm (checklist)',
  'toolbar.blockquote': 'Trích dẫn',
  'toolbar.inlineMath': 'Chèn công thức toán học inline',
  'toolbar.blockMath': 'Chèn công thức toán học block',
  'toolbar.inlineMathPrompt': 'Nhập công thức LaTeX inline (ví dụ: x^2 + y^2 = z^2):',
  'toolbar.blockMathPrompt': 'Nhập công thức LaTeX block (ví dụ: \\frac{a}{b}):',
  'toolbar.image': 'Chèn hình ảnh',
  'toolbar.table': 'Chèn bảng',
  'toolbar.emoji': 'Chèn emoji',
  'toolbar.textStyle': 'Chọn kiểu văn bản',
  'toolbar.textStyleLabel': 'Kiểu văn bản: {style}',
  'toolbar.font': 'Font chữ',
  'toolbar.fontDefault': 'Mặc định',
  'toolbar.fontSize': 'Cỡ chữ',
  'toolbar.fontSizeCustom': 'Tùy chỉnh (vd: 22pt)',
  'toolbar.lineHeight': 'Khoảng cách dòng',
  'toolbar.lineHeightDefault': 'Mặc định',
  'toolbar.lineHeightCustom': 'Tùy chỉnh (vd: 1.8)',
  'toolbar.textColor': 'Màu chữ',
  'toolbar.presetColors': 'Màu sẵn có',
  'toolbar.customColor': 'Màu tùy chỉnh',
  'toolbar.alignLeft': 'Căn trái',
  'toolbar.alignCenter': 'Căn giữa',
  'toolbar.alignRight': 'Căn phải',
  'toolbar.alignJustify': 'Căn đều',
  'toolbar.highlightYellow': 'Highlight màu vàng',
  'toolbar.highlightGreen': 'Highlight màu xanh lá',
  'toolbar.highlightBlue': 'Highlight màu xanh dương',
  'toolbar.highlightPink': 'Highlight màu hồng',
  'toolbar.highlightOrange': 'Highlight màu cam',

  'color.black': 'Đen',
  'color.darkGray': 'Xám đậm',
  'color.gray': 'Xám',
  'color.red': 'Đỏ',
  'color.orange': 'Cam',
  'color.yellow': 'Vàng',
  'color.green': 'Xanh lá',
  'color.blue': 'Xanh dương',
  'color.purple': 'Tím',
  'color.pink': 'Hồng',

  'emoji.search': 'Tìm emoji…',
  'emoji.notFound': 'Không tìm thấy emoji',
  'emoji.loading': 'Đang tải emoji…',
  'emoji.loadFailed': 'Không tải được emoji',

  'export.button': 'Xuất PDF',
  'export.title': 'Xuất file PDF',
  'export.failed': 'Xuất PDF thất bại: {error}',

  'image.inline': 'Ảnh một dòng riêng',
  'image.wrapLeft': 'Ảnh bên trái, chữ bao quanh',
  'image.wrapRight': 'Ảnh bên phải, chữ bao quanh',
  'image.delete': 'Xoá ảnh',
  'image.tooLarge': 'Ảnh "{name}" vượt quá {size}MB',

  'table.merge': 'Gộp ô',
  'table.mergeHint': 'Chọn nhiều ô để gộp',
  'table.split': 'Tách ô',
  'table.splitHint': 'Chỉ có thể tách ô đã gộp',
  'table.rowAbove': 'Thêm hàng phía trên',
  'table.rowBelow': 'Thêm hàng phía dưới',
  'table.deleteRow': 'Xóa hàng',
  'table.columnLeft': 'Thêm cột bên trái',
  'table.columnRight': 'Thêm cột bên phải',
  'table.deleteColumn': 'Xóa cột',
  'table.toggleHeader': 'Bật/tắt ô tiêu đề',
  'table.background': 'Màu nền ô',
  'table.backgroundColor': 'Nền {color}',
  'table.noBackground': 'Không màu',
  'table.alignTop': 'Căn trên',
  'table.alignMiddle': 'Căn giữa theo chiều dọc',
  'table.alignBottom': 'Căn dưới',
  'table.delete': 'Xóa bảng',
  'table.hideBorders': 'Ẩn viền bảng',
  'table.showBorders': 'Hiện viền bảng',

  'page.setup': 'Cài đặt trang',
  'page.setupTitle': 'Cài đặt trang A4',
  'page.orientation': 'Hướng trang',
  'page.portrait': 'Dọc',
  'page.landscape': 'Ngang',
  'page.marginPresets': 'Lề (chọn nhanh)',
  'page.presetPlaceholder': 'Chọn preset lề',
  'page.presetDefault': 'Mặc định',
  'page.presetNarrow': 'Hẹp',
  'page.presetNormal': 'Vừa',
  'page.presetWide': 'Rộng',
  'page.quickAdjust': 'Tinh chỉnh nhanh (lề chung): {mm}mm',
  'page.customMargins': 'Tùy chỉnh chi tiết',
  'page.hideDetails': 'Ẩn chi tiết',
  'page.marginTop': 'Lề trên (mm)',
  'page.marginBottom': 'Lề dưới (mm)',
  'page.marginLeft': 'Lề trái (mm)',
  'page.marginRight': 'Lề phải (mm)',
  'page.reset': 'Đặt lại mặc định',
  'page.cancel': 'Hủy',
  'page.save': 'Lưu',
  'page.summary': 'Lề trên {top}mm · dưới {bottom}mm · trái {left}mm · phải {right}mm · {orientation}',
  'page.list': 'Danh sách trang',
  'page.number': 'Trang {n}',

  'editor.placeholder': "Gõ '/' để chèn nội dung…",
  'editor.dragHandle': 'Kéo để di chuyển khối này',
  'toolbar.subscript': 'Chỉ số dưới',
  'toolbar.superscript': 'Chỉ số trên',
  'toolbar.codeBlock': 'Khối code',
  'toolbar.youtube': 'Nhúng video YouTube',

  'slash.menu': 'Chèn khối',
  'slash.empty': 'Không có khối phù hợp',
  'slash.text': 'Văn bản',
  'slash.textHint': 'Đoạn văn thường',
  'slash.heading1': 'Tiêu đề 1',
  'slash.heading1Hint': 'Tiêu đề mục lớn',
  'slash.heading2': 'Tiêu đề 2',
  'slash.heading2Hint': 'Tiêu đề mục vừa',
  'slash.heading3': 'Tiêu đề 3',
  'slash.heading3Hint': 'Tiêu đề mục nhỏ',
  'slash.bulletList': 'Danh sách dấu chấm',
  'slash.bulletListHint': 'Danh sách đơn giản',
  'slash.orderedList': 'Danh sách đánh số',
  'slash.orderedListHint': 'Danh sách có số thứ tự',
  'slash.taskList': 'Checklist',
  'slash.taskListHint': 'Theo dõi việc cần làm',
  'slash.quote': 'Trích dẫn',
  'slash.quoteHint': 'Đoạn trích dẫn',
  'slash.codeBlock': 'Khối code',
  'slash.codeBlockHint': 'Code có tô màu cú pháp',
  'slash.table': 'Bảng',
  'slash.tableHint': 'Bảng 3 × 3 có hàng tiêu đề',
  'slash.image': 'Hình ảnh',
  'slash.imageHint': 'Tải lên hoặc kéo thả ảnh',
  'slash.math': 'Công thức',
  'slash.mathHint': 'Công thức toán LaTeX',
  'slash.divider': 'Đường kẻ',
  'slash.dividerHint': 'Đường kẻ ngang',
  'slash.youtube': 'YouTube',
  'slash.youtubeHint': 'Nhúng video',
  'slash.youtubePrompt': 'Link YouTube:',

  'search.find': 'Tìm',
  'search.replace': 'Thay bằng',
  'search.replaceOne': 'Thay',
  'search.replaceAll': 'Thay tất cả',
  'search.noResults': 'Không thấy',
  'search.previous': 'Kết quả trước (Shift+Enter)',
  'search.next': 'Kết quả sau (Enter)',
  'search.caseSensitive': 'Phân biệt hoa thường',
  'search.toggleReplace': 'Hiện/ẩn thay thế',
  'search.close': 'Đóng (Esc)',

  'sidebar.pages': 'Trang',
  'sidebar.outline': 'Mục lục',
  'outline.empty': 'Các tiêu đề trong tài liệu sẽ hiện ở đây.',
  'status.page': 'Trang {n}/{total}',
  'status.word': '1 từ',
  'status.words': '{n} từ',
  'status.characters': '{n} ký tự',

  'language.switch': 'English',
  'language.switchTitle': 'Switch to English'
}

export type Language = 'en' | 'vi'

const STORAGE_KEY = 'text-editor-react:lang'

function detectLanguage (): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved === 'en' || saved === 'vi') return saved
  } catch {
    // Storage unavailable: fall back to the browser language
  }
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

export const language: Language = detectLanguage()

const messages: Record<Language, Record<MessageKey, string>> = { en, vi }

/** Translated message, with `{name}` placeholders replaced by `vars` */
export function t (key: MessageKey, vars?: Record<string, string | number>): string {
  const message = messages[language][key]

  return vars ? message.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`)) : message
}

/** Saves the language and reloads, so every string (including non-React UI) switches */
export function setLanguage (next: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Without storage the choice only lasts until the reload
  }
  window.location.reload()
}

document.documentElement.lang = language
