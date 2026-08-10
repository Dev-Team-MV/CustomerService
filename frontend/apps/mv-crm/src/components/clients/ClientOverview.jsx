// apps/mv-crm/src/components/clients/ClientOverview.jsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Paper, Avatar, Chip, LinearProgress, useMediaQuery, useTheme } from '@mui/material'
import { Email, Phone, CalendarToday, Person, Business, Home, Apartment, LocationOn } from '@mui/icons-material'

// ✅ Hooks importados
import { useProjects } from '@shared/hooks/useProjects'
import { useResolvedProperties } from '../../constants/hooks/useResolvedProperties' // Ajusta la ruta si es necesario

const ClientOverview = ({ client, properties: rawProperties }) => {
  const { t } = useTranslation('residents')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // ✅ 1. Hook para obtener la lista de proyectos y resolver nombres
  const { projects } = useProjects()
  
  // ✅ 2. Hook para enriquecer las propiedades con sus datos completos (lotes, aptos, modelos, etc.)
  const { propertiesMap, loading: loadingResolved } = useResolvedProperties(rawProperties || [])

  // Enriquecemos las propiedades con los datos resueltos del hook
  const enrichedProperties = useMemo(() => {
    if (!rawProperties) return []
    return rawProperties.map(item => {
      let enriched = { ...item }
      
      // Resolver Lote / Propiedad
      const propRef = item.propertyId || item.property || item._id
      if (propRef && propertiesMap.lots[propRef]) {
        enriched = { ...enriched, ...propertiesMap.lots[propRef] }
      }

      // Resolver Apartamento
      const aptRef = item.apartmentId || item.apartment
      if (aptRef && propertiesMap.apartments[aptRef]) {
        enriched = { ...enriched, ...propertiesMap.apartments[aptRef] }
        
        // Resolver Edificio asociado al apartamento
        const bldgRef = enriched.building || (propertiesMap.apartments[aptRef]?.building)
        if (bldgRef && propertiesMap.buildings[bldgRef]) {
          enriched.buildingData = propertiesMap.buildings[bldgRef]
        }
      }

      // Resolver Modelo
      const modelRef = enriched.model || item.modelId
      if (modelRef && propertiesMap.models[modelRef]) {
        enriched = { ...enriched, ...propertiesMap.models[modelRef] }
      }

      return enriched
    })
  }, [rawProperties, propertiesMap])

  // Función auxiliar para obtener el nombre real del proyecto
  const getProjectName = (projectRef) => {
    if (!projectRef) return t('overview.noProject', 'Sin proyecto')
    if (typeof projectRef === 'object' && projectRef.name) return projectRef.name
    const found = projects.find(p => p._id === projectRef || p._id === projectRef?._id)
    return found ? found.name : (typeof projectRef === 'string' ? projectRef : t('overview.unknownProject'))
  }

  const totalProperties = enrichedProperties.length
  const totalValue = enrichedProperties.reduce((sum, p) => sum + (p.price || 0), 0)
  const totalBalance = enrichedProperties.reduce((sum, p) => sum + (p.balance || 0), 0)
  const totalPaid = totalValue - totalBalance

  const propertiesByProject = enrichedProperties.reduce((acc, prop) => {
    const projectName = prop.projectName || getProjectName(prop.projectId) || t('overview.noProject', 'Sin proyecto')
    if (!acc[projectName]) acc[projectName] = []
    acc[projectName].push(prop)
    return acc
  }, {})

  if (loadingResolved) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#888' }}>
          {t('overview.loading', 'Cargando información...')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* DATOS PERSONALES */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff' }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
          {t('overview.personalInfo')}
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} flexWrap="wrap">
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#000', borderRadius: 0, fontSize: '1.5rem', fontWeight: 700, fontFamily: '"Courier New", monospace' }}>
            {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
          </Avatar>

          <Box flex={1} display="flex" flexDirection="column" gap={1.5} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Email sx={{ fontSize: 18, color: '#000000ff' }} />
              <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444', wordBreak: 'break-all' }}>
                {client.email}
              </Typography>
            </Box>

            {client.country && (
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <LocationOn sx={{ fontSize: 18, color: '#000000ff' }} />
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444' }}>
                  {client.country}
                </Typography>
              </Box>
            )}
            {client.phoneNumber && (
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Phone sx={{ fontSize: 18, color: '#000000ff' }} />
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444' }}>
                  {client.phoneNumber}
                </Typography>
              </Box>
            )}

            {client.birthday && (
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <CalendarToday sx={{ fontSize: 18, color: '#000000ff' }} />
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444' }}>
                  {new Date(client.birthday).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Person sx={{ fontSize: 18, color: '#000000ff' }} />
              <Chip label={t(`role.${client.role}`, client.role)} size="small" sx={{ borderRadius: 0, bgcolor: '#f5f5f5', color: '#666', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }} />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ✅ MEMBRESÍAS DE PROYECTO (CORREGIDO CON NOMBRES REALES) */}
      {client.projectMemberships && client.projectMemberships.length > 0 && (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff' }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
            {t('overview.relatedProjects')} ({client.projectMemberships.length})
          </Typography>

          <Box display="flex" gap={1.5} flexWrap="wrap">
            {client.projectMemberships.map((membership, idx) => {
              const projectName = getProjectName(membership.project)
              const projectId = typeof membership.project === 'object' ? membership.project._id : membership.project

              return (
                <Paper key={membership._id || idx} elevation={0} sx={{ p: 1.5, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fafafa', minWidth: { xs: '100%', sm: 200 }, transition: 'all 0.2s', '&:hover': { borderColor: '#000' } }}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Business sx={{ fontSize: 16, color: '#2196f3', flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#000', wordBreak: 'break-word' }}>
                      {projectName}
                    </Typography>
                  </Box>
                  
                  {projectId && (
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#888', letterSpacing: '0.5px', mb: 0.5 }}>
                      ID: {projectId}
                    </Typography>
                  )}
                  
                  <Chip 
                    label={membership.role} 
                    size="small" 
                    sx={{ 
                      borderRadius: 0, 
                      bgcolor: membership.role === 'admin' ? '#000' : '#e3f2fd', 
                      color: membership.role === 'admin' ? '#fff' : '#1976d2', 
                      fontFamily: '"Courier New", monospace', 
                      fontSize: '0.65rem', 
                      fontWeight: 600, 
                      textTransform: 'uppercase' 
                    }} 
                  />
                </Paper>
              )
            })}
          </Box>
        </Paper>
      )}

      {/* RESUMEN DE PROPIEDADES (Responsive Grid) */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fafafa', display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'space-between', sm: 'space-around' }, gap: 2 }}>
        {[
          { label: t('overview.totalProperties'), value: totalProperties, color: '#000' },
          { label: t('overview.totalValue'), value: `$${totalValue.toLocaleString()}`, color: '#000' },
          { label: t('overview.paid'), value: `$${totalPaid.toLocaleString()}`, color: '#4caf50' },
          { label: t('overview.pending'), value: `$${totalBalance.toLocaleString()}`, color: totalBalance > 0 ? '#d32f2f' : '#4caf50' }
        ].map((stat, idx) => (
          <Box key={idx} textAlign="center" sx={{ flex: { xs: '1 1 45%', sm: '1 1 20%' } }}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000000ff', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {stat.label}
            </Typography>
            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: { xs: '1.2rem', sm: '1.5rem' }, fontWeight: 700, color: stat.color, wordBreak: 'break-word' }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* PROPIEDADES AGRUPADAS POR PROYECTO */}
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
        {t('overview.properties')} ({enrichedProperties.length})
      </Typography>

      {enrichedProperties.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center', border: '1px dashed #ececec', borderRadius: 0 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#aaa', letterSpacing: '0.5px' }}>
            {t('overview.noProperties')}
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          {Object.entries(propertiesByProject).map(([projectName, projectProperties]) => (
            <Box key={projectName}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5} flexWrap="wrap">
                <Business sx={{ fontSize: 18, color: '#2196f3' }} />
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1rem', fontWeight: 600, color: '#000' }}>
                  {projectName}
                </Typography>
                <Chip label={`${projectProperties.length} ${projectProperties.length === 1 ? t('overview.property') : t('overview.propertiesPlural')}`} size="small" sx={{ borderRadius: 0, bgcolor: '#e3f2fd', color: '#1976d2', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600 }} />
              </Box>

              <Box display="flex" flexDirection="column" gap={1.5} pl={{ xs: 0, sm: 1 }}>
                {projectProperties.map((property) => {
                  const isApartment = property.type === 'apartment'
                  const propertyLabel = isApartment ? t('overview.apartment', { number: property.apartmentNumber }) : t('overview.lot', { number: property.lotNumber })
                  const progress = property.price > 0 ? ((property.price - property.balance) / property.price) * 100 : 0

                  return (
                    <Paper key={property._id} elevation={0} sx={{ p: 2, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fafafa', transition: 'all 0.2s', '&:hover': { boxShadow: '4px 4px 0px rgba(0,0,0,0.08)', borderColor: '#000' } }}>
                      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-start' }} gap={2} mb={1.5}>
                        <Box display="flex" gap={1.5} alignItems="flex-start" flex={1}>
                          {isApartment ? <Apartment sx={{ fontSize: 24, color: '#2196f3', flexShrink: 0 }} /> : <Home sx={{ fontSize: 24, color: '#4caf50', flexShrink: 0 }} />}
                          
                          <Box>
                            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1rem', fontWeight: 600, color: '#000', mb: 0.5 }}>
                              {propertyLabel}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              {isApartment && property.buildingData?.name && (
                                <>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '0.5px' }}>{property.buildingData.name}</Typography>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
                                </>
                              )}
                              {isApartment && property.floorNumber && (
                                <>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '0.5px' }}>{t('overview.floor', { number: property.floorNumber })}</Typography>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
                                </>
                              )}
                              {property.modelName || property.model?.name ? (
                                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '0.5px' }}>{property.modelName || property.model?.name}</Typography>
                              ) : null}
                            </Box>
                          </Box>
                        </Box>

                        <Box textAlign={{ xs: 'left', sm: 'right' }} width={{ xs: '100%', sm: 'auto' }}>
                          <Chip label={property.status === 'sold' ? t('overview.sold') : t('overview.pendingStatus')} size="small" sx={{ borderRadius: 0, bgcolor: property.status === 'sold' ? '#e8f5e9' : '#fff3e0', color: property.status === 'sold' ? '#2e7d32' : '#f57c00', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600, mb: 1 }} />
                          
                          <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
                            {t('overview.price')}: ${property.price?.toLocaleString() || 0}
                          </Typography>
                          
                          <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1.1rem', fontWeight: 700, color: property.balance > 0 ? '#d32f2f' : '#4caf50', letterSpacing: '-0.02em', mt: 0.5 }}>
                            {property.balance > 0 ? `${t('overview.pendingAmount')}: ` : `${t('overview.paidAmount')}: `}${property.balance?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Box>

                      {property.price > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000000ff', letterSpacing: '0.5px' }}>{t('overview.paymentProgress')}</Typography>
                            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000000ff', letterSpacing: '0.5px' }}>{progress.toFixed(1)}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 0, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { borderRadius: 0, bgcolor: progress === 100 ? '#4caf50' : '#2196f3' } }} />
                        </Box>
                      )}
                    </Paper>
                  )
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ClientOverview