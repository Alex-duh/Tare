import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePostHog } from '@posthog/react'
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
      <p className="text-white/20 text-xs mt-2 flex items-center gap-1">
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Tap a username to open their Instagram
      </p>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { icon: '📥', label: 'Upload today', sub: 'Tare saves a snapshot in your browser' },
    { icon: '⏳', label: 'Wait a week', sub: 'Go live your life normally' },
    { icon: '📥', label: 'Upload again', sub: 'Re-download your Instagram export and drop it here' },
    { icon: '✨', label: 'See changes', sub: 'Tare shows exactly who followed or left' },
  ]

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div>
        <h4 className="text-white font-semibold text-sm mb-1">How Changes works</h4>
        <p className="text-white/40 text-xs leading-relaxed">
          Unlike the other tabs — which analyze your current data — Changes tracks what's
          <em className="text-white/60 not-italic"> different</em> between two points in time.
          Think of it as a time-lapse for your follower list.
        </p>
      </div>

      <div className="flex items-start gap-2 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-1.5 shrink-0">
            <div
              className="flex flex-col items-center gap-1.5 text-center"
              style={{ minWidth: '90px' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(131,58,180,0.12)', border: '1px solid rgba(131,58,180,0.2)' }}
              >
                {s.icon}
              </div>
              <p className="text-white/80 text-xs font-medium">{s.label}</p>
              <p className="text-white/30 text-xs leading-tight">{s.sub}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="text-white/20 text-sm mt-3 shrink-0 px-1">→</div>
            )}
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-3 flex flex-col gap-1"
        style={{ background: 'rgba(252,176,69,0.06)', border: '1px solid rgba(252,176,69,0.15)' }}
      >
        <p className="text-xs font-medium" style={{ color: '#fcb045' }}>What you'll see after your second upload:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
          {[
            ['↓ Unfollowed you', 'People who left since last time'],
            ['↑ New followers', 'People who joined since last time'],
            ['↓ You stopped following', 'Who you unfollowed'],
            ['↑ You started following', 'Who you newly followed'],
          ].map(([label, desc]) => (
            <div key={label} className="flex flex-col">
              <span className="text-xs text-white/60">{label}</span>
              <span className="text-xs text-white/25">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/20 text-xs">
        Snapshots are stored only in this browser — clearing site data removes them.
        The more often you re-upload, the more detailed your history gets.
      </p>
    </div>
  )
}

export default function ChangesTab({ isFirstUpload }: Props) {
  const { t } = useTranslation()
  const posthog = usePostHog()
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
    if (a && b) {
      const result = diffSnapshots(a, b)
      posthog?.capture('snapshot_compared', {
        net_follower_change: result.netFollowerChange,
        unfollowed_you_count: result.unfollowedYou.length,
        new_followers_count: result.newFollowers.length,
        you_stopped_following_count: result.youStoppedFollowing.length,
        you_started_following_count: result.youStartedFollowing.length,
      })
      setDiff(result)
    }
  }

  if (isFirstUpload) {
    return (
      <div className="flex flex-col gap-6">
        {/* First-time baseline state */}
        <div
          className="rounded-2xl p-6 flex flex-col items-center text-center gap-3"
          style={{ background: 'rgba(131,58,180,0.07)', border: '1px solid rgba(131,58,180,0.2)' }}
        >
          <div className="text-4xl">📍</div>
          <div>
            <h3 className="text-white font-semibold text-base">Baseline saved</h3>
            <p className="text-white/50 text-sm mt-1">
              This is snapshot #1. Come back after downloading a fresh export
              to see what changed.
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'rgba(131,58,180,0.15)', color: 'rgba(255,255,255,0.6)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Snapshot 1 of 1 saved
          </div>
        </div>

        <HowItWorks />
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

          {diff.unfollowedYou.length === 0 &&
            diff.newFollowers.length === 0 &&
            diff.youStoppedFollowing.length === 0 &&
            diff.youStartedFollowing.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2 text-center">
                <div className="text-3xl">🤝</div>
                <p className="text-white/50 text-sm">No changes since last upload.</p>
                <p className="text-white/25 text-xs">Your follower list is identical to the previous snapshot.</p>
              </div>
            )}
        </section>
      )}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* How it works (collapsed) */}
      <HowItWorks />

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Snapshot history */}
      <section>
        <h3 className="text-white font-semibold mb-4">{t('results.changes.history')}</h3>

        {snapshots.length === 0 ? (
          <p className="text-white/30 text-sm">{t('results.changes.no_history')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {snapshots.map((snap, i) => (
              <div
                key={snap.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    {new Date(snap.date).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                    {i === 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(131,58,180,0.2)', color: 'rgba(131,58,180,0.9)' }}>
                        latest
                      </span>
                    )}
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
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)' }}
              >
                Compare
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
