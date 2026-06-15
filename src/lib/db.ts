import { openDB } from 'idb'
import type { Snapshot, SnapshotDiff } from '../types'

const DB_NAME = 'tare-db'
const STORE = 'snapshots'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function saveSnapshot(snapshot: Omit<Snapshot, 'id'>): Promise<void> {
  const db = await getDB()
  await db.add(STORE, snapshot)
}

export async function getSnapshots(): Promise<Snapshot[]> {
  const db = await getDB()
  return db.getAll(STORE)
}

export async function getLatestSnapshot(): Promise<Snapshot | undefined> {
  const all = await getSnapshots()
  if (all.length === 0) return undefined
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
}

export function diffSnapshots(prev: Snapshot, curr: Snapshot): SnapshotDiff {
  const prevFollowers = new Set(prev.followerUsernames)
  const currFollowers = new Set(curr.followerUsernames)
  const prevFollowing = new Set(prev.followingUsernames)
  const currFollowing = new Set(curr.followingUsernames)

  return {
    unfollowedYou: [...prevFollowers].filter((u) => !currFollowers.has(u)),
    newFollowers: [...currFollowers].filter((u) => !prevFollowers.has(u)),
    youStartedFollowing: [...currFollowing].filter((u) => !prevFollowing.has(u)),
    youStoppedFollowing: [...prevFollowing].filter((u) => !currFollowing.has(u)),
    netFollowerChange: curr.followerCount - prev.followerCount,
  }
}
