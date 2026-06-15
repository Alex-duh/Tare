import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IGUser } from '../../types'

interface Props {
  notFollowingBack: IGUser[]
  fans: IGUser[]
}

type SortKey = 'alpha' | 'oldest' | 'newest'

function UserList({ users, hasTimestamps }: { users: IGUser[]; hasTimestamps: boolean }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('alpha')

  const filtered = useMemo(() => {
    let list = users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'alpha') list = [...list].sort((a, b) => a.username.localeCompare(b.username))
    if (sort === 'oldest') list = [...list].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    if (sort === 'newest') list = [...list].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    return list
  }, [users, search, sort])

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

      <div className="flex flex-col gap-1 max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(131,58,180,0.3) transparent' }}>
        {filtered.length === 0 && (
          <p className="text-center text-white/30 py-8 text-sm">{t('results.notfollowing.empty')}</p>
        )}
        {filtered.map((user) => (
          <a
            key={user.username}
            href={user.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all hover:bg-white/5"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, hsl(${(user.username.charCodeAt(0) * 15) % 360}deg 60% 50%), hsl(${(user.username.charCodeAt(0) * 15 + 60) % 360}deg 60% 40%))`,
              }}
            >
              {user.username[0].toUpperCase()}
            </div>
            <span className="text-white/80 text-sm group-hover:text-white transition-colors flex-1">
              @{user.username}
            </span>
            <svg
              className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function NotFollowingBackTab({ notFollowingBack, fans }: Props) {
  const { t } = useTranslation()
  const hasTimestamps = notFollowingBack.some((u) => u.timestamp !== null)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-white font-semibold mb-1">
          {t('results.notfollowing.title_a')}
          <span className="ml-2 text-white/30 font-normal text-sm">({notFollowingBack.length})</span>
        </h3>
        <p className="text-white/40 text-sm mb-4">You follow them. They don't follow back.</p>
        <UserList users={notFollowingBack} hasTimestamps={hasTimestamps} />
      </section>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      <section>
        <h3 className="text-white font-semibold mb-1">
          {t('results.notfollowing.title_b')}
          <span className="ml-2 text-white/30 font-normal text-sm">({fans.length})</span>
        </h3>
        <p className="text-white/40 text-sm mb-4">They follow you. You haven't followed back.</p>
        <UserList users={fans} hasTimestamps={hasTimestamps} />
      </section>
    </div>
  )
}
