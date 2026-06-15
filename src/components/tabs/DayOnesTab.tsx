import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IGUser } from '../../types'

interface Props {
  following: IGUser[]
  followers: IGUser[]
  hasTimestamps: boolean
}

function formatDuration(ts: number) {
  const now = Date.now() / 1000
  const diffSecs = now - ts
  const years = Math.floor(diffSecs / (365.25 * 86400))
  const days = Math.floor((diffSecs % (365.25 * 86400)) / 86400)
  const date = new Date(ts * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return { years, days, date }
}

export default function DayOnesTab({ following, followers, hasTimestamps }: Props) {
  const { t } = useTranslation()

  const followerSet = useMemo(() => new Set(followers.map((u) => u.username)), [followers])
  const followingMap = useMemo(
    () => new Map(following.map((u) => [u.username, u])),
    [following]
  )

  const mutuals = useMemo(() => {
    return followers
      .filter(
        (f) =>
          followingMap.has(f.username) &&
          (f.timestamp !== null || followingMap.get(f.username)?.timestamp !== null)
      )
      .map((f) => {
        const youFollow = followingMap.get(f.username)!
        // Use the later of the two timestamps (when the mutual relationship was established)
        const ts = Math.max(f.timestamp ?? 0, youFollow.timestamp ?? 0)
        return { username: f.username, href: f.href, timestamp: ts }
      })
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [followers, followingMap])

  const betrayed = useMemo(() => {
    // You followed them early (low timestamp among your following) but they no longer follow you
    const sortedFollowing = [...following]
      .filter((u) => u.timestamp !== null)
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    const earliest = sortedFollowing.slice(0, Math.ceil(sortedFollowing.length * 0.2)) // top 20% oldest
    return earliest.filter((u) => !followerSet.has(u.username))
  }, [following, followerSet])

  if (!hasTimestamps) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="text-4xl">⏳</div>
        <h3 className="text-white font-semibold text-lg">{t('results.dayones.no_timestamps')}</h3>
        <p className="text-white/40 text-sm max-w-sm">{t('results.dayones.no_timestamps_sub')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Mutuals ranked by follow age */}
      <section>
        <div className="mb-5">
          <h3 className="text-white font-semibold text-lg">{t('results.dayones.title')}</h3>
          <p className="text-white/40 text-sm mt-1">{t('results.dayones.sub')}</p>
        </div>

        {mutuals.length === 0 ? (
          <p className="text-white/30 text-sm">{t('results.dayones.empty_mutuals')}</p>
        ) : (
          <>
            <p className="text-white/20 text-xs flex items-center gap-1 mb-2">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Tap any username to open their Instagram profile
            </p>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(131,58,180,0.3) transparent' }}>
            {mutuals.map((user, i) => {
              const { years, days, date } = formatDuration(user.timestamp)
              const isTop10 = i < 10
              return (
                <a
                  key={user.username}
                  href={user.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 rounded-xl group transition-all hover:bg-white/5"
                  style={
                    isTop10
                      ? {
                          background: 'rgba(131,58,180,0.07)',
                          border: '1px solid rgba(131,58,180,0.2)',
                        }
                      : undefined
                  }
                >
                  <span className="text-white/20 text-xs w-6 text-right shrink-0">
                    #{i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${(user.username.charCodeAt(0) * 15) % 360}deg 60% 50%), hsl(${(user.username.charCodeAt(0) * 15 + 60) % 360}deg 60% 40%))`,
                    }}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 text-sm group-hover:text-white transition-colors">
                      @{user.username}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {t('results.dayones.since')} {date} · {years > 0 ? `${years}y ` : ''}{days}d
                    </p>
                  </div>
                  {isTop10 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                      style={{
                        background: 'linear-gradient(90deg, rgba(131,58,180,0.4), rgba(253,29,29,0.4))',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {t('results.dayones.loyalty_badge')}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
          </>
        )}
      </section>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Betrayed — early follows who left */}
      <section>
        <div className="mb-5">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <span>🔪</span>
            {t('results.dayones.betrayed_title')}
            <span className="text-white/30 font-normal text-sm">({betrayed.length})</span>
          </h3>
          <p className="text-white/40 text-sm mt-1">{t('results.dayones.betrayed_sub')}</p>
        </div>

        {betrayed.length === 0 ? (
          <p className="text-white/30 text-sm">{t('results.dayones.empty_betrayed')}</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(253,29,29,0.3) transparent' }}>
            {betrayed.map((user) => {
              const { date } = formatDuration(user.timestamp ?? 0)
              return (
                <a
                  key={user.username}
                  href={user.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all hover:bg-white/5"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 opacity-60"
                    style={{
                      background: `linear-gradient(135deg, hsl(${(user.username.charCodeAt(0) * 15) % 360}deg 40% 40%), hsl(${(user.username.charCodeAt(0) * 15 + 60) % 360}deg 40% 30%))`,
                    }}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors line-through decoration-red-500/50">
                      @{user.username}
                    </p>
                    <p className="text-white/20 text-xs mt-0.5">Followed {date}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
