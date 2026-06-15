import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IGUser, ParsedData } from '../../types'
import ShareCard from '../ShareCard'
import GrowthGraph from '../GrowthGraph'

interface Props {
  data: ParsedData
  notFollowingBack: IGUser[]
  fans: IGUser[]
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  )
}

export default function OverviewTab({ data, notFollowingBack, fans }: Props) {
  const { t } = useTranslation()
  const [showShare, setShowShare] = useState(false)
  const [username, setUsername] = useState(() =>
    localStorage.getItem('tare_username') || data.accountUsername || ''
  )

  const followerSet = useMemo(() => new Set(data.followers.map((u) => u.username)), [data])
  const followingSet = useMemo(() => new Set(data.following.map((u) => u.username)), [data])
  const mutuals = useMemo(
    () => data.followers.filter((u) => followingSet.has(u.username)),
    [data, followingSet]
  )

  const ratio =
    data.following.length > 0
      ? ((data.followers.length / data.following.length) * 100).toFixed(0)
      : '0'

  // Day Ones who left: your earliest 20% follows that no longer follow you
  const dayOnesLeft = useMemo(() => {
    if (!data.hasTimestamps) return 0
    const sorted = [...data.following]
      .filter((u) => u.timestamp !== null)
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    const earliest = sorted.slice(0, Math.ceil(sorted.length * 0.2))
    return earliest.filter((u) => !followerSet.has(u.username)).length
  }, [data, followerSet])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('results.overview.followers')} value={data.followers.length.toLocaleString()} />
        <StatCard label={t('results.overview.following')} value={data.following.length.toLocaleString()} />
        <StatCard
          label={t('results.overview.ratio')}
          value={`${ratio}%`}
          sub="followers ÷ following"
        />
        <StatCard
          label="Mutuals"
          value={mutuals.length.toLocaleString()}
          sub="you both follow each other"
        />
        <StatCard
          label={t('results.overview.not_following_back')}
          value={notFollowingBack.length.toLocaleString()}
          sub="you follow them, they don't follow back"
        />
        <StatCard
          label={t('results.overview.fans')}
          value={fans.length.toLocaleString()}
          sub="they follow you, you don't follow back"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center flex-1 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="pl-3 pr-1 text-sm text-white/30 select-none">@</span>
            <input
              type="text"
              placeholder="your_handle"
              value={username}
              onChange={(e) => {
                const val = e.target.value.replace(/^@+/, '')
                setUsername(val)
                localStorage.setItem('tare_username', val)
              }}
              className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-white placeholder-white/20 outline-none"
            />
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all whitespace-nowrap"
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Share results
          </button>
        </div>
        {username && (
          <p className="text-xs text-white/25 pl-1">Your handle will appear on the share card</p>
        )}
      </div>

      {showShare && (
        <ShareCard
          followers={data.followers.length}
          following={data.following.length}
          notFollowingBack={notFollowingBack.length}
          mutuals={mutuals.length}
          dayOnesLeft={dayOnesLeft}
          hasTimestamps={data.hasTimestamps}
          username={username}
          onClose={() => setShowShare(false)}
        />
      )}

      {data.hasTimestamps && (
        <>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <GrowthGraph followers={data.followers} following={data.following} username={username} />
        </>
      )}
    </div>
  )
}
