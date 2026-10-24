import { memo, useState } from 'react'
import type * as Y from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import { Check, Copy, LogOut, Share2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  colorFor, forgetRoom, leaveRoom, recentRooms, ROOM_KEY, ROOM_NAME, roomLink,
  savedUserName, saveUserName, startSharing, takeJustShared, userId
} from '@/lib/share'
import type { RecentRoom } from '@/lib/share'
import { caretMovedAt } from '@/lib/caret-activity'
import type { ConnectionStatus, Peer, RoomStatus } from '../hooks/useRoomStatus'
import { t } from '@/i18n'
import type { MessageKey } from '@/i18n'

interface ShareButtonProps {
  ydoc: Y.Doc
  provider: WebrtcProvider | null
  // Shared with the room notice, so both read the same status
  room: RoomStatus
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?'

const MAX_AVATARS = 4

const STATUS_STYLE: Record<ConnectionStatus, { dot: string, label: MessageKey }> = {
  connecting: { dot: 'bg-amber-400 animate-pulse', label: 'share.statusConnecting' },
  connected: { dot: 'bg-green-500', label: 'share.statusConnected' },
  offline: { dot: 'bg-red-500', label: 'share.statusOffline' }
}

// Scrolls to a collaborator's cursor (the tab they used last) and makes it pulse
function revealPeer (peer: Peer) {
  const caret = [...peer.clientIds]
    .sort((x, y) => (caretMovedAt.get(y) ?? 0) - (caretMovedAt.get(x) ?? 0))
    .map((id) => document.querySelector<HTMLElement>(`.ProseMirror .collaboration-caret[data-client-id="${id}"]`))
    .find(Boolean)

  if (!caret) return
  caret.scrollIntoView({ block: 'center', behavior: 'smooth' })
  caret.classList.remove('is-highlighted')
  // Reading the layout restarts the animation
  caret.getBoundingClientRect()
  caret.classList.add('is-highlighted', 'is-active')
  window.setTimeout(() => caret.classList.remove('is-highlighted', 'is-active'), 2000)
}

/** "Share" button with the connection status and the people in the room, like Google Docs. */
export const ShareButton = memo(function ShareButton ({ ydoc, provider, room }: ShareButtonProps) {
  const { status, peers, others } = room
  // Right after creating the room, or in a room without a name yet, show the dialog
  const [justShared] = useState(takeJustShared)
  const [open, setOpen] = useState(() => Boolean(justShared) || (Boolean(ROOM_NAME) && !savedUserName()))
  const [name, setName] = useState(savedUserName)
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)
  const [recent, setRecent] = useState<RecentRoom[]>(recentRooms)
  const link = ROOM_NAME ? roomLink(ROOM_NAME, ROOM_KEY) : ''

  const applyName = (value: string) => {
    setName(value)
    saveUserName(value.trim())
    if (provider && value.trim()) {
      provider.awareness.setLocalStateField('user', { id: userId(), name: value.trim(), color: colorFor(value.trim()) })
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

  const remove = (entry: RecentRoom) => {
    forgetRoom(entry.room)
    setRecent(recentRooms())
  }

  const otherPeers = peers.filter((peer) => !peer.self)
  const statusStyle = STATUS_STYLE[status]
  const statusLabel = status === 'connected' && others < 2
    ? t(others === 1 ? 'share.statusConnectedOne' : 'share.statusConnectedAlone')
    : t(statusStyle.label, { n: others })
  const pastRooms = recent.filter((entry) => entry.room !== ROOM_NAME)

  return (
    <div className='flex items-center gap-2'>
      {ROOM_NAME && (
        <span className='flex items-center gap-1.5 text-xs text-gray-600' title={statusLabel} role='status'>
          <span className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`} />
          <span className='hidden xl:inline'>{statusLabel}</span>
        </span>
      )}
      {ROOM_NAME && peers.length > 0 && (
        <div className='flex -space-x-2' aria-label={t('share.online', { n: peers.length })}>
          {peers.slice(0, MAX_AVATARS).map((peer) => (
            <button
              key={peer.key}
              type='button'
              onClick={() => revealPeer(peer)}
              disabled={peer.self}
              title={peer.self ? `${peer.name} (${t('share.you')})` : t('share.jumpTo', { name: peer.name })}
              className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white enabled:hover:z-10 enabled:hover:ring-2 enabled:hover:ring-blue-300'
              style={{ backgroundColor: peer.color }}
            >
              {initials(peer.name)}
            </button>
          ))}
          {peers.length > MAX_AVATARS && (
            <span
              className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-semibold text-gray-700'
              title={peers.slice(MAX_AVATARS).map((peer) => peer.name).join(', ')}
            >
              +{peers.length - MAX_AVATARS}
            </span>
          )}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type='button'
            className='flex h-9 items-center gap-2 rounded-lg border border-[#E3E5E8] bg-white px-3 text-[13px] font-medium text-[#1B1D21] hover:bg-[#F7F8F9]'
          >
            <Share2 size={16} strokeWidth={1.75} aria-hidden='true' />
            {t('share.button')}
          </button>
        </DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(event) => {
            // In a room with a name already, start on the link (selected, ready to copy)
            const linkInput = document.getElementById('share-link')

            if (ROOM_NAME && savedUserName() && linkInput) {
              event.preventDefault()
              linkInput.focus()
            }
          }}
        >
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
                {justShared && (
                  <p className='flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800' role='status'>
                    <Check className='h-4 w-4 shrink-0' />
                    {justShared.copied ? t('share.createdCopied') : t('share.created')}
                  </p>
                )}
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
                <p className='flex items-center gap-2 text-sm text-gray-600'>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusStyle.dot}`} />
                  {otherPeers.length
                    ? t('share.others', { names: otherPeers.map((peer) => peer.name).join(', ') })
                    : statusLabel}
                </p>
              </>
            )
            : (
              <div className='flex justify-end'>
                <Button onClick={start} disabled={starting} className='bg-blue-600 text-white hover:bg-blue-700'>
                  {t('share.start')}
                </Button>
              </div>
            )}

          {pastRooms.length > 0 && (
            <div className='grid gap-1'>
              <Label>{t('share.recent')}</Label>
              <ul className='max-h-40 overflow-y-auto rounded-md border border-gray-200'>
                {pastRooms.map((entry) => (
                  <li key={entry.room} className='flex items-center gap-2 border-b border-gray-100 px-3 py-1.5 last:border-b-0'>
                    <a href={roomLink(entry.room, entry.key)} className='min-w-0 flex-1 truncate text-sm text-blue-700 hover:underline'>
                      {entry.title || t('share.untitled')}
                    </a>
                    <span className='shrink-0 text-xs text-gray-400'>{new Date(entry.openedAt).toLocaleDateString()}</span>
                    <button
                      type='button'
                      onClick={() => remove(entry)}
                      className='shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                      aria-label={t('share.forget')}
                      title={t('share.forget')}
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className='text-xs text-gray-500'>{t('share.limits')}</p>
          {ROOM_NAME && (
            <div className='flex justify-end'>
              <Button variant='ghost' onClick={leaveRoom}>
                <LogOut className='mr-2 h-4 w-4' />
                {t('share.leave')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
