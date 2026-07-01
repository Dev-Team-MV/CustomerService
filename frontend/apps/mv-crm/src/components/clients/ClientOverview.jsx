// apps/mv-crm/src/components/clients/ClientOverview.jsx
import { Box, Typography, Paper, Avatar, Chip, LinearProgress } from '@mui/material'
import { Email, Phone, CalendarToday, Person, Business, Home, Apartment } from '@mui/icons-material'

const ClientOverview = ({ client, properties }) => {
  // Calcular totales
  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0)
  const totalBalance = properties.reduce((sum, p) => sum + (p.balance || 0), 0)
  const totalPaid = totalValue - totalBalance

  return (
    <Box sx={{ p: 3 }}>
      {/* ═══════════════════════════════════════════════════════════
          DATOS PERSONALES
          ═══════════════════════════════════════════════════════════ */}
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
          Información Personal
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
                label={client.role}
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

      {/* ═══════════════════════════════════════════════════════════
          RESUMEN DE PROPIEDADES
          ═══════════════════════════════════════════════════════════ */}
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
            Total Propiedades
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
            Valor Total
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
            Pagado
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
            Pendiente
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

      {/* ═══════════════════════════════════════════════════════════
          LISTA DE PROPIEDADES
          ═══════════════════════════════════════════════════════════ */}
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
        Propiedades ({properties.length})
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
            No tiene propiedades asignadas
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {properties.map((property) => {
            const isApartment = property.type === 'apartment'
            const propertyLabel = isApartment
              ? `Apto ${property.apartmentNumber}`
              : `Lote ${property.lotNumber}`
            
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
                        <Business sx={{ fontSize: 14, color: '#888' }} />
                        <Typography
                          sx={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.7rem',
                            color: '#888',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {property.projectName}
                        </Typography>
                        
                        {isApartment && property.buildingName && (
                          <>
                            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
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
                          </>
                        )}
                        
                        {isApartment && property.floorNumber && (
                          <>
                            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>•</Typography>
                            <Typography
                              sx={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '0.7rem',
                                color: '#888',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Piso {property.floorNumber}
                            </Typography>
                          </>
                        )}
                      </Box>
                      
                      {property.modelName && (
                        <Typography
                          sx={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.65rem',
                            color: '#aaa',
                            letterSpacing: '0.5px',
                            mt: 0.3
                          }}
                        >
                          Modelo: {property.modelName}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box textAlign="right">
                    <Chip
                      label={property.status === 'sold' ? 'Vendido' : 'Pendiente'}
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
                      Precio: ${property.price?.toLocaleString() || 0}
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
                      {property.balance > 0 ? 'Pendiente: ' : 'Pagado: '}${property.balance?.toLocaleString() || 0}
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
                        Progreso de pago
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
      )}
    </Box>
  )
}

export default ClientOverview