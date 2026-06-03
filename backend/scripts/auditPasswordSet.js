import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'

const email = process.argv[2]?.toLowerCase().trim()

await mongoose.connect(process.env.MONGODB_URI)

if (email) {
  const user = await User.findOne({ email }).select('+password email role passwordSet')
  if (!user) {
    console.log('Usuario no encontrado:', email)
  } else {
    console.log(JSON.stringify({
      email: user.email,
      role: user.role,
      passwordSet: user.passwordSet,
      hasPasswordHash: Boolean(user.password)
    }, null, 2))
  }
} else {
  const all = await User.find().select('+password email role passwordSet phoneNumber')
  const noFlag = all.filter((u) => !u.passwordSet)
  const withHash = noFlag.filter((u) => u.password)
  const noHash = noFlag.filter((u) => !u.password)
  const hasPwdOk = all.filter((u) => u.password && u.passwordSet)
  console.log(JSON.stringify({
    totalUsers: all.length,
    loginReady: hasPwdOk.length,
    passwordSetFalse: noFlag.length,
    withHashButFlagFalse: withHash.length,
    noHashNoFlag: noHash.length,
    sampleNoHash: noHash.slice(0, 10).map((u) => ({ email: u.email, role: u.role, phone: u.phoneNumber })),
    sampleMismatch: withHash.slice(0, 10).map((u) => ({ email: u.email, role: u.role }))
  }, null, 2))

  const byPhone = {}
  for (const u of all) {
    if (!u.phoneNumber) continue
    if (!byPhone[u.phoneNumber]) byPhone[u.phoneNumber] = []
    byPhone[u.phoneNumber].push(u.email)
  }
  const dupPhones = Object.entries(byPhone).filter(([, emails]) => emails.length > 1)
  if (dupPhones.length) {
    console.log('Teléfonos duplicados:', dupPhones)
  }
}

await mongoose.disconnect()
