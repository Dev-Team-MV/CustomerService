import cron from 'node-cron'
import { recalculateAllLeadScores } from './leadScoringService.js'

/**
 * Recalcula scores de leads diariamente.
 * LEAD_SCORING_CRON_ENABLED=true para activar (default: true en production-like).
 */
export function startLeadScoringScheduler() {
  const enabled = process.env.LEAD_SCORING_CRON_ENABLED !== 'false'
  if (!enabled) {
    console.log('[LeadScoring] Scheduler disabled (LEAD_SCORING_CRON_ENABLED=false)')
    return
  }

  const cronExpr = process.env.LEAD_SCORING_CRON || '0 3 * * *'

  cron.schedule(
    cronExpr,
    async () => {
      console.log('[LeadScoring] Running daily score recalculation...')
      try {
        const result = await recalculateAllLeadScores()
        console.log(`[LeadScoring] Done: ${result.updated}/${result.total} leads updated`)
      } catch (err) {
        console.error('[LeadScoring] Error:', err.message)
      }
    },
    { timezone: process.env.TZ || 'America/Mexico_City' }
  )

  console.log(`[LeadScoring] Scheduler started (cron: ${cronExpr})`)
}
