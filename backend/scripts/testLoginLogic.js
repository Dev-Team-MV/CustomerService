import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'

const email = (process.argv[2] || 'admin@homecare.com').toLowerCase().trim()
const password = process.argv[3] || 'admin123'

await mongoose.connect(process.env.MONGODB_URI)
const user = await User.findOne({ email }).select('+password projectMemberships')
if (!user) {
  console.log('No encontrado')
  process.exit(1)
}

const blockedOld = !user.password || !user.passwordSet
const blockedNew = !user.password
const match = user.password ? await user.matchPassword(password) : false

console.log(JSON.stringify({
  email: user.email,
  passwordSet: user.passwordSet,
  hasPassword: Boolean(user.password),
  blockedOldLogic: blockedOld,
  blockedNewLogic: blockedNew,
  passwordMatch: match
}, null, 2))

await mongoose.disconnect()
