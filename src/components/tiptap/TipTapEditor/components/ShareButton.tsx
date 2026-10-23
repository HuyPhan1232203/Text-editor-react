import { memo, useEffect, useState } from 'react'
import type * as Y from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import { Check, Copy, LogOut, Share2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  colorFor, leaveRoom, ROOM_KEY, ROOM_NAME, roomLink, savedUserName, saveUserName, startSharing
} from '@/lib/share'
import { t } from '@/i18n'

interface ShareButtonProps {
  ydoc: Y.Doc
  provider: WebrtcProvider | null
}

interface Peer {
  clientId: number
  name: string
  color: string
  self: boolean
}

// People in the room, from the awareness states of the connected peers
function usePeers (provider: WebrtcProvider | null): Peer[] {
  const [peers, setPeers] = useState<Peer[]>([])

  useEffect(() => {
    if (!provider) return

    const { awareness } = provider
    const update = () => {
      const list: Peer[] = []

      awareness.getStates().forEach((state, clientId) => {
        const user = state.user as { name?: string, color?: string } | undefined

        if (user?.name) {
          list.push({
            clientId,
            name: user.name,
            color: user.color ?? colorFor(user.name),
            self: clientId === awareness.clientID
          })
        }
      })
      // You first, then the others in a stable order
      list.sort((a, b) => Number(b.self) - Number(a.self) || a.clientId - b.clientId)
      setPeers(list)
    }

    update()
    awareness.on('change', update)
    return () => awareness.off('change', update)
  }, [provider])

  return peers
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?'

const MAX_AVATARS = 4

/** "Share" button with the people currently in the room, like Google Docs. */
export const ShareButton = memo(function ShareButton ({ ydoc, provider }: ShareButtonProps) {
  const peers = usePeers(provider)
  // In a room without a name yet, ask for one right away
  const [open, setOpen] = useState(() => Boolean(ROOM_NAME) && !savedUserName())
  const [name, setName] = useState(savedUserName)
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)
  const link = ROOM_NAME ? roomLink(ROOM_NAME, ROOM_KEY) : ''

  const applyName = (value: string) => {
    setName(value)
    saveUserName(value.trim())
    if (provider && value.trim()) {
      provider.awareness.setLocalStateField('user', { name: value.trim(), color: colorFor(value.trim()) })
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the link stays selectable in the field
    }
  }

  const start = async () => {
    setStarting(true)
    saveUserName(name.trim())
    await startSharing(ydoc)
  }

  const others = peers.filter((peer) => !peer.self)

  return (
    <div className='flex items-center gap-2'>
      {ROOM_NAME && peers.length > 0 && (
        <div className='flex -space-x-2' aria-label={t('share.online', { n: peers.length })}>
          {peers.slice(0, MAX_AVATARS).map((peer) => (
            <span
              key={peer.clientId}
              title={peer.self ? `${peer.name} (${t('share.you')})` : peer.name}
              className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white'
              style={{ backgroundColor: peer.color }}
            >
              {initials(peer.name)}
            </span>
          ))}
          {peers.length > MAX_AVATARS && (
            <span className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-semibold text-gray-700'>
              +{peers.length - MAX_AVATARS}
            </span>
          )}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className='bg-blue-600 text-white hover:bg-blue-700'>
            <Share2 className='mr-2 h-4 w-4' />
            {t('share.button')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('share.title')}</DialogTitle>
            <DialogDescription>{ROOM_NAME ? t('share.inRoom') : t('share.intro')}</DialogDescription>
          </DialogHeader>

          <div className='grid gap-2'>
            <Label htmlFor='share-name'>{t('share.name')}</Label>
            <Input
              id='share-name'
              value={name}
              onChange={(event) => applyName(event.target.value)}
              placeholder={t('share.namePlaceholder')}
              maxLength={40}
            />
          </div>

          {ROOM_NAME
            ? (
              <>
                <div className='grid gap-2'>
                  <Label htmlFor='share-link'>{t('share.link')}</Label>
                  <div className='flex gap-2'>
                    <Input id='share-link' value={link} readOnly onFocus={(event) => event.target.select()} />
                    <Button onClick={copy} variant='outline' className='shrink-0'>
                      {copied ? <Check className='mr-2 h-4 w-4' /> : <Copy className='mr-2 h-4 w-4' />}
                      {copied ? t('share.copied') : t('share.copy')}
                    </Button>
                  </div>
                </div>
                <p className='text-sm text-gray-600'>
                  {others.length ? t('share.others', { names: others.map((peer) => peer.name).join(', ') }) : t('share.alone')}
                </p>
                <p className='text-xs text-gray-500'>{t('share.limits')}</p>
                <div className='flex justify-end'>
                  <Button variant='ghost' onClick={leaveRoom}>
                    <LogOut className='mr-2 h-4 w-4' />
                    {t('share.leave')}
                  </Button>
                </div>
              </>
            )
            : (
              <>
                <p className='text-xs text-gray-500'>{t('share.limits')}</p>
                <div className='flex justify-end'>
                  <Button onClick={start} disabled={starting} className='bg-blue-600 text-white hover:bg-blue-700'>
                    {t('share.start')}
                  </Button>
                </div>
              </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
