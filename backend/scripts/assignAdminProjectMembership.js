/**
 * Asigna un proyecto a un usuario admin (projectMemberships).
 * Necesario para login en HomeCare Hub (un admin = un proyecto).
 *
 * Uso:
 *   node scripts/assignAdminProjectMembership.js --email admin@homecare.com --projectId 69a73ce5b20401b061da6451
 *
 * Requiere MONGODB_URI en .env (BD de Customer Service).
 */
import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Project from '../models/Project.js'

const parseArgs = () => {
  const args = process.argv.slice(2)
  const out = { email: null, projectId: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email') out.email = args[++i]
    if (args[i] === '--projectId') out.projectId = args[++i]
  }
  return out
}

async function run() {
  const { email, projectId } = parseArgs()
  if (!email || !projectId) {
    console.error('Uso: node scripts/assignAdminProjectMembership.js --email <email> --projectId <ObjectId>')
    process.exit(1)
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    console.error('projectId inválido')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB conectado.')

  const project = await Project.findById(projectId)
  if (!project) {
    console.error('Proyecto no encontrado:', projectId)
    process.exit(1)
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() })
  if (!user) {
    console.error('Usuario no encontrado:', email)
    process.exit(1)
  }

  if (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'owner') {
    console.warn(`Advertencia: el usuario tiene role "${user.role}", no admin.`)
  }

  const pid = new mongoose.Types.ObjectId(projectId)
  const already = (user.projectMemberships || []).some(
    (m) => m.project && String(m.project) === String(pid)
  )

  if (!already) {
    user.projectMemberships = [...(user.projectMemberships || []), { project: pid, role: 'resident' }]
    await user.save()
    console.log(`Membresía agregada: ${user.email} → ${project.name} (${project._id})`)
  } else {
    console.log(`El usuario ya tenía membresía en ${project.name}`)
  }

  console.log('projectMemberships:', JSON.stringify(user.projectMemberships, null, 2))
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
