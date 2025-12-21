import { EditorContext } from '@tiptap/react'
import { useEditorConfig } from './hooks/useEditorConfig'
import { useTableBorderManager } from './hooks/useTableBorderManager'
import { usePageSettings } from './hooks/usePageSettings'
import { EditorToolbar } from './components/EditorToolbar'
import { EditorContentArea } from './components/EditorContentArea'
import { EditorFooter } from './components/EditorFooter'

export default function TiptapEditor () {
  // 1. Tạo editor config trước (không cần pageSettings)
  const editor = useEditorConfig()

  // 2. Quản lý page settings và sync với editor
  const { pageSettings, setPageSettings } = usePageSettings(editor)

  // 3. Quản lý table borders
  useTableBorderManager(editor)

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='flex flex-col h-screen bg-gray-200'>
        <EditorToolbar editor={editor} pageSettings={pageSettings} />
        <EditorContentArea editor={editor} />
        <EditorFooter
          pageSettings={pageSettings}
          onSettingsChange={setPageSettings}
        />
      </div>
    </EditorContext.Provider>
  )
}
