import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  CircularProgress
} from '@mui/material'
import { TrendingUp, Refresh } from '@mui/icons-material'
import api from '../services/api'

const Analytics = () => {
  const [stats, setStats] = useState({
    totalLots: 0,
    soldLots: 0,
    pendingLots: 0,
    occupancyRate: 0,
    targetRate: 92,
    avgLotPrice: 0,
    modelStats: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // const fetchAnalytics = async () => {
  //   setLoading(true)
  //   try {
  //     // Agregar timestamp para evitar caché
  //     const timestamp = new Date().getTime()
  //     const [lotsResponse, propertiesResponse] = await Promise.all([
  //       api.get(`/lots?t=${timestamp}`),
  //       api.get(`/properties?t=${timestamp}`)
  //     ])
      
  //     const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []
  //     const properties = Array.isArray(propertiesResponse.data) ? propertiesResponse.data : []

  //     console.log('=== FRESH DATA FETCH ===')
  //     console.log('Timestamp:', new Date().toISOString())
  //     console.log('Total properties:', properties.length)
      
  //     // Log detallado de cada propiedad con su estado
  //     console.log('\n=== ALL PROPERTIES STATUS ===')
  //     properties.forEach((property, index) => {
  //       console.log(`${index + 1}. Property ID: ${property._id}`)
  //       console.log(`   Status: ${property.status}`)
  //       console.log(`   Model:`, property.model)
  //       console.log('---')
  //     })

  //     // Calcular estadísticas básicas de LOTES
  //     const totalLots = lots.length
  //     const soldLots = lots.filter(lot => lot.status === 'sold').length
  //     console.log(lots);
      
  //     console.log(`\nTotal Lots: ${totalLots}, Sold Lots: ${soldLots}`)
  //     const pendingLots = lots.filter(lot => lot.status === 'hold' || lot.status === 'pending').length
  //     const occupancyRate = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0

  //     // Calcular promedio de precio de lotes
  //     const lotsWithPrice = lots.filter(lot => lot.totalPrice || lot.price || lot.basePrice)
  //     const totalPrice = lotsWithPrice.reduce((sum, lot) => {
  //       return sum + (lot.totalPrice || lot.price || lot.basePrice || 0)
  //     }, 0)
  //     const avgLotPrice = lotsWithPrice.length > 0 ? totalPrice / lotsWithPrice.length : 0

  //     // Calcular estadísticas por modelo usando PROPERTIES
  //     console.log('\n=== CALCULATING MODEL STATS ===')
  //     const modelMap = {}
      
  //     properties.forEach((property) => {
  //       let modelName = 'Unknown'
        
  //       if (property.model && typeof property.model === 'object') {
  //         modelName = property.model.name || property.model.model || 'Unknown'
  //       } else if (typeof property.model === 'string') {
  //         modelName = property.modelName || property.model
  //       } else if (property.modelName) {
  //         modelName = property.modelName
  //       }
        
  //       if (!modelMap[modelName]) {
  //         modelMap[modelName] = {
  //           name: modelName,
  //           total: 0,
  //           sold: 0,
  //           pending: 0
  //         }
  //       }
        
  //       modelMap[modelName].total++
        
  //       console.log(`Property ${property._id}: model="${modelName}", status="${property.status}"`)
        
  //       if (property.status === 'sold') {
  //         modelMap[modelName].sold++
  //         console.log(`  ✓ Counted as SOLD`)
  //       } else if (property.status === 'hold' || property.status === 'pending') {
  //         modelMap[modelName].pending++
  //         console.log(`  ⏳ Counted as PENDING`)
  //       } else {
  //         console.log(`  • Status: ${property.status}`)
  //       }
  //     })

  //     console.log('\n=== MODEL SUMMARY ===')
  //     Object.entries(modelMap).forEach(([modelName, data]) => {
  //       console.log(`${modelName}:`)
  //       console.log(`  Total: ${data.total}`)
  //       console.log(`  Sold: ${data.sold}`)
  //       console.log(`  Pending: ${data.pending}`)
  //       console.log(`  Available: ${data.total - data.sold - data.pending}`)
  //     })

  //     const modelStats = Object.values(modelMap)
  //       .filter(model => model.name !== 'Unknown')
  //       .map(model => ({
  //         name: model.name,
  //         sold: model.sold,
  //         pending: model.pending,
  //         total: model.total,
  //         soldPercentage: model.total > 0 ? Math.round((model.sold / model.total) * 100) : 0,
  //         pendingPercentage: model.total > 0 ? Math.round((model.pending / model.total) * 100) : 0
  //       }))
  //       .sort((a, b) => b.total - a.total)

  //     console.log('\n=== FINAL MODEL STATS ===')
  //     console.log(modelStats)

  //     setStats({
  //       totalLots,
  //       soldLots,
  //       pendingLots,
  //       occupancyRate,
  //       targetRate: 92,
  //       avgLotPrice,
  //       modelStats
  //     })
  //   } catch (error) {
  //     console.error('Error fetching analytics:', error)
  //     console.error('Error details:', error.response?.data)
  //   } finally {
  //     setLoading(false)
  //   }
  // }
    const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const timestamp = new Date().getTime()
      const [lotsResponse, propertiesResponse] = await Promise.all([
        api.get(`/lots?t=${timestamp}`),
        api.get(`/properties?t=${timestamp}`)
      ])
      
      const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []
      const properties = Array.isArray(propertiesResponse.data) ? propertiesResponse.data : []
  
      console.log('=== FRESH DATA FETCH ===')
      console.log('Total properties:', properties.length)
      console.log('Total lots:', lots.length)
      
      // 🔍 LOG: Mostrar estructura de properties y lots
      console.log('\n=== PROPERTY STRUCTURE (first 3) ===')
      properties.slice(0, 3).forEach((prop, i) => {
        console.log(`\nProperty ${i + 1}:`)
        console.log('  _id:', prop._id)
        console.log('  lot (raw):', prop.lot)
        console.log('  lot type:', typeof prop.lot)
        console.log('  model:', prop.model)
        console.log('  All keys:', Object.keys(prop))
      })
      
      console.log('\n=== LOT STRUCTURE (first 3) ===')
      lots.slice(0, 3).forEach((lot, i) => {
        console.log(`\nLot ${i + 1}:`)
        console.log('  _id:', lot._id)
        console.log('  status:', lot.status)
        console.log('  number:', lot.number)
        console.log('  All keys:', Object.keys(lot))
      })
  
      // Calcular estadísticas básicas de LOTES
      const totalLots = lots.length
      const soldLots = lots.filter(lot => lot.status === 'sold').length
      const pendingLots = lots.filter(lot => lot.status === 'pending').length
      const occupancyRate = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0
  
      // Calcular promedio de precio de lotes
      const lotsWithPrice = lots.filter(lot => lot.price)
      const totalPrice = lotsWithPrice.reduce((sum, lot) => sum + lot.price, 0)
      const avgLotPrice = lotsWithPrice.length > 0 ? totalPrice / lotsWithPrice.length : 0
  
      // ✅ RELACIONAR PROPERTIES CON LOTS
      console.log('\n=== RELATING PROPERTIES TO LOTS ===')
      const modelMap = {}
      let relationshipSuccess = 0
      let relationshipFail = 0
      
      properties.forEach((property, index) => {
        console.log(`\n--- Property ${index + 1} / ${properties.length} ---`)
        console.log('Property ID:', property._id)
        
        // Extraer nombre del modelo
        let modelName = 'Unknown'
        if (property.model && typeof property.model === 'object') {
          modelName = property.model.model || property.model.name || 'Unknown'
          console.log('Model (from object):', modelName)
        } else if (typeof property.model === 'string') {
          modelName = property.model
          console.log('Model (from string):', modelName)
        }
        
        // 🔍 Intentar encontrar el lot asociado
        let lotStatus = 'available' // default
        let lotFound = false
        
        if (property.lot) {
          // Extraer el ID del lot (puede ser objeto poblado o string)
          let lotId = null
          if (typeof property.lot === 'object') {
            lotId = property.lot._id || property.lot.id
            console.log('property.lot is OBJECT:', {
              _id: property.lot._id,
              status: property.lot.status,
              number: property.lot.number
            })
          } else if (typeof property.lot === 'string') {
            lotId = property.lot
            console.log('property.lot is STRING:', lotId)
          }
          
          console.log('Looking for lot with ID:', lotId)
          
          // Buscar el lot en el array de lots
          const associatedLot = lots.find(lot => {
            const match = lot._id === lotId || lot.id === lotId
            if (match) {
              console.log('✅ MATCH FOUND! Lot:', {
                _id: lot._id,
                status: lot.status,
                number: lot.number
              })
            }
            return match
          })
          
          if (associatedLot) {
            lotStatus = associatedLot.status
            lotFound = true
            relationshipSuccess++
            console.log(`✅ Relationship SUCCESS! Status: "${lotStatus}"`)
          } else {
            relationshipFail++
            console.log(`❌ Relationship FAILED! Lot ID "${lotId}" not found in lots array`)
            console.log('Available lot IDs:', lots.slice(0, 5).map(l => l._id))
          }
        } else {
          console.log('⚠️  Property has no lot field')
          relationshipFail++
        }
        
        // Inicializar modelo si no existe
        if (!modelMap[modelName]) {
          modelMap[modelName] = {
            name: modelName,
            total: 0,
            sold: 0,
            pending: 0
          }
        }
        
        modelMap[modelName].total++
        
        // Contar según el estado del LOT
        if (lotStatus === 'sold') {
          modelMap[modelName].sold++
          console.log(`📊 Counted as SOLD for model "${modelName}"`)
        } else if (lotStatus === 'pending') {
          modelMap[modelName].pending++
          console.log(`📊 Counted as PENDING for model "${modelName}"`)
        } else {
          console.log(`📊 Counted as AVAILABLE for model "${modelName}"`)
        }
      })
  
      console.log('\n=== RELATIONSHIP SUMMARY ===')
      console.log(`Total properties: ${properties.length}`)
      console.log(`Successful relationships: ${relationshipSuccess}`)
      console.log(`Failed relationships: ${relationshipFail}`)
      console.log(`Success rate: ${properties.length > 0 ? ((relationshipSuccess / properties.length) * 100).toFixed(1) : 0}%`)
  
      console.log('\n=== MODEL SUMMARY ===')
      Object.entries(modelMap).forEach(([modelName, data]) => {
        console.log(`\n${modelName}:`)
        console.log(`  Total: ${data.total}`)
        console.log(`  Sold: ${data.sold} (${data.total > 0 ? ((data.sold / data.total) * 100).toFixed(1) : 0}%)`)
        console.log(`  Pending: ${data.pending} (${data.total > 0 ? ((data.pending / data.total) * 100).toFixed(1) : 0}%)`)
        console.log(`  Available: ${data.total - data.sold - data.pending}`)
      })
  
      const modelStats = Object.values(modelMap)
        .filter(model => model.name !== 'Unknown')
        .map(model => ({
          name: model.name,
          sold: model.sold,
          pending: model.pending,
          total: model.total,
          soldPercentage: model.total > 0 ? Math.round((model.sold / model.total) * 100) : 0,
          pendingPercentage: model.total > 0 ? Math.round((model.pending / model.total) * 100) : 0
        }))
        .sort((a, b) => b.total - a.total)
  
      console.log('\n=== FINAL MODEL STATS ===')
      console.log(modelStats)
  
      setStats({
        totalLots,
        soldLots,
        pendingLots,
        occupancyRate,
        targetRate: 92,
        avgLotPrice,
        modelStats
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const projectSoldPercentage = stats.totalLots > 0 ? (stats.soldLots / stats.totalLots) * 100 : 0

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Project statistics and sales progress
          </Typography>
        </Box>
        <IconButton 
          onClick={fetchAnalytics} 
          disabled={loading}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <Refresh />}
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Project Sales Progress
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Total Lots Sold
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {stats.soldLots} / {stats.totalLots}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={projectSoldPercentage}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {projectSoldPercentage.toFixed(1)}% of project sold
              </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Occupancy Rate
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {stats.occupancyRate}% / {stats.targetRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.occupancyRate / stats.targetRate) * 100}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={stats.occupancyRate >= stats.targetRate ? 'success' : 'warning'}
              />
              <Typography variant="caption" color="text.secondary">
                Target: {stats.targetRate}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Sales Metrics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Inventory
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalLots}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption">
                        Available lots
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Properties Sold
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.soldLots}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption">
                        {stats.occupancyRate}% occupancy
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Pending Sales
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.pendingLots}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <Typography variant="caption">
                        {stats.pendingLots > 0 ? 'Action Required' : 'All clear'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Avg. Lot Price
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${stats.avgLotPrice > 0 ? (stats.avgLotPrice / 1000).toFixed(0) : 0}k
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <Typography variant="caption">
                        ${stats.avgLotPrice > 0 ? stats.avgLotPrice.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Property Sales by Model
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : stats.modelStats.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {stats.modelStats.map((model) => (
                  <Grid item xs={12} sm={6} md={3} key={model.name}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight="500">
                          {model.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {model.sold + model.pending}/{model.total}
                        </Typography>
                      </Box>
                      
                      {/* Barra de progreso con tres colores */}
                      <Box sx={{ position: 'relative', height: 8, bgcolor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                        {/* Parte vendida (ROJO - sold) */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${model.soldPercentage}%`,
                            bgcolor: 'error.main', // ROJO para sold
                            transition: 'width 0.3s ease'
                          }}
                        />
                        {/* Parte pendiente (AZUL - hold/pending) */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${model.soldPercentage}%`,
                            top: 0,
                            height: '100%',
                            width: `${model.pendingPercentage}%`,
                            bgcolor: 'info.main', // AZUL para pending/hold
                            transition: 'width 0.3s ease'
                          }}
                        />
                        {/* El resto es available (gris del fondo) */}
                      </Box>
                      
                      <Box display="flex" gap={2} mt={1}>
                        <Typography variant="caption" color="error.main">
                          {model.sold} sold ({model.soldPercentage}%)
                        </Typography>
                        {model.pending > 0 && (
                          <Typography variant="caption" color="info.main">
                            {model.pending} hold ({model.pendingPercentage}%)
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {model.total - model.sold - model.pending} available
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No model data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Analytics