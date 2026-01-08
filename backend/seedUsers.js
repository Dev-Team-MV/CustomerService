import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const users = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@lakewood.com',
    password: 'admin123',
    phoneNumber: '+1-555-0100',
    role: 'superadmin',
    birthday: new Date('1980-01-15')
  },
  {
    firstName: 'John',
    lastName: 'Manager',
    email: 'admin@lakewood.com',
    password: 'admin123',
    phoneNumber: '+1-555-0101',
    role: 'admin',
    birthday: new Date('1985-05-20')
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@example.com',
    password: 'user123',
    phoneNumber: '+1-555-0102',
    role: 'user',
    birthday: new Date('1990-08-12')
  },
  {
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'carlos@example.com',
    password: 'user123',
    phoneNumber: '+1-555-0103',
    role: 'user',
    birthday: new Date('1988-03-25')
  },
  {
    firstName: 'Ana',
    lastName: 'Martinez',
    email: 'ana@example.com',
    password: 'user123',
    phoneNumber: '+1-555-0104',
    role: 'user',
    birthday: new Date('1992-11-08')
  }
]

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB Atlas')

    await User.deleteMany({})
    console.log('🗑️  Usuarios anteriores eliminados')

    for (const userData of users) {
      const user = new User(userData)
      await user.save()
      console.log(`✅ Usuario creado: ${user.email} (${user.role})`)
    }

    console.log('\n🎉 Usuarios de prueba creados exitosamente!\n')
    console.log('📋 Credenciales de acceso:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n👑 SUPERADMIN:')
    console.log('   Email: superadmin@lakewood.com')
    console.log('   Password: admin123')
    console.log('\n🔧 ADMIN:')
    console.log('   Email: admin@lakewood.com')
    console.log('   Password: admin123')
    console.log('\n👤 USUARIOS:')
    console.log('   Email: maria@example.com')
    console.log('   Password: user123')
    console.log('\n   Email: carlos@example.com')
    console.log('   Password: user123')
    console.log('\n   Email: ana@example.com')
    console.log('   Password: user123')
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

seedUsers()
