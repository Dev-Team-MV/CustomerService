/**
 * Verifica superadmin@mvcrm.com para lakewood-p1 (slug: lakewood).
 * Uso: node scripts/verifySuperadminLakewood.js [--password <pwd>]
 */
import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Project from '../models/Project.js'
import { buildAuthProjectFields } from '../utils/authProjectContext.js'

const email = 'superadmin@mvcrm.com'
const password = process.argv.includes('--password')
  ? process.argv[process.argv.indexOf('--password') + 1]
  : null

await mongoose.connect(process.env.MONGODB_URI)

const user = await User.findOne({ email }).select('+password projectMemberships')
const lakewood = await Project.findOne({ slug: 'lakewood' })

if (!user) {
  console.error('Usuario no encontrado')
  process.exit(1)
}

const { projectMemberships, projectId } = buildAuthProjectFields(user)
const lakewoodInMemberships = (user.projectMemberships || []).some(
  (m) => String(m.project) === String(lakewood?._id)
)

console.log(JSON.stringify({
  email: user.email,
  role: user.role,
  passwordSet: user.passwordSet,
  hasPassword: Boolean(user.password),
  lakewoodProject: lakewood ? { _id: lakewood._id, name: lakewood.name, slug: lakewood.slug } : null,
  lakewoodMembership: lakewoodInMemberships,
  projectMembershipsCount: user.projectMemberships?.length ?? 0,
  authProjectId: projectId,
  loginPayloadRole: user.role,
  passwordTest: password ? await user.matchPassword(password) : '(omitido, pasa --password)'
}, null, 2))

await mongoose.disconnect()
