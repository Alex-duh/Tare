export interface IGUser {
  username: string
  href: string
  timestamp: number | null // Unix epoch; null when parsed from HTML
}

export interface ParsedData {
  followers: IGUser[]
  following: IGUser[]
  hasTimestamps: boolean
}

export interface Snapshot {
  id?: number
  date: string // ISO string
  followerCount: number
  followingCount: number
  followerUsernames: string[]
  followingUsernames: string[]
}

export interface SnapshotDiff {
  unfollowedYou: string[]
  newFollowers: string[]
  youStartedFollowing: string[]
  youStoppedFollowing: string[]
  netFollowerChange: number
}

export type TabId = 'overview' | 'notfollowing' | 'dayones' | 'changes'
