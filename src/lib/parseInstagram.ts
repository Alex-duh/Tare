import JSZip from 'jszip'
import type { IGUser, ParsedData } from '../types'

interface RawEntry {
  string_list_data?: Array<{
    value?: string
    href?: string
    timestamp?: number
  }>
}

function parseJSONEntries(entries: RawEntry[]): IGUser[] {
  const users: IGUser[] = []
  for (const entry of entries) {
    const data = entry.string_list_data?.[0]
    if (!data?.value) continue
    users.push({
      username: data.value,
      href: data.href ?? `https://www.instagram.com/${data.value}/`,
      timestamp: data.timestamp ?? null,
    })
  }
  return users
}

function parseHTMLFile(html: string): IGUser[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const users: IGUser[] = []
  for (const link of doc.querySelectorAll('a')) {
    const href = link.getAttribute('href') ?? ''
    if (!href.includes('instagram.com/')) continue
    let username = href.split('instagram.com/')[1]?.replace(/\//g, '') ?? ''
    if (username.startsWith('_u/')) username = username.slice(3)
    if (!username || ['legal', 'explore', 'about', 'developer', 'help'].includes(username)) continue
    users.push({ username, href, timestamp: null })
  }
  return users
}

export async function parseZip(file: File): Promise<ParsedData> {
  const zip = await JSZip.loadAsync(file)

  // Collect all follower JSON files (followers_1.json, followers_2.json, …)
  const followerJsonFiles = Object.keys(zip.files).filter(
    (name) => /followers_\d+\.json$/i.test(name)
  )
  const followingJsonFile = Object.keys(zip.files).find(
    (name) => /following\.json$/i.test(name)
  )

  if (followerJsonFiles.length > 0 && followingJsonFile) {
    // JSON path
    const followerEntries: RawEntry[] = []
    for (const path of followerJsonFiles) {
      const text = await zip.files[path].async('text')
      const parsed = JSON.parse(text) as RawEntry[]
      followerEntries.push(...parsed)
    }

    const followingText = await zip.files[followingJsonFile].async('text')
    // Following JSON is wrapped: { relationships_following: [...] }
    const followingRaw = JSON.parse(followingText)
    const followingEntries: RawEntry[] = Array.isArray(followingRaw)
      ? followingRaw
      : (followingRaw.relationships_following ?? [])

    return {
      followers: parseJSONEntries(followerEntries),
      following: parseJSONEntries(followingEntries),
      hasTimestamps: true,
    }
  }

  // HTML fallback
  const followerHtmlFiles = Object.keys(zip.files).filter(
    (name) => /followers.*\.html$/i.test(name)
  )
  const followingHtmlFile = Object.keys(zip.files).find(
    (name) => /following\.html$/i.test(name)
  )

  if (followerHtmlFiles.length > 0 && followingHtmlFile) {
    const followerUsers: IGUser[] = []
    for (const path of followerHtmlFiles) {
      const html = await zip.files[path].async('text')
      followerUsers.push(...parseHTMLFile(html))
    }
    const followingHtml = await zip.files[followingHtmlFile].async('text')
    return {
      followers: followerUsers,
      following: parseHTMLFile(followingHtml),
      hasTimestamps: false,
    }
  }

  throw new Error('no_valid_files')
}

export function parseHTMLFiles(followerFiles: File[], followingFile: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const readers: Promise<IGUser[]>[] = []

    const readFile = (f: File) =>
      new Promise<IGUser[]>((res, rej) => {
        const reader = new FileReader()
        reader.onload = (e) => res(parseHTMLFile(e.target?.result as string))
        reader.onerror = rej
        reader.readAsText(f)
      })

    for (const f of [...followerFiles, followingFile]) {
      readers.push(readFile(f))
    }

    Promise.all(readers)
      .then((results) => {
        const followerUsers = results.slice(0, followerFiles.length).flat()
        const followingUsers = results[results.length - 1]
        resolve({ followers: followerUsers, following: followingUsers, hasTimestamps: false })
      })
      .catch(reject)
  })
}

export function parseJSONFiles(
  followerFiles: File[],
  followingFile: File
): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const readJSON = (f: File): Promise<RawEntry[]> =>
      new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const raw = JSON.parse(e.target?.result as string)
            res(Array.isArray(raw) ? raw : (raw.relationships_following ?? []))
          } catch {
            rej(new Error('invalid_json'))
          }
        }
        reader.onerror = rej
        reader.readAsText(f)
      })

    Promise.all([...followerFiles.map(readJSON), readJSON(followingFile)])
      .then((results) => {
        const followerEntries = results.slice(0, followerFiles.length).flat()
        const followingEntries = results[results.length - 1]
        resolve({
          followers: parseJSONEntries(followerEntries),
          following: parseJSONEntries(followingEntries),
          hasTimestamps: true,
        })
      })
      .catch(reject)
  })
}
