/**
 * Migración: convierte el campo user (único) en users (array) en la colección properties.
 * Ejecutar una sola vez si ya tenías propiedades con el modelo anterior.
 *
 * Desde la raíz del backend:
 *   node scripts/propertyUserToUsers.js
 *
 * Requiere MONGODB_URI en .env
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Conectado a MongoDB')

    const coll = mongoose.connection.db.collection('properties')
    const withUser = await coll.find({ user: { $exists: true } }).toArray()

    if (withUser.length === 0) {
      console.log('No hay documentos con campo "user". Nada que migrar.')
      process.exit(0)
      return
    }

    let updated = 0
    for (const doc of withUser) {
      await coll.updateOne(
        { _id: doc._id },
        {
          $set: { users: [doc.user] },
          $unset: { user: '' }
        }
      )
      updated++
    }

    console.log(`Documentos actualizados: ${updated}`)
    console.log('Campo "user" reemplazado por "users" (array).')
    process.exit(0)
  } catch (error) {
    console.error('Error en la migración:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Desconectado de MongoDB')
  }
}

runMigration()
