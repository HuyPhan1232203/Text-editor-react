import { EditorContext } from '@tiptap/react'
import { useEditorConfig } from './hooks/useEditorConfig'
import { usePageSettings } from './hooks/usePageSettings'
import { EditorToolbar } from './components/EditorToolbar'
import { EditorContentArea } from './components/EditorContentArea'
import { EditorFooter } from './components/EditorFooter'
import { EditorSidebar } from './components/EditorSidebar'
import { SearchBar } from './components/SearchBar'
import 'katex/dist/katex.min.css'
import 'tiptap-a4-pagination/styles.css'

export default function TiptapEditor () {
  const { editor, ydoc } = useEditorConfig()
  const { pageSettings, setPageSettings } = usePageSettings()

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='flex flex-col h-screen bg-gray-200'>
        <EditorToolbar editor={editor} pageSettings={pageSettings} />
        <main className='relative flex flex-1 min-h-0'>
          <EditorSidebar editor={editor} pageSettings={pageSettings} />
          <EditorContentArea editor={editor} ydoc={ydoc} pageSettings={pageSettings} />
          <SearchBar editor={editor} />
        </main>
        <EditorFooter
          editor={editor}
          pageSettings={pageSettings}
          onSettingsChange={setPageSettings}
        />

      </div>
    </EditorContext.Provider>
  )
}
