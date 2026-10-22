import { useState, useRef, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Smile } from 'lucide-react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import type { EmojiItem } from '@tiptap/extension-emoji'

interface EmojiButtonProps {
  editor: Editor
}

// Kiểm tra emoji có render đúng không
const isEmojiSupported = (emoji: string): boolean => {
  const canvas = document.createElement('canvas')

  canvas.width = 20
  canvas.height = 20

  const ctx = canvas.getContext('2d')

  if (!ctx) return false

  ctx.textBaseline = 'top'
  ctx.font = '16px Arial, sans-serif'
  ctx.fillText(emoji, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data

  // Đếm số pixel có màu
  let coloredPixels = 0

  for (let i = 0; i < imageData.length; i += 4) {
    const alpha = imageData[i + 3]

    if (alpha > 0) {
      coloredPixels++
    }
  }

  // Nếu có ít hơn 10 pixel hoặc quá nhiều pixel (render sai), coi như không support
  // Emoji thường render từ 10-200 pixels trong canvas 20x20
  return coloredPixels >= 10 && coloredPixels <= 300
}

// Lọc và cache emoji được hỗ trợ.
// Kiểm tra theo phiên bản Unicode (một emoji đại diện cho mỗi phiên bản) thay vì từng emoji:
// ~15 lần vẽ canvas thay vì ~1800, nên mở picker không còn chặn luồng chính.
let cachedSupportedEmojis: EmojiItem[] | null = null

const getSupportedEmojis = (emojis: EmojiItem[]) => {
  if (cachedSupportedEmojis) {
    return cachedSupportedEmojis
  }

  const supportByVersion = new Map<number | undefined, boolean>()
  const isSupported = (emoji: EmojiItem) => {
    if (!supportByVersion.has(emoji.version)) {
      try {
        supportByVersion.set(emoji.version, isEmojiSupported(emoji.emoji as string))
      } catch {
        supportByVersion.set(emoji.version, false)
      }
    }
    return supportByVersion.get(emoji.version)
  }

  cachedSupportedEmojis = emojis.filter(emoji => !!emoji.emoji && isSupported(emoji))

  return cachedSupportedEmojis
}

export function EmojiButton ({ editor }: EmojiButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [tippyInstance, setTippyInstance] = useState<TippyInstance | null>(null)

  const createEmojiPicker = (emojis: EmojiItem[]) => {
    const supportedEmojis = getSupportedEmojis(emojis)

    const container = document.createElement('div')

    container.className = 'emoji-picker-container bg-white rounded shadow-lg border'
    container.style.width = '380px'
    container.style.maxHeight = '400px'

    const header = document.createElement('div')

    header.className = 'border-b p-2'

    const searchInput = document.createElement('input')

    searchInput.type = 'text'
    searchInput.placeholder = 'Tìm emoji...'
    searchInput.className = 'w-full px-3 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'

    const categories = [
      { name: 'All', icon: '😀', filter: null },
      { name: 'People', icon: '👋', filter: ['people', 'body'] },
      { name: 'Animals', icon: '🐶', filter: ['animals', 'nature'] },
      { name: 'Food', icon: '🍕', filter: ['food', 'drink'] },
      { name: 'Activities', icon: '⚽', filter: ['activities', 'sport'] },
      { name: 'Travel', icon: '🚗', filter: ['travel', 'places'] },
      { name: 'Objects', icon: '💡', filter: ['objects'] },
      { name: 'Symbols', icon: '❤️', filter: ['symbols'] },
      { name: 'Flags', icon: '🏁', filter: ['flags'] }
    ]

    const categoryButtons = document.createElement('div')

    categoryButtons.className = 'flex gap-1 overflow-x-auto pb-2'
    categoryButtons.style.scrollbarWidth = 'thin'

    let selectedCategory: string[] | null = null

    const emojiList = document.createElement('div')

    emojiList.className = 'p-2 overflow-y-auto'
    emojiList.style.height = '280px'
    emojiList.style.display = 'grid'
    emojiList.style.gridTemplateColumns = 'repeat(9, 1fr)'
    emojiList.style.gap = '4px'

    const renderEmojis = (emojis: EmojiItem[]) => {
      emojiList.innerHTML = ''

      let filteredEmojis = emojis

      if (selectedCategory) {
        filteredEmojis = filteredEmojis.filter(emoji =>
          emoji.group && selectedCategory && selectedCategory.some(cat =>
            emoji.group && emoji.group.toLowerCase().includes(cat)
          )
        )
      }

      const displayEmojis = filteredEmojis.slice(0, 200)

      displayEmojis.forEach((emoji) => {
        const btn = document.createElement('button')

        btn.type = 'button'
        btn.innerHTML = emoji.emoji || ''
        btn.className = 'text-2xl hover:bg-gray-100 p-1 rounded cursor-pointer transition-colors'
        btn.title = `:${emoji.name}:`
        btn.style.width = '38px'
        btn.style.height = '38px'
        btn.style.display = 'flex'
        btn.style.alignItems = 'center'
        btn.style.justifyContent = 'center'

        btn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          editor.chain().focus().insertContent(emoji.emoji || '').run()
          tippyInstance?.hide()
        }

        emojiList.appendChild(btn)
      })

      if (displayEmojis.length === 0) {
        emojiList.innerHTML = '<div class="col-span-9 text-center text-gray-500 py-8 text-sm">Không tìm thấy emoji</div>'
      }
    }

    categories.forEach((category) => {
      const btn = document.createElement('button')

      btn.type = 'button'
      btn.textContent = category.icon
      btn.title = category.name
      btn.className = 'px-2 py-1 text-xl hover:bg-gray-100 rounded transition-colors'

      btn.onclick = () => {
        categoryButtons.querySelectorAll('button').forEach(b => {
          b.classList.remove('bg-blue-100')
        })
        btn.classList.add('bg-blue-100')

        selectedCategory = category.filter
        renderEmojis(supportedEmojis)
      }

      categoryButtons.appendChild(btn)
    })

    categoryButtons.firstChild && (categoryButtons.firstChild as HTMLElement).classList.add('bg-blue-100')

    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase()

      if (query) {
        const filtered = supportedEmojis.filter(emoji =>
          emoji.name.toLowerCase().includes(query)
          || emoji.tags?.some(tag => tag.toLowerCase().includes(query))
          || emoji.shortcodes?.some(code => code.toLowerCase().includes(query))
        )

        renderEmojis(filtered)
      } else {
        renderEmojis(supportedEmojis)
      }
    })

    renderEmojis(supportedEmojis)

    header.appendChild(searchInput)
    header.appendChild(categoryButtons)
    container.appendChild(header)
    container.appendChild(emojiList)

    return container
  }

  useEffect(() => {
    if (!buttonRef.current) return

    const loading = document.createElement('div')

    loading.className = 'bg-white rounded shadow-lg border p-4 text-sm text-gray-600'
    loading.textContent = 'Đang tải emoji…'

    let loaded = false
    const instance = tippy(buttonRef.current, {
      // The emoji list (~1800 items) is loaded and built on first open, not at page load
      content: loading,
      onShow: (tip) => {
        if (loaded) return
        loaded = true
        import('@tiptap/extension-emoji').then(({ gitHubEmojis }) => {
          tip.setContent(createEmojiPicker(gitHubEmojis))
        }).catch(() => {
          loaded = false
          loading.textContent = 'Không tải được emoji'
        })
      },
      trigger: 'click',
      interactive: true,
      placement: 'bottom-start',
      theme: 'light',
      arrow: false,
      zIndex: 9999,
      onClickOutside: (instance) => instance.hide()
    })

    setTippyInstance(instance)

    return () => {
      instance.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <button
      ref={buttonRef}
      type='button'
      className='p-2 rounded hover:bg-gray-100 transition-colors'
      title='Chèn emoji'
    >
      <Smile className='w-5 h-5' />
    </button>
  )
}
