// apps/mv-crm/src/components/clients/ClientOverview.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Paper, Avatar, Chip, LinearProgress, useMediaQuery, useTheme } from '@mui/material'
import { Email, Phone, CalendarToday, Person, Business, Home, Apartment, LocationOn } from '@mui/icons-material'

const ClientOverview = ({ client, properties }) => {
  const { t } = useTranslation('residents')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0)
  const totalBalance = properties.reduce((sum, p) => sum + (p.balance || 0), 0)
  const totalPaid = totalValue - totalBalance

  const propertiesByProject = properties.reduce((acc, prop) => {
    const projectName = prop.projectName || t('overview.noProject', 'Sin proyecto')
    if (!acc[projectName]) acc[projectName] = []
    acc[projectName].push(prop)
    return acc
  }, {})

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* DATOS PERSONALES */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff' }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
          {t('overview.personalInfo')}
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} flexWrap="wrap">
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#000', borderRadius: 0, fontSize: '1.5rem', fontWeight: 700, fontFamily: '"Courier New", monospace' }}>
            {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
          </Avatar>

          <Box flex={1} display="flex" flexDirection="column" gap={1.5} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Email sx={{ fontSize: 18, color: '#888' }} />
              <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444', wordBreak: 'break-all' }}>
                {client.email}
              </Typography>
            </Box>

            {client.country && (
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <LocationOn sx={{ fontSize: 18, color: '#888' }} />
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444' }}>
                  {client.country}
                </Typography>
              </Box>
            )}
            {client.phoneNumber && (
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Phone sx={{ fontSize: 18, color: '#888' }} />
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444' }}>
                  {client.phoneNumber}
                </Typography>
              </Box>
            )}

            {client.birthday && (
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <CalendarToday sx={{ fontSize: 18, color: '#888' }} />
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444' }}>
                  {new Date(client.birthday).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Person sx={{ fontSize: 18, color: '#888' }} />
              <Chip label={t(`role.${client.role}`, client.role)} size="small" sx={{ borderRadius: 0, bgcolor: '#f5f5f5', color: '#666', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }} />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* MEMBRESÍAS DE PROYECTO */}
      {client.projectMemberships && client.projectMemberships.length > 0 && (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff' }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
            {t('overview.relatedProjects')} ({client.projectMemberships.length})
          </Typography>

          <Box display="flex" gap={1.5} flexWrap="wrap">
            {client.projectMemberships.map((membership, idx) => (
              <Paper key={membership._id || idx} elevation={0} sx={{ p: 1.5, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fafafa', minWidth: { xs: '100%', sm: 200 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Business sx={{ fontSize: 16, color: '#2196f3' }} />
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#000' }}>
                    {t('overview.project', { number: idx + 1 })}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#666', letterSpacing: '0.5px' }}>
                  ID: {membership.project?.substring(0, 8)}...
                </Typography>
                <Chip label={membership.role} size="small" sx={{ mt: 0.5, borderRadius: 0, bgcolor: '#e3f2fd', color: '#1976d2', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }} />
              </Paper>
            ))}
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
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {stat.label}
            </Typography>
            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: { xs: '1.2rem', sm: '1.5rem' }, fontWeight: 700, color: stat.color, wordBreak: 'break-word' }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* PROPIEDADES AGRUPADAS POR PROYECTO */}
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
        {t('overview.properties')} ({properties.length})
      </Typography>

      {properties.length === 0 ? (
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
                              {isApartment && property.buildingName && (
                                <>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '0.5px' }}>{property.buildingName}</Typography>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
                                </>
                              )}
                              {isApartment && property.floorNumber && (
                                <>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '0.5px' }}>{t('overview.floor', { number: property.floorNumber })}</Typography>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
                                </>
                              )}
                              {property.modelName && (
                                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '0.5px' }}>{property.modelName}</Typography>
                              )}
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
                            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#888', letterSpacing: '0.5px' }}>{t('overview.paymentProgress')}</Typography>
                            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#888', letterSpacing: '0.5px' }}>{progress.toFixed(1)}%</Typography>
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