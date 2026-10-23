import { EditorContext } from '@tiptap/react'
import { useEditorConfig } from './hooks/useEditorConfig'
import { usePageSettings } from './hooks/usePageSettings'
import { EditorToolbar } from './components/EditorToolbar'
import { EditorContentArea } from './components/EditorContentArea'
import { EditorFooter } from './components/EditorFooter'
import { EditorSidebar } from './components/EditorSidebar'
import { SearchBar } from './components/SearchBar'
import { RoomNotice } from './components/RoomNotice'
import { useRoomStatus } from './hooks/useRoomStatus'
import { useZoom } from './hooks/useZoom'
import { ZoomControl } from './components/ZoomControl'
import { useState } from 'react'
import 'katex/dist/katex.min.css'
import 'tiptap-a4-pagination/styles.css'

export default function TiptapEditor () {
  const { editor, ydoc, provider } = useEditorConfig()
  const room = useRoomStatus(provider)
  const { pageSettings, setPageSettings } = usePageSettings()
  const { zoom, setZoom } = useZoom()
  const [scale, setScale] = useState(1)

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='flex flex-col h-screen bg-gray-200'>
        <EditorToolbar
          editor={editor} pageSettings={pageSettings} ydoc={ydoc}
          provider={provider}
          room={room}
          zoomControl={<ZoomControl zoom={zoom} scale={scale} onZoomChange={setZoom} />}
        />
        <main className='relative flex flex-1 min-h-0'>
          <EditorSidebar editor={editor} pageSettings={pageSettings} />
          <EditorContentArea
            editor={editor}
            ydoc={ydoc}
            pageSettings={pageSettings}
            zoom={zoom}
            onZoomChange={setZoom}
            onScaleChange={setScale}
          />
          <SearchBar editor={editor} />
          <RoomNotice editor={editor} room={room} />
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
