import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import GradientText from '../components/GradientText'
import LanguageToggle from '../components/LanguageToggle'
import Footer from '../components/Footer'
import OverviewTab from '../components/tabs/OverviewTab'
import NotFollowingBackTab from '../components/tabs/NotFollowingBackTab'
import DayOnesTab from '../components/tabs/DayOnesTab'
import ChangesTab from '../components/tabs/ChangesTab'
import type { ParsedData, TabId } from '../types'

interface LocationState {
  parsed: ParsedData
  isFirstUpload: boolean
}

const TABS: { id: TabId; labelKey: string }[] = [
  { id: 'overview', labelKey: 'results.tab_overview' },
  { id: 'notfollowing', labelKey: 'results.tab_notfollowing' },
  { id: 'dayones', labelKey: 'results.tab_dayones' },
  { id: 'changes', labelKey: 'results.tab_changes' },
]

export default function Results() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: LocationState | null }
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const parsed = state?.parsed
  const isFirstUpload = state?.isFirstUpload ?? true

  const followerSet = useMemo(
    () => new Set((parsed?.followers ?? []).map((u) => u.username)),
    [parsed]
  )
  const followingSet = useMemo(
    () => new Set((parsed?.following ?? []).map((u) => u.username)),
    [parsed]
  )

  const notFollowingBack = useMemo(
    () => (parsed?.following ?? []).filter((u) => !followerSet.has(u.username)),
    [parsed, followerSet]
  )
  const fans = useMemo(
    () => (parsed?.followers ?? []).filter((u) => !followingSet.has(u.username)),
    [parsed, followingSet]
  )

  if (!parsed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-white/50 mb-4">No data found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)' }}
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <GradientText className="text-xl font-bold tracking-tight">Tare</GradientText>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t('results.new_analysis')}
          </button>
        </div>
      </nav>

      {/* Tab bar */}
      <div
        className="relative z-10 flex overflow-x-auto px-4 sm:px-6 gap-1 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none' }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, rgba(131,58,180,0.3), rgba(253,29,29,0.3))',
                      color: 'white',
                      border: '1px solid rgba(131,58,180,0.4)',
                    }
                  : {
                      color: 'rgba(255,255,255,0.4)',
                      border: '1px solid transparent',
                    }
              }
            >
              {t(tab.labelKey)}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
        {activeTab === 'overview' && (
          <OverviewTab data={parsed} notFollowingBack={notFollowingBack} fans={fans} />
        )}
        {activeTab === 'notfollowing' && (
          <NotFollowingBackTab notFollowingBack={notFollowingBack} fans={fans} />
        )}
        {activeTab === 'dayones' && (
          <DayOnesTab
            following={parsed.following}
            followers={parsed.followers}
            hasTimestamps={parsed.hasTimestamps}
          />
        )}
        {activeTab === 'changes' && <ChangesTab isFirstUpload={isFirstUpload} />}
      </main>

      <Footer />
    </div>
  )
}
