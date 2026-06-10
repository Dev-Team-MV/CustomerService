import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'

const email = (process.argv[2] || 'superadmin@mvcrm.com').toLowerCase().trim()
await mongoose.connect(process.env.MONGODB_URI)
const user = await User.findOne({ email }).lean()
if (!user) {
  console.log('Usuario no encontrado:', email)
} else {
  console.log(JSON.stringify({
    _id: user._id,
    email: user.email,
    role: user.role,
    passwordSet: user.passwordSet,
    projectMemberships: user.projectMemberships
  }, null, 2))
}
await mongoose.disconnect()
