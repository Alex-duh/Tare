import { useTranslation } from 'react-i18next'
import type { IGUser, ParsedData } from '../../types'

interface Props {
  data: ParsedData
  notFollowingBack: IGUser[]
  fans: IGUser[]
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
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

  const ratio =
    data.followers.length > 0
      ? ((data.followers.length / data.following.length) * 100).toFixed(0)
      : '0'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label={t('results.overview.followers')} value={data.followers.length.toLocaleString()} />
      <StatCard label={t('results.overview.following')} value={data.following.length.toLocaleString()} />
      <StatCard
        label={t('results.overview.ratio')}
        value={`${ratio}%`}
        sub="followers ÷ following"
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
  )
}
