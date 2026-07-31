/**
 * Seed mínimo para aceptación (Mongo aislado / Testcontainers).
 * No borra toda la BD: upsert de superadmin + proyecto de prueba.
 *
 * Uso:
 *   MONGODB_URI=mongodb://localhost:27018/acceptance node scripts/seedAcceptanceDb.js
 *
 * Imprime líneas MACHINE-readable:
 *   KARATE_PROJECT_ID=<id>
 *   KARATE_ADMIN_EMAIL=...
 *   KARATE_ADMIN_PASSWORD=...
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Project from '../models/Project.js'

dotenv.config()

const ADMIN_EMAIL = process.env.KARATE_ADMIN_EMAIL || 'superadmin@lakewood.com'
const ADMIN_PASSWORD = process.env.KARATE_ADMIN_PASSWORD || 'admin123'
const PROJECT_SLUG = process.env.KARATE_PROJECT_SLUG || 'acceptance-lakewood'

const seed = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is required')
    process.exit(1)
  }

  await mongoose.connect(uri)

  let user = await User.findOne({ email: ADMIN_EMAIL }).select('+password')
  if (!user) {
    user = new User({
      firstName: 'Acceptance',
      lastName: 'Superadmin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      phoneNumber: '+10000000000',
      role: 'superadmin',
      passwordSet: true,
      mustChangePassword: false,
      isActive: true
    })
    await user.save()
    console.log(`Created user ${ADMIN_EMAIL}`)
  } else {
    user.password = ADMIN_PASSWORD
    user.role = 'superadmin'
    user.passwordSet = true
    user.mustChangePassword = false
    user.isActive = true
    await user.save()
    console.log(`Updated user ${ADMIN_EMAIL}`)
  }

  let project = await Project.findOne({ slug: PROJECT_SLUG })
  if (!project) {
    project = await Project.create({
      name: 'Acceptance Project',
      slug: PROJECT_SLUG,
      phase: '1'
    })
    console.log(`Created project ${PROJECT_SLUG}`)
  } else {
    console.log(`Reusing project ${PROJECT_SLUG}`)
  }

  console.log(`KARATE_PROJECT_ID=${project._id.toString()}`)
  console.log(`KARATE_ADMIN_EMAIL=${ADMIN_EMAIL}`)
  console.log(`KARATE_ADMIN_PASSWORD=${ADMIN_PASSWORD}`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
