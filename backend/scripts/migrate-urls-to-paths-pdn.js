/**
 * Run migrate-urls-to-paths against production database (MONGODB_URI_PDN).
 * Run: node scripts/migrate-urls-to-paths-pdn.js
 */
import '../config/env.js'

if (!process.env.MONGODB_URI_PDN) {
  console.error('MONGODB_URI_PDN is required')
  process.exit(1)
}

process.env.MONGODB_URI = process.env.MONGODB_URI_PDN
await import('./migrate-urls-to-paths.js')
