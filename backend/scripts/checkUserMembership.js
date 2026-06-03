import '../config/env.js'
import mongoose from 'mongoose'
import User from '../models/User.js'

const email = process.argv[2] || 'admin@homecare.com'
await mongoose.connect(process.env.MONGODB_URI)
const user = await User.findOne({ email: email.toLowerCase() }).lean()
console.log(JSON.stringify({ _id: user?._id, email: user?.email, role: user?.role, projectMemberships: user?.projectMemberships }, null, 2))
await mongoose.disconnect()
