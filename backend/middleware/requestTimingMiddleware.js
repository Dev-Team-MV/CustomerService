const DEFAULT_SLOW_THRESHOLD_MS = 800
const DEFAULT_SUMMARY_INTERVAL_MS = 30000

const endpointStats = new Map()
let summaryTimerStarted = false

function parseBooleanFlag(value, defaultValue = false) {
  if (value == null) return defaultValue
  const normalized = String(value).trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

function parseNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function parseIgnoredPaths(rawValue) {
  const defaults = ['/api/health', '/api-docs']
  if (rawValue == null || String(rawValue).trim() === '') return defaults

  return String(rawValue)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function shouldIgnorePath(path, ignoredPaths) {
  return ignoredPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

function percentile(sortedValues, p) {
  if (!Array.isArray(sortedValues) || sortedValues.length === 0) return 0
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil((p / 100) * sortedValues.length) - 1))
  return sortedValues[index]
}

function startSummaryTimer() {
  if (summaryTimerStarted) return
  summaryTimerStarted = true

  const enabled = parseBooleanFlag(process.env.REQUEST_TIMING_SUMMARY, true)
  if (!enabled) return

  const intervalMs = parseNumber(process.env.REQUEST_TIMING_SUMMARY_INTERVAL_MS, DEFAULT_SUMMARY_INTERVAL_MS)
  const topN = Math.max(1, Math.floor(parseNumber(process.env.REQUEST_TIMING_SUMMARY_TOP_N, 5)))

  setInterval(() => {
    const entries = Array.from(endpointStats.entries())
    if (entries.length === 0) return

    const rows = entries.map(([key, stat]) => {
      const durations = stat.durations.slice().sort((a, b) => a - b)
      const count = stat.count
      const total = stat.totalMs
      const avg = count > 0 ? total / count : 0
      const p95 = percentile(durations, 95)
      return {
        key,
        count,
        avg,
        p95,
        max: stat.maxMs
      }
    })

    rows.sort((a, b) => b.avg - a.avg)
    const selected = rows.slice(0, topN)

    console.log('[request-timing-summary] Top endpoints by avg duration')
    selected.forEach((row, idx) => {
      console.log(
        `[request-timing-summary] #${idx + 1} ${row.key} count=${row.count} avg=${row.avg.toFixed(1)}ms p95=${row.p95.toFixed(1)}ms max=${row.max.toFixed(1)}ms`
      )
    })

    endpointStats.clear()
  }, intervalMs)
}

export function requestTimingMiddleware(req, res, next) {
  startSummaryTimer()

  const start = process.hrtime.bigint()
  const logsEnabled = parseBooleanFlag(process.env.REQUEST_TIMING_LOGS, true)
  const slowThresholdMs = parseNumber(process.env.REQUEST_SLOW_MS, DEFAULT_SLOW_THRESHOLD_MS)
  const ignoredPaths = parseIgnoredPaths(process.env.REQUEST_TIMING_IGNORE_PATHS)

  res.on('finish', () => {
    if (shouldIgnorePath(req.path, ignoredPaths)) return

    const end = process.hrtime.bigint()
    const durationMs = Number(end - start) / 1e6
    if (logsEnabled) {
      const isSlow = durationMs >= slowThresholdMs
      const level = isSlow ? 'warn' : 'log'
      const contentLength = res.getHeader('content-length') ?? '-'

      console[level](
        `[request-timing] ${req.method} ${req.originalUrl} status=${res.statusCode} duration=${durationMs.toFixed(1)}ms size=${contentLength}${isSlow ? ' SLOW' : ''}`
      )
    }

    const endpointKey = `${req.method} ${req.path}`
    const current = endpointStats.get(endpointKey) || {
      count: 0,
      totalMs: 0,
      maxMs: 0,
      durations: []
    }
    current.count += 1
    current.totalMs += durationMs
    current.maxMs = Math.max(current.maxMs, durationMs)
    current.durations.push(durationMs)
    endpointStats.set(endpointKey, current)
  })

  next()
}
