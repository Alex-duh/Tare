import JSZip from 'jszip'
import type { IGUser, ParsedData } from '../types'

interface RawEntry {
  // followers_1.json: title is empty, username lives in string_list_data[0].value
  // following.json:   title IS the username, string_list_data has href + timestamp but NO value
  title?: string
  string_list_data?: Array<{
    value?: string
    href?: string
    timestamp?: number
  }>
}

// Handles flat arrays, { relationships_following: [...] }, or any wrapped object
function extractEntries(raw: unknown): RawEntry[] {
  if (Array.isArray(raw)) return raw as RawEntry[]
  if (raw !== null && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    // Fast path: known key
    if (Array.isArray(obj.relationships_following)) return obj.relationships_following as RawEntry[]
    // Fallback: first non-empty array value in the object
    for (const val of Object.values(obj)) {
      if (Array.isArray(val) && val.length > 0) return val as RawEntry[]
    }
    // One level deeper (some exports double-wrap)
    for (const val of Object.values(obj)) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const inner = extractEntries(val)
        if (inner.length > 0) return inner
      }
    }
  }
  return []
}

function parseJSONEntries(entries: RawEntry[]): IGUser[] {
  const users: IGUser[] = []
  for (const entry of entries) {
    const data = entry.string_list_data?.[0]
    // followers_1.json: value field present
    // following.json:   no value field — username is in entry.title instead
    const username = data?.value || entry.title || ''
    if (!username) continue

    let href = data?.href ?? `https://www.instagram.com/${username}/`
    // Normalise _u/ redirects to direct profile URLs
    href = href.replace('instagram.com/_u/', 'instagram.com/')
    if (!href.endsWith('/')) href += '/'

    users.push({ username, href, timestamp: data?.timestamp ?? null })
  }
  return users
}

function parseHTMLFile(html: string): IGUser[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const users: IGUser[] = []
  const seen = new Set<string>()

  for (const link of doc.querySelectorAll('a')) {
    const href = link.getAttribute('href') ?? ''
    if (!href.includes('instagram.com/')) continue

    // Extract path segment after instagram.com/
    let part = href.split('instagram.com/')[1] ?? ''
    // Strip _u/ prefix BEFORE removing slashes
    if (part.startsWith('_u/')) part = part.slice(3)
    // Take first path segment (the username), ignore trailing slashes and query params
    const username = part.split('/')[0].split('?')[0].toLowerCase()

    if (!username || seen.has(username)) continue
    if (['legal', 'explore', 'about', 'developer', 'help', 'privacy', 'terms'].includes(username)) continue

    seen.add(username)
    users.push({ username, href, timestamp: null })
  }
  return users
}

// Key fix: only check the FILE NAME (last segment), not the full path.
// The zip folder is named "followers_and_following" which contains the word
// "followers", so path-level checks incorrectly excluded following.json.
function basename(path: string): string {
  return path.split('/').pop() ?? path
}

async function extractAccountUsername(zip: JSZip, allPaths: string[]): Promise<string | undefined> {
  const infoPath = allPaths.find((p) => basename(p) === 'personal_information.json')
  if (!infoPath) return undefined
  try {
    const raw = JSON.parse(await zip.files[infoPath].async('text'))
    return raw?.profile_user?.[0]?.string_map_data?.Username?.value || undefined
  } catch {
    return undefined
  }
}

export async function parseZip(file: File): Promise<ParsedData> {
  const zip = await JSZip.loadAsync(file)
  const allPaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir)

  const accountUsername = await extractAccountUsername(zip, allPaths)

  // JSON path
  const followerJsonPaths = allPaths.filter((p) => /^followers_\d+\.json$/i.test(basename(p)))
  const followingJsonPath = allPaths.find((p) => basename(p) === 'following.json')

  if (followerJsonPaths.length > 0 && followingJsonPath) {
    const followerEntries: RawEntry[] = []
    for (const path of followerJsonPaths) {
      const raw = JSON.parse(await zip.files[path].async('text'))
      followerEntries.push(...extractEntries(raw))
    }
    const followingEntries = extractEntries(JSON.parse(await zip.files[followingJsonPath].async('text')))
    return {
      followers: parseJSONEntries(followerEntries),
      following: parseJSONEntries(followingEntries),
      hasTimestamps: true,
      accountUsername,
    }
  }

  // HTML fallback
  const followerHtmlPaths = allPaths.filter((p) => /^followers.*\.html$/i.test(basename(p)))
  const followingHtmlPath = allPaths.find((p) => basename(p) === 'following.html')

  if (followerHtmlPaths.length > 0 && followingHtmlPath) {
    const followerUsers: IGUser[] = []
    for (const path of followerHtmlPaths) {
      followerUsers.push(...parseHTMLFile(await zip.files[path].async('text')))
    }
    return {
      followers: followerUsers,
      following: parseHTMLFile(await zip.files[followingHtmlPath].async('text')),
      hasTimestamps: false,
      accountUsername,
    }
  }

  throw new Error('no_valid_files')
}

export function parseHTMLFiles(followerFiles: File[], followingFile: File): Promise<ParsedData> {
  const read = (f: File) =>
    new Promise<IGUser[]>((res, rej) => {
      const reader = new FileReader()
      reader.onload = (e) => res(parseHTMLFile(e.target?.result as string))
      reader.onerror = rej
      reader.readAsText(f)
    })

  return Promise.all([...followerFiles.map(read), read(followingFile)]).then((results) => ({
    followers: results.slice(0, followerFiles.length).flat(),
    following: results[results.length - 1],
    hasTimestamps: false,
  }))
}

export function parseJSONFiles(followerFiles: File[], followingFile: File): Promise<ParsedData> {
  const readJSON = (f: File): Promise<RawEntry[]> =>
    new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          res(extractEntries(JSON.parse(e.target?.result as string)))
        } catch {
          rej(new Error('invalid_json'))
        }
      }
      reader.onerror = rej
      reader.readAsText(f)
    })

  return Promise.all([...followerFiles.map(readJSON), readJSON(followingFile)]).then((results) => ({
    followers: parseJSONEntries(results.slice(0, followerFiles.length).flat()),
    following: parseJSONEntries(results[results.length - 1]),
    hasTimestamps: true,
  }))
}
