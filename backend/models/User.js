import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    birthday: {
      type: Date
    },
    password: {
      type: String,
      required: function() {
        // No requerir contraseña si tiene setupToken (usuario creado por admin)
        return !this.setupToken && this.role !== 'user'
      },
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'user'],
      default: 'user'
    },
    lots: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot'
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    setupToken: {
      type: String,
      select: false
    },
    setupTokenExpires: {
      type: Date,
      select: false
    },
    passwordSet: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false
  }
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateSetupToken = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.setupToken = crypto.createHash('sha256').update(token).digest('hex')
  this.setupTokenExpires = Date.now() + 48 * 60 * 60 * 1000 // 48 horas
  return token
}

const User = mongoose.model('User', userSchema)

export default User
