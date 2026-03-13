/**
 * Enable object versioning on the GCS bucket.
 * Run: node scripts/enable-gcs-versioning.js
 * Requires: .env with GCS credentials (GCS_PROJECT_ID, GCS_BUCKET_NAME, etc.)
 */
import '../config/env.js'
import { enableVersioning } from '../services/backupService.js'

async function main () {
  const result = await enableVersioning()
  if (result.success) {
    console.log('✓', result.message)
  } else {
    console.error('✗ Error:', result.message)
    process.exit(1)
  }
}

main()
