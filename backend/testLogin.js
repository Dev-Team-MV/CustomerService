import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB Atlas\n')

    const email = 'superadmin@lakewood.com'
    const password = 'admin123'

    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      process.exit(1)
    }

    console.log('Usuario encontrado:')
    console.log('Email:', user.email)
    console.log('Role:', user.role)
    console.log('Password hash:', user.password.substring(0, 20) + '...')
    
    const isMatch = await user.matchPassword(password)
    console.log('\nPrueba de contraseña "admin123":', isMatch ? '✅ CORRECTA' : '❌ INCORRECTA')

    if (!isMatch) {
      console.log('\n🔧 Actualizando contraseña...')
      user.password = password
      await user.save()
      console.log('✅ Contraseña actualizada correctamente')
      
      // Verificar de nuevo
      const updatedUser = await User.findOne({ email }).select('+password')
      const isMatchNow = await updatedUser.matchPassword(password)
      console.log('Verificación final:', isMatchNow ? '✅ CORRECTA' : '❌ INCORRECTA')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testLogin()
