import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { usePostHog } from '@posthog/react'
import type { IGUser } from '../../types'

const KEY_NFB = 'tare_done_nfb'
const KEY_FANS = 'tare_done_fans'

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]))
}

function CopyButton({ users, listType }: { users: IGUser[]; listType: 'not_following_back' | 'fans' }) {
  const posthog = usePostHog()
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    const text = users.map((u) => `@${u.username}`).join('\n')
    await navigator.clipboard.writeText(text)
    posthog?.capture('copy_list_clicked', { list_type: listType, count: users.length })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [users, listType, posthog])

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: copied ? 'rgba(131,58,180,0.2)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(131,58,180,0.4)' : 'rgba(255,255,255,0.1)'}`,
        color: copied ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
      }}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy list
        </>
      )}
    </button>
  )
}

interface DonePanelProps {
  nfbDone: Set<string>
  fansDone: Set<string>
  onRestoreNfb: (u: string) => void
  onRestoreFan: (u: string) => void
  onClearNfb: () => void
  onClearFans: () => void
}

function DonePanel({ nfbDone, fansDone, onRestoreNfb, onRestoreFan, onClearNfb, onClearFans }: DonePanelProps) {
  const [expanded, setExpanded] = useState(false)
  const total = nfbDone.size + fansDone.size

  const listStyle: React.CSSProperties = {
    overflowY: 'auto',
    maxHeight: '180px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(131,58,180,0.2) transparent',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '5px 10px',
    borderRadius: '8px',
  }

  const restoreBtn: React.CSSProperties = {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '2px 4px',
    flexShrink: 0,
  }

  return createPortal(
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {expanded ? (
        <div
          style={{
            background: 'rgba(10,10,10,0.98)',
            border: '1px solid rgba(131,58,180,0.35)',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            width: '256px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#4ade80' }}>✓</span> Done ({total})
            </span>
            <button
              onClick={() => setExpanded(false)}
              style={{ color: 'rgba(255,255,255,0.35)', fontSize: '18px', lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >×</button>
          </div>

          {/* Body — two independent scrollable sections */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {nfbDone.size > 0 && (
              <div style={{ borderBottom: fansDone.size > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px 4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Not following back ({nfbDone.size})
                  </span>
                  <button
                    onClick={onClearNfb}
                    style={{ fontSize: '11px', color: 'rgba(255,100,100,0.5)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, flexShrink: 0 }}
                  >
                    Clear
                  </button>
                </div>
                <div style={listStyle}>
                  {[...nfbDone].map((u) => (
                    <div key={u} style={rowStyle}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        @{u}
                      </span>
                      <button onClick={() => onRestoreNfb(u)} title="Restore" style={restoreBtn}>↩</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {fansDone.size > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px 4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Fans skipped ({fansDone.size})
                  </span>
                  <button
                    onClick={onClearFans}
                    style={{ fontSize: '11px', color: 'rgba(255,100,100,0.5)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, flexShrink: 0 }}
                  >
                    Clear
                  </button>
                </div>
                <div style={listStyle}>
                  {[...fansDone].map((u) => (
                    <div key={u} style={rowStyle}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        @{u}
                      </span>
                      <button onClick={() => onRestoreFan(u)} title="Restore" style={restoreBtn}>↩</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(74,222,128,0.5)',
            borderRadius: '14px',
            padding: '10px 18px',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.12)',
            cursor: 'pointer',
          }}
        >
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4ade80',
            }} />
            <span style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#4ade80',
              opacity: 0.6,
              animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
            }} />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
            <span style={{ lineHeight: 1 }}>Unfollow tracker</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1, fontWeight: 400 }}>{total} marked done</span>
          </span>
        </button>
      )}
    </div>,
    document.body
  )
}

type SortKey = 'alpha' | 'oldest' | 'newest'

interface UserListProps {
  users: IGUser[]
  hasTimestamps: boolean
  doneSet: Set<string>
  onMarkDone: (username: string) => void
}

function UserList({ users, hasTimestamps, doneSet, onMarkDone }: UserListProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('alpha')

  const filtered = useMemo(() => {
    let list = users
      .filter((u) => !doneSet.has(u.username))
      .filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'alpha') list = [...list].sort((a, b) => a.username.localeCompare(b.username))
    if (sort === 'oldest') list = [...list].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    if (sort === 'newest') list = [...list].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    return list
  }, [users, search, sort, doneSet])

  const hiddenCount = users.filter((u) => doneSet.has(u.username)).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t('results.notfollowing.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="px-3 py-2 rounded-xl text-sm text-white/70 outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="alpha">{t('results.notfollowing.sort_alpha')}</option>
          {hasTimestamps && (
            <>
              <option value="oldest">{t('results.notfollowing.sort_oldest')}</option>
              <option value="newest">{t('results.notfollowing.sort_newest')}</option>
            </>
          )}
        </select>
      </div>

      {hiddenCount > 0 && (
        <p className="text-xs text-white/25 pl-1">
          {hiddenCount} hidden — restore via the Done panel
        </p>
      )}

      <p className="text-white/20 text-xs flex items-center gap-1 mb-1">
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Tap any username to open their Instagram profile
      </p>

      <div
        className="flex flex-col gap-1 max-h-[420px] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(131,58,180,0.3) transparent' }}
      >
        {filtered.length === 0 && (
          <p className="text-center text-white/30 py-8 text-sm">{t('results.notfollowing.empty')}</p>
        )}
        {filtered.map((user, i) => (
          <div
            key={user.username}
            className="flex items-center gap-3 px-3 py-3 rounded-xl group transition-all hover:bg-white/5 animate-list-in"
            style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, hsl(${(user.username.charCodeAt(0) * 15) % 360}deg 60% 50%), hsl(${(user.username.charCodeAt(0) * 15 + 60) % 360}deg 60% 40%))`,
              }}
            >
              {user.username[0].toUpperCase()}
            </div>
            <a
              href={user.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-white/80 text-sm group-hover:text-white transition-colors truncate"
            >
              @{user.username}
            </a>
            <button
              onClick={() => onMarkDone(user.username)}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(131,58,180,0.3)'
                e.currentTarget.style.border = '1px solid rgba(131,58,180,0.6)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }}
              title="Done — hide from list"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  notFollowingBack: IGUser[]
  fans: IGUser[]
}

export default function NotFollowingBackTab({ notFollowingBack, fans }: Props) {
  const { t } = useTranslation()
  const [nfbDone, setNfbDone] = useState<Set<string>>(() => loadSet(KEY_NFB))
  const [fansDone, setFansDone] = useState<Set<string>>(() => loadSet(KEY_FANS))

  const nfbHasTimestamps = notFollowingBack.some((u) => u.timestamp !== null)
  const fansHasTimestamps = fans.some((u) => u.timestamp !== null)

  const markNfbDone = useCallback((username: string) => {
    setNfbDone((prev) => {
      const next = new Set(prev)
      next.add(username)
      saveSet(KEY_NFB, next)
      return next
    })
  }, [])

  const markFanDone = useCallback((username: string) => {
    setFansDone((prev) => {
      const next = new Set(prev)
      next.add(username)
      saveSet(KEY_FANS, next)
      return next
    })
  }, [])

  const restoreNfb = useCallback((username: string) => {
    setNfbDone((prev) => {
      const next = new Set(prev)
      next.delete(username)
      saveSet(KEY_NFB, next)
      return next
    })
  }, [])

  const restoreFan = useCallback((username: string) => {
    setFansDone((prev) => {
      const next = new Set(prev)
      next.delete(username)
      saveSet(KEY_FANS, next)
      return next
    })
  }, [])

  const clearNfb = useCallback(() => {
    const empty = new Set<string>()
    setNfbDone(empty)
    saveSet(KEY_NFB, empty)
  }, [])

  const clearFans = useCallback(() => {
    const empty = new Set<string>()
    setFansDone(empty)
    saveSet(KEY_FANS, empty)
  }, [])

  const hasDone = nfbDone.size > 0 || fansDone.size > 0

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold">
            {t('results.notfollowing.title_a')}
            <span className="ml-2 text-white/30 font-normal text-sm">({notFollowingBack.length})</span>
          </h3>
          <CopyButton users={notFollowingBack} listType="not_following_back" />
        </div>
        <p className="text-white/40 text-sm mb-4">You follow them. They don't follow back.</p>
        <UserList
          users={notFollowingBack}
          hasTimestamps={nfbHasTimestamps}
          doneSet={nfbDone}
          onMarkDone={markNfbDone}
        />
      </section>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      <section>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold">
            {t('results.notfollowing.title_b')}
            <span className="ml-2 text-white/30 font-normal text-sm">({fans.length})</span>
          </h3>
          <CopyButton users={fans} listType="fans" />
        </div>
        <p className="text-white/40 text-sm mb-4">They follow you. You haven't followed back.</p>
        <UserList
          users={fans}
          hasTimestamps={fansHasTimestamps}
          doneSet={fansDone}
          onMarkDone={markFanDone}
        />
      </section>

      {hasDone && (
        <DonePanel
          nfbDone={nfbDone}
          fansDone={fansDone}
          onRestoreNfb={restoreNfb}
          onRestoreFan={restoreFan}
          onClearNfb={clearNfb}
          onClearFans={clearFans}
        />
      )}
    </div>
  )
}
