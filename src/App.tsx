import { lazy } from 'react'

const TiptapEditor = lazy(() => import('./components/tiptap/TipTapEditor'))

const App = () => {
  return (
    // <Suspense
    //   fallback={
    //     <div className='flex items-center justify-center h-screen bg-gray-200'>
    //       <div className='text-center'>
    //         <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4' />
    //         <p className='text-gray-700 font-medium'>Loading Editor...</p>
    //       </div>
    //     </div>
    //   }
    // >
    <TiptapEditor />
    // </Suspense>
  )
}

export default App
