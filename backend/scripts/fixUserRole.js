/**
 * Corrige rol (y opcionalmente membresía) de un usuario en la BD indicada por MONGODB_URI.
 *
 * Uso:
 *   node scripts/fixUserRole.js --email admin@homecare.com --role admin
 *   MONGODB_URI=<uri-pdn> node scripts/fixUserRole.js --email admin@homecare.com --role admin --projectId 69a73ce5b20401b061da6451
 */
import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Project from '../models/Project.js'

const parseArgs = () => {
  const args = process.argv.slice(2)
  const out = { email: null, role: 'admin', projectId: null, password: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email') out.email = args[++i]
    if (args[i] === '--role') out.role = args[++i]
    if (args[i] === '--projectId') out.projectId = args[++i]
    if (args[i] === '--password') out.password = args[++i]
  }
  return out
}

const { email, role, projectId, password } = parseArgs()
if (!email) {
  console.error('Uso: node scripts/fixUserRole.js --email <email> [--role admin|superadmin|owner] [--projectId <id>]')
  process.exit(1)
}

const allowed = new Set(['admin', 'superadmin', 'owner'])
if (!allowed.has(role)) {
  console.error('role debe ser admin, superadmin u owner')
  process.exit(1)
}

console.log('Conectando a:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':***@'))
await mongoose.connect(process.env.MONGODB_URI)

const user = await User.findOne({ email: email.toLowerCase().trim() })
if (!user) {
  console.error('Usuario no encontrado:', email)
  process.exit(1)
}

console.log('Antes:', { _id: user._id, email: user.email, role: user.role, passwordSet: user.passwordSet, memberships: user.projectMemberships?.length })

user.role = role
if (password) {
  user.password = password
  user.passwordSet = true
  console.log('Contraseña actualizada y passwordSet=true')
} else if (!user.passwordSet) {
  console.warn('passwordSet es false — pasa --password o usa setup-password en CS')
}

if (projectId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    console.error('projectId inválido')
    process.exit(1)
  }
  const project = await Project.findById(projectId)
  if (!project) {
    console.error('Proyecto no encontrado')
    process.exit(1)
  }
  const pid = new mongoose.Types.ObjectId(projectId)
  const has = (user.projectMemberships || []).some((m) => String(m.project) === String(pid))
  if (!has) {
    user.projectMemberships = [{ project: pid, role: 'resident' }]
  } else {
    user.projectMemberships = (user.projectMemberships || []).filter(
      (m) => String(m.project) === String(pid)
    )
  }
  console.log('Membresía única:', project.name, projectId)
}

await user.save()
console.log('Después:', {
  _id: user._id,
  role: user.role,
  passwordSet: user.passwordSet,
  projectMemberships: user.projectMemberships
})

await mongoose.disconnect()
process.exit(0)
