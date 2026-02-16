import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lot from './models/Lot.js'
import Model from './models/Model.js'

dotenv.config()

// Función para generar precio aleatorio en un rango
const randomPrice = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Generar lotes del 1 al 71 (sin el 13)
const generateLots = () => {
  const lots = []
  
  for (let i = 1; i <= 71; i++) {
    if (i === 13) continue // Saltar el número 13
    
    lots.push({
      number: i.toString(),
      price: randomPrice(200000, 400000),
      status: 'available'
    })
  }
  
  return lots
}

// Generar modelos
const models = [
  {
    model: 'The Oakwood',
    modelNumber: '5',
    price: 550000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    description: 'Elegant 3-bedroom home with open floor plan, modern kitchen, and spacious master suite. Perfect for families seeking comfort and style.',
    status: 'active'
  },
  {
    model: 'The Lakeside',
    modelNumber: '8',
    price: 850000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2650,
    description: 'Luxurious 4-bedroom residence featuring gourmet kitchen, home office, and stunning lake views. Premium finishes throughout.',
    status: 'active'
  },
  {
    model: 'The Grand Estate',
    modelNumber: '9',
    price: 1200000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3800,
    description: 'Magnificent 5-bedroom estate with chef\'s kitchen, media room, wine cellar, and expansive outdoor living spaces. Ultimate luxury living.',
    status: 'active'
  }
]

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB Atlas\n')

    // Limpiar datos existentes
    await Lot.deleteMany({})
    console.log('🗑️  Lotes anteriores eliminados')
    
    await Model.deleteMany({})
    console.log('🗑️  Modelos anteriores eliminados\n')

    // Crear lotes
    const lots = generateLots()
    await Lot.insertMany(lots)
    console.log(`✅ ${lots.length} lotes creados (del 1 al 71, sin el 13)`)
    console.log(`   Precios: $200,000 - $400,000 USD`)
    console.log(`   Estado: Todos disponibles\n`)

    // Crear modelos
    await Model.insertMany(models)
    console.log('✅ 3 modelos creados:')
    models.forEach(model => {
      console.log(`   - Modelo ${model.modelNumber}: ${model.model}`)
      console.log(`     Precio: $${model.price.toLocaleString()} USD`)
      console.log(`     ${model.bedrooms} habitaciones, ${model.bathrooms} baños, ${model.sqft.toLocaleString()} sqft\n`)
    })

    // Estadísticas
    const totalLots = await Lot.countDocuments()
    const avgLotPrice = await Lot.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ])
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RESUMEN:')
    console.log(`   Total de lotes: ${totalLots}`)
    console.log(`   Precio promedio lotes: $${Math.round(avgLotPrice[0].avgPrice).toLocaleString()} USD`)
    console.log(`   Total de modelos: ${models.length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    console.log('🎉 Base de datos poblada exitosamente!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

seedData()
