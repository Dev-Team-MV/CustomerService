/**
 * Marca passwordSet=true en usuarios que ya tienen hash de contraseña.
 * Uso: node scripts/migrateLegacyPasswordSet.js [--dry-run]
 */
import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'

const dryRun = process.argv.includes('--dry-run')

await mongoose.connect(process.env.MONGODB_URI)

const users = await User.find({ passwordSet: { $ne: true } }).select('+password email')
const toFix = users.filter((u) => u.password)

console.log(dryRun ? '[dry-run]' : '[apply]', `Usuarios a corregir: ${toFix.length}`)
for (const u of toFix) {
  console.log(' -', u.email)
  if (!dryRun) {
    u.passwordSet = true
    await u.save()
  }
}

await mongoose.disconnect()
