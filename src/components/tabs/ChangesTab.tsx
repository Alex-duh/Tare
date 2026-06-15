import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getSnapshots, diffSnapshots } from '../../lib/db'
import type { Snapshot, SnapshotDiff } from '../../types'

interface Props {
  isFirstUpload: boolean
}

function DiffSection({ title, users, positive }: { title: string; users: string[]; positive: boolean }) {
  if (users.length === 0) return null
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: positive ? 'rgba(131,58,180,0.07)' : 'rgba(253,29,29,0.07)',
        border: `1px solid ${positive ? 'rgba(131,58,180,0.2)' : 'rgba(253,29,29,0.2)'}`,
      }}
    >
      <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
        <span>{positive ? '↑' : '↓'}</span>
        {title}
        <span className="text-white/30">({users.length})</span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {users.slice(0, 50).map((u) => (
          <a
            key={u}
            href={`https://www.instagram.com/${u}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded-lg text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            @{u}
          </a>
        ))}
        {users.length > 50 && (
          <span className="text-xs text-white/30 px-2 py-1">+{users.length - 50} more</span>
        )}
      </div>
    </div>
  )
}

export default function ChangesTab({ isFirstUpload }: Props) {
  const { t } = useTranslation()
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [diff, setDiff] = useState<SnapshotDiff | null>(null)
  const [compareA, setCompareA] = useState<number | null>(null)
  const [compareB, setCompareB] = useState<number | null>(null)

  useEffect(() => {
    getSnapshots().then((snaps) => {
      const sorted = snaps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setSnapshots(sorted)
      if (sorted.length >= 2 && !isFirstUpload) {
        setDiff(diffSnapshots(sorted[1], sorted[0]))
      }
    })
  }, [isFirstUpload])

  const handleCompare = () => {
    if (compareA === null || compareB === null) return
    const a = snapshots.find((s) => s.id === compareA)
    const b = snapshots.find((s) => s.id === compareB)
    if (a && b) setDiff(diffSnapshots(a, b))
  }

  if (isFirstUpload) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="text-4xl">📍</div>
        <h3 className="text-white font-semibold text-lg">{t('results.changes.baseline_title')}</h3>
        <p className="text-white/40 text-sm max-w-sm">{t('results.changes.baseline_sub')}</p>
        <p className="text-white/20 text-xs mt-2">{t('results.changes.storage_note')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Latest diff */}
      {diff && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-semibold">Since last upload</h3>
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                diff.netFollowerChange >= 0
                  ? 'text-green-400 bg-green-400/10'
                  : 'text-red-400 bg-red-400/10'
              }`}
            >
              {diff.netFollowerChange >= 0 ? '+' : ''}{diff.netFollowerChange} {t('results.changes.net_change')}
            </span>
          </div>

          <DiffSection title={t('results.changes.unfollowed_you')} users={diff.unfollowedYou} positive={false} />
          <DiffSection title={t('results.changes.new_followers')} users={diff.newFollowers} positive={true} />
          <DiffSection title={t('results.changes.you_stopped')} users={diff.youStoppedFollowing} positive={false} />
          <DiffSection title={t('results.changes.you_started')} users={diff.youStartedFollowing} positive={true} />
        </section>
      )}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Snapshot history */}
      <section>
        <h3 className="text-white font-semibold mb-4">{t('results.changes.history')}</h3>

        {snapshots.length === 0 ? (
          <p className="text-white/30 text-sm">{t('results.changes.no_history')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-white/80 text-sm">
                    {new Date(snap.date).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {snap.followerCount.toLocaleString()} followers · {snap.followingCount.toLocaleString()} following
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {snapshots.length >= 2 && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white/50 text-sm font-medium mb-3">{t('results.changes.compare')}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={compareA ?? ''}
                onChange={(e) => setCompareA(Number(e.target.value))}
                className="px-3 py-2 rounded-xl text-sm text-white/70 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="">Earlier snapshot</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <span className="text-white/30">→</span>
              <select
                value={compareB ?? ''}
                onChange={(e) => setCompareB(Number(e.target.value))}
                className="px-3 py-2 rounded-xl text-sm text-white/70 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="">Later snapshot</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCompare}
                disabled={compareA === null || compareB === null}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)' }}
              >
                Compare
              </button>
            </div>
          </div>
        )}

        <p className="text-white/20 text-xs mt-4">{t('results.changes.storage_note')}</p>
      </section>
    </div>
  )
}
