import { track } from '@vercel/analytics'

export async function trackAnalysis(): Promise<void> {
  try {
    track('analysis_run')
  } catch {
    // never block the user flow
  }
}
