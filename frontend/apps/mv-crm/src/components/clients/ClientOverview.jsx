// apps/mv-crm/src/components/clients/ClientOverview.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Paper, Avatar, Chip, LinearProgress } from '@mui/material'
import { Email, Phone, CalendarToday, Person, Business, Home, Apartment } from '@mui/icons-material'

const ClientOverview = ({ client, properties }) => {
  const { t } = useTranslation('residents')

  // Calcular totales
  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0)
  const totalBalance = properties.reduce((sum, p) => sum + (p.balance || 0), 0)
  const totalPaid = totalValue - totalBalance

  // Agrupar propiedades por proyecto
  const propertiesByProject = properties.reduce((acc, prop) => {
    const projectName = prop.projectName || t('overview.noProject', 'Sin proyecto')
    if (!acc[projectName]) {
      acc[projectName] = []
    }
    acc[projectName].push(prop)
    return acc
  }, {})

  return (
    <Box sx={{ p: 3 }}>
      {/* DATOS PERSONALES */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid #ececec',
          borderRadius: 1,
          bgcolor: '#fff'
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.7rem',
            color: '#888',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            mb: 2
          }}
        >
          {t('overview.personalInfo')}
        </Typography>

        <Box display="flex" gap={3} flexWrap="wrap">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#000',
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: '"Courier New", monospace'
            }}
          >
            {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
          </Avatar>

          <Box flex={1} display="flex" flexDirection="column" gap={1.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Email sx={{ fontSize: 18, color: '#888' }} />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.85rem',
                  color: '#444',
                  letterSpacing: '0.5px'
                }}
              >
                {client.email}
              </Typography>
            </Box>

            {client.phoneNumber && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <Phone sx={{ fontSize: 18, color: '#888' }} />
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.85rem',
                    color: '#444',
                    letterSpacing: '0.5px'
                  }}
                >
                  {client.phoneNumber}
                </Typography>
              </Box>
            )}

            {client.birthday && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <CalendarToday sx={{ fontSize: 18, color: '#888' }} />
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.85rem',
                    color: '#444',
                    letterSpacing: '0.5px'
                  }}
                >
                  {new Date(client.birthday).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1.5}>
              <Person sx={{ fontSize: 18, color: '#888' }} />
              <Chip
                label={t(`role.${client.role}`, client.role)}
                size="small"
                sx={{
                  bgcolor: '#f5f5f5',
                  color: '#666',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* MEMBRESÍAS DE PROYECTO */}
      {client.projectMemberships && client.projectMemberships.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid #ececec',
            borderRadius: 1,
            bgcolor: '#fff'
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#888',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              mb: 2
            }}
          >
            {t('overview.relatedProjects')} ({client.projectMemberships.length})
          </Typography>

          <Box display="flex" gap={1.5} flexWrap="wrap">
            {client.projectMemberships.map((membership, idx) => (
              <Paper
                key={membership._id || idx}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: '1px solid #ececec',
                  borderRadius: 1,
                  bgcolor: '#fafafa',
                  minWidth: 200
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Business sx={{ fontSize: 16, color: '#2196f3' }} />
                  <Typography
                    sx={{
                      fontFamily: '"Helvetica Neue", sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#000'
                    }}
                  >
                    {t('overview.project', { number: idx + 1 })}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    color: '#666',
                    letterSpacing: '0.5px'
                  }}
                >
                  ID: {membership.project?.substring(0, 8)}...
                </Typography>
                <Chip
                  label={membership.role}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                />
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      {/* RESUMEN DE PROPIEDADES */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid #ececec',
          borderRadius: 1,
          bgcolor: '#fafafa',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}
      >
        <Box textAlign="center">
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {t('overview.totalProperties')}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#000'
            }}
          >
            {totalProperties}
          </Typography>
        </Box>

        <Box textAlign="center">
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {t('overview.totalValue')}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#000'
            }}
          >
            ${totalValue.toLocaleString()}
          </Typography>
        </Box>

        <Box textAlign="center">
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {t('overview.paid')}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#4caf50'
            }}
          >
            ${totalPaid.toLocaleString()}
          </Typography>
        </Box>

        <Box textAlign="center">
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {t('overview.pending')}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: totalBalance > 0 ? '#d32f2f' : '#4caf50'
            }}
          >
            ${totalBalance.toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      {/* PROPIEDADES AGRUPADAS POR PROYECTO */}
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          color: '#888',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          mb: 2
        }}
      >
        {t('overview.properties')} ({properties.length})
      </Typography>

      {properties.length === 0 ? (
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            border: '1px dashed #ececec',
            borderRadius: 1
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              color: '#aaa',
              letterSpacing: '0.5px'
            }}
          >
            {t('overview.noProperties')}
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          {Object.entries(propertiesByProject).map(([projectName, projectProperties]) => (
            <Box key={projectName}>
              {/* Header del proyecto */}
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Business sx={{ fontSize: 18, color: '#2196f3' }} />
                <Typography
                  sx={{
                    fontFamily: '"Helvetica Neue", sans-serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#000'
                  }}
                >
                  {projectName}
                </Typography>
                <Chip
                  label={`${projectProperties.length} ${projectProperties.length === 1 ? t('overview.property') : t('overview.propertiesPlural')}`}
                  size="small"
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Propiedades del proyecto */}
              <Box display="flex" flexDirection="column" gap={1.5} pl={1}>
                {projectProperties.map((property) => {
                  const isApartment = property.type === 'apartment'
                  const propertyLabel = isApartment
                    ? t('overview.apartment', { number: property.apartmentNumber })
                    : t('overview.lot', { number: property.lotNumber })
                  
                  const progress = property.price > 0 
                    ? ((property.price - property.balance) / property.price) * 100 
                    : 0

                  return (
                    <Paper
                      key={property._id}
                      elevation={0}
                      sx={{
                        p: 2,
                        border: '1px solid #ececec',
                        borderRadius: 1,
                        bgcolor: '#fafafa',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          borderColor: '#000'
                        }
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Box display="flex" gap={1.5} alignItems="flex-start">
                          {isApartment ? (
                            <Apartment sx={{ fontSize: 24, color: '#2196f3' }} />
                          ) : (
                            <Home sx={{ fontSize: 24, color: '#4caf50' }} />
                          )}
                          
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: '"Helvetica Neue", sans-serif',
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#000',
                                mb: 0.5
                              }}
                            >
                              {propertyLabel}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              {isApartment && property.buildingName && (
                                <>
                                  <Typography
                                    sx={{
                                      fontFamily: '"Courier New", monospace',
                                      fontSize: '0.7rem',
                                      color: '#888',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    {property.buildingName}
                                  </Typography>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
                                </>
                              )}
                              
                              {isApartment && property.floorNumber && (
                                <>
                                  <Typography
                                    sx={{
                                      fontFamily: '"Courier New", monospace',
                                      fontSize: '0.7rem',
                                      color: '#888',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    {t('overview.floor', { number: property.floorNumber })}
                                  </Typography>
                                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
                                </>
                              )}

                              {property.modelName && (
                                <Typography
                                  sx={{
                                    fontFamily: '"Courier New", monospace',
                                    fontSize: '0.7rem',
                                    color: '#888',
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  {property.modelName}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        <Box textAlign="right">
                          <Chip
                            label={property.status === 'sold' ? t('overview.sold') : t('overview.pendingStatus')}
                            size="small"
                            sx={{
                              bgcolor: property.status === 'sold' ? '#e8f5e9' : '#fff3e0',
                              color: property.status === 'sold' ? '#2e7d32' : '#f57c00',
                              fontFamily: '"Courier New", monospace',
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              mb: 1
                            }}
                          />
                          
                          <Typography
                            sx={{
                              fontFamily: '"Helvetica Neue", sans-serif',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#666'
                            }}
                          >
                            {t('overview.price')}: ${property.price?.toLocaleString() || 0}
                          </Typography>
                          
                          <Typography
                            sx={{
                              fontFamily: '"Helvetica Neue", sans-serif',
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: property.balance > 0 ? '#d32f2f' : '#4caf50',
                              letterSpacing: '-0.02em',
                              mt: 0.5
                            }}
                          >
                            {property.balance > 0 ? `${t('overview.pendingAmount')}: ` : `${t('overview.paidAmount')}: `}${property.balance?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Barra de progreso */}
                      {property.price > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography
                              sx={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '0.6rem',
                                color: '#888',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {t('overview.paymentProgress')}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '0.6rem',
                                color: '#888',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {progress.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: progress === 100 ? '#4caf50' : '#2196f3',
                                borderRadius: 3
                              }
                            }}
                          />
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