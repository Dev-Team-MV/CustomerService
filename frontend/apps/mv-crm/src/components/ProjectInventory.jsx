import { useState, useEffect } from 'react'
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material'
import { Map, Home, CheckCircle, Pending, Sell, Apartment, Business } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'
import api from '@shared/services/api'
import { useTranslation } from 'react-i18next'
import { getProjectById } from '@shared/config/projectsConfig'

const StatCard = ({ icon, label, value, color }) => {
  return (
    <Paper elevation={0} sx={{ 
      p: 2, 
      borderRadius: 2, 
      border: '1px solid #e0e0e0', 
      bgcolor: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
    }}>
      <Box sx={{ 
        width: 48, 
        height: 48, 
        borderRadius: '50%', 
        bgcolor: `${color}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: color
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#aaa', letterSpacing: 1, textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#0a0a0a' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  )
}

export default function ProjectInventory({ projectId, projectName }) {
  const theme = useTheme()
  const { t } = useTranslation('project')
  const { masterPlanData, loading: mpLoading, fetchMasterPlan } = useMasterPlan()
  
  const [stats, setStats] = useState({ 
    totalBuildings: 0, 
    totalUnits: 0, 
    available: 0, 
    pending: 0, 
    sold: 0 
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [apartmentsData, setApartmentsData] = useState([])

  // ✅ Detectar el tipo de proyecto para ajustar la lógica de negocio
  const projectConfig = getProjectById(projectId)
  const isHouseProject = projectConfig?.catalogType === 'houses'

  // ✅ 1. Cargar Master Plan
  useEffect(() => {
    if (projectId) {
      fetchMasterPlan(projectId, true) // onlyWithPolygon = true
    }
  }, [projectId, fetchMasterPlan])

  // ✅ 2. Cargar Apartments cuando sea necesario (solo para proyectos de apartamentos)
  useEffect(() => {
    if (projectId && !isHouseProject) {
      fetchApartments(projectId)
    }
  }, [projectId, isHouseProject])

  // ✅ 3. Calcular stats cuando tengamos masterPlanData Y apartmentsData (si aplica)
  useEffect(() => {
    if (isHouseProject && projectId) {
      fetchHouseStats(projectId)
    } else if (!isHouseProject && masterPlanData?.buildings && apartmentsData.length > 0) {
      calculateApartmentStats()
    }
  }, [masterPlanData, apartmentsData, isHouseProject, projectId])

  const fetchApartments = async (pid) => {
    try {
      const aptsRes = await api.get('/apartments', { params: { projectId: pid } })
      const apts = Array.isArray(aptsRes.data) 
        ? aptsRes.data 
        : (aptsRes.data.apartments || aptsRes.data.data || [])
      setApartmentsData(apts)
    } catch (err) {
      console.error('Error fetching apartments:', err)
      setApartmentsData([])
    }
  }

  const fetchHouseStats = async (pid) => {
    setStatsLoading(true)
    try {
      const buildingsRes = await api.get('/buildings', { params: { projectId: pid } })
      const buildings = Array.isArray(buildingsRes.data) 
        ? buildingsRes.data 
        : (buildingsRes.data.buildings || buildingsRes.data.data || [])
      
      setStats({
        totalBuildings: buildings.length,
        totalUnits: buildings.length,
        available: buildings.filter(b => b.effectiveAvailabilityStatus === 'available' || b.status === 'available').length,
        pending: buildings.filter(b => b.effectiveAvailabilityStatus === 'pending' || b.status === 'pending').length,
        sold: buildings.filter(b => b.effectiveAvailabilityStatus === 'sold' || b.effectiveAvailabilityStatus === 'assigned' || b.status === 'sold').length
      })
    } catch (err) {
      console.error('Error fetching house stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const calculateApartmentStats = () => {
    const mpBuildings = masterPlanData?.buildings || []
    const totalBuildings = mpBuildings.length
    const totalUnits = mpBuildings.reduce((sum, b) => sum + (b.totalApartments || 0), 0)
    
    setStats({
      totalBuildings,
      totalUnits,
      available: apartmentsData.filter(u => u.status === 'available').length,
      pending: apartmentsData.filter(u => u.status === 'pending').length,
      sold: apartmentsData.filter(u => u.status === 'sold' || u.status === 'assigned').length
    })
  }

  const preparePolygonsForPreview = () => {
    const buildings = masterPlanData?.buildings || []
    if (!buildings.length) return []
    
    return buildings
      .filter(building => building.polygon && building.polygon.length > 0)
      .map(building => {
        const points = building.polygon.flatMap(point => [point.x, point.y])
        return {
          id: building._id,
          name: building.name,
          points: points,
          color: building.polygonColor || '#4a7c59',
          stroke: building.polygonStrokeColor || '#8CA551',
          strokeWidth: 3,
          opacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.5,
          fill: (building.polygonColor || '#4a7c59') + '88',
        }
      })
  }

  const previewPolygons = preparePolygonsForPreview()

  // ✅ Configuración dinámica de las 4 tarjetas según el tipo de proyecto
  const cardsConfig = isHouseProject 
    ? [
        { icon: <Home />, label: t('inventory.totalHouses', 'Total Casas'), value: stats.totalUnits, color: '#4a7c59' },
        { icon: <CheckCircle />, label: t('inventory.available', 'Disponibles'), value: stats.available, color: '#4caf50' },
        { icon: <Pending />, label: t('inventory.pending', 'Pendientes'), value: stats.pending, color: '#ff9800' },
        { icon: <Sell />, label: t('inventory.sold', 'Vendidas'), value: stats.sold, color: '#f44336' }
      ]
    : [
        { icon: <Business />, label: t('inventory.totalBuildings', 'Total Edificios'), value: stats.totalBuildings, color: '#4a7c59' },
        { icon: <Apartment />, label: t('inventory.totalApts', 'Total Apts'), value: stats.totalUnits, color: '#1976d2' },
        { icon: <CheckCircle />, label: t('inventory.available', 'Disponibles'), value: stats.available, color: '#4caf50' },
        { icon: <Sell />, label: t('inventory.occupied', 'Ocupados (Vend/Pend)'), value: stats.sold + stats.pending, color: '#f44336' }
      ]

  if (mpLoading || statsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={48} sx={{ color: '#4a7c59' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* ✅ Grid de Estadísticas Adaptativo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cardsConfig.map((card, index) => (
          <Grid item xs={6} md={3} key={index}>
            <StatCard 
              icon={card.icon} 
              label={card.label} 
              value={card.value} 
              color={card.color} 
            />
          </Grid>
        ))}
      </Grid>

      {/* Vista del Master Plan */}
      {masterPlanData?.masterPlanImage ? (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Map sx={{ color: '#4a7c59', fontSize: 28 }} />
            <Typography sx={{ 
              fontFamily: '"Courier New", monospace', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              letterSpacing: 1.5, 
              textTransform: 'uppercase',
              color: '#4a7c59'
            }}>
              {t('inventory.masterPlan', 'Master Plan')}
            </Typography>
          </Box>
          
          <Box sx={{ 
            width: '100%', 
            position: 'relative', 
            bgcolor: '#f5f5f5', 
            borderRadius: 2, 
            overflow: 'hidden', 
            minHeight: 500,
            border: '1px solid #e0e0e0'
          }}>
            <PolygonImagePreview
              imageUrl={masterPlanData.masterPlanImage}
              polygons={previewPolygons}
              maxWidth={1200}
              maxHeight={800}
              showLabels={true}
              onPolygonClick={(poly) => console.log('Edificio seleccionado:', poly)}
              onPolygonHover={(polyId) => console.log('Edificio hover:', polyId)}
            />
          </Box>
          
          {previewPolygons.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {previewPolygons.slice(0, 6).map((poly) => (
                <Box key={poly.id} display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: poly.color, border: `2px solid ${poly.stroke}`, opacity: 0.7 }} />
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#555', fontWeight: 600 }}>
                    {poly.name}
                  </Typography>
                </Box>
              ))}
              {previewPolygons.length > 6 && (
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', fontStyle: 'italic' }}>
                  +{previewPolygons.length - 6} más
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa', textAlign: 'center' }}>
          <Map sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', color: '#888' }}>
            {t('inventory.noMasterPlan', 'No hay imagen del Master Plan disponible para este proyecto.')}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}