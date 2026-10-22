import { EditorContext } from '@tiptap/react'
import { useEditorConfig } from './hooks/useEditorConfig'
import { usePageSettings } from './hooks/usePageSettings'
import { EditorToolbar } from './components/EditorToolbar'
import { EditorContentArea } from './components/EditorContentArea'
import { EditorFooter } from './components/EditorFooter'
import { PageThumbnails } from './components/PageThumbnails'
import 'katex/dist/katex.min.css'

export default function TiptapEditor () {
  const editor = useEditorConfig()
  const { pageSettings, setPageSettings } = usePageSettings()

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='flex flex-col h-screen bg-gray-200'>
        <EditorToolbar editor={editor} pageSettings={pageSettings} />
        <div className='flex flex-1 min-h-0'>
          <PageThumbnails editor={editor} pageSettings={pageSettings} />
          <EditorContentArea editor={editor} pageSettings={pageSettings} />
        </div>
        <EditorFooter
          pageSettings={pageSettings}
          onSettingsChange={setPageSettings}
        />

      </div>
    </EditorContext.Provider>
  )
}
