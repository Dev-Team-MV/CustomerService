import { useState, useEffect, useMemo } from 'react'
import { 
  Box, Tabs, Tab, Paper, Typography, Grid, 
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Button, Alert
} from '@mui/material'
import { TrendingUp, AttachMoney, EmojiEvents, Add, Warning } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import { useReferrals } from '../../../../shared/hooks/useReferrals'
import { useReferralStats } from '../../../../shared/hooks/useReferralStats'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useReferralColumns } from '../constants/Columns/useReferralColumns'
import referralService from '../../../../shared/services/referralService'
import api from '@shared/services/api'
import { getProjectById } from '@shared/config/projectsConfig'

import ReferralProgramConfig from '../components/referrals/ReferralProgramConfig'
import ReferrerLeaderboard from '../components/referrals/ReferrerLeaderboard'
import SubmitReferralModal from '../../../../shared/components/referrals/SubmitReferralModal'

export default function Referrals() {
  const { t } = useTranslation('referrals')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)

  const [tabValue, setTabValue] = useState(0)
  const [filters, setFilters] = useState({ projectId: '', status: '' })
  
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [actionType, setActionType] = useState('')
  
  const [convertPropertyId, setConvertPropertyId] = useState('')
  const [rewardAmount, setRewardAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [projectType, setProjectType] = useState('houses')
  const [properties, setProperties] = useState([]) // Propiedades del REFERIDO (para convertir)
  const [referrerProperties, setReferrerProperties] = useState([]) // Propiedades del REFERIDOR (para aprobar descuento)
  const [propertiesLoading, setPropertiesLoading] = useState(false)

  // Estado específico para el formulario de aprobación de recompensa
  const [approveFormData, setApproveFormData] = useState({
    discountBase: 'original_100',
    rewardPropertyId: '',
    rewardApartmentId: '',
    discountPercent: ''
  })

  const { data: referrals, loading: referralsLoading, refresh: refreshReferrals } = useReferrals(filters)
  const { stats, loading: statsLoading } = useReferralStats(filters.projectId)

  const referrerMap = useMemo(() => {
    const map = {}
    residents.forEach(r => { map[r._id] = `${r.firstName} ${r.lastName}` })
    return map
  }, [residents])

  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }))

  const openActionModal = async (referral, type) => {
    setSelectedReferral(referral)
    setActionType(type)
    setPropertiesLoading(true)
    setProperties([])
    setReferrerProperties([])
    
    const projectId = typeof referral.projectId === 'object' ? referral.projectId._id : referral.projectId
    const projectConfig = getProjectById(projectId)
    const isHouses = projectConfig?.catalogType === 'houses' || projectConfig?.resourceType === 'property'
    setProjectType(isHouses ? 'houses' : 'apartments')
    
    try {
      const endpoint = isHouses ? '/properties' : '/apartments'
      const response = await api.get(endpoint, { params: { projectId } })
      const data = Array.isArray(response.data) ? response.data : (response.data.properties || response.data.apartments || response.data.data || [])
      
      if (type === 'convert') {
        // Filtrar propiedades del REFERIDO
        const targetEmail = (referral.referredEmail || referral.referredLeadId?.email)?.toLowerCase().trim()
        const targetPhone = (referral.referredPhone || referral.referredLeadId?.phone)?.trim()
        
        const filteredData = data.filter(res => {
          if (!Array.isArray(res.users) || res.users.length === 0) return false
          return res.users.some(u => {
            if (typeof u !== 'object' || u === null) return false
            const uEmail = u.email?.toLowerCase().trim()
            const uPhone = (u.phoneNumber || u.phone)?.trim()
            return (targetEmail && uEmail === targetEmail) || (targetPhone && uPhone === targetPhone)
          })
        })
        setProperties(filteredData)
        setConvertPropertyId(referral.conversionPropertyId || referral.conversionApartmentId || '')
        
      } else if (type === 'approve') {
        // Filtrar propiedades del REFERIDOR
        const referrerId = typeof referral.referrerId === 'object' ? referral.referrerId._id : referral.referrerId
        
        const referrerFilteredData = data.filter(res => {
          if (Array.isArray(res.users)) {
            return res.users.some(u => (typeof u === 'object' ? u._id : u) === referrerId)
          }
          return false
        })
        setReferrerProperties(referrerFilteredData)
        setRewardAmount(referral.rewardAmount || '')
        
        // Resetear formulario de aprobación
        setApproveFormData({
          discountBase: 'original_100',
          rewardPropertyId: referral.rewardPropertyId || '',
          rewardApartmentId: referral.rewardApartmentId || '',
          discountPercent: referral.discountPercent || ''
        })
      }
    } catch (err) {
      console.error('❌ Error al obtener propiedades:', err)
    } finally {
      setPropertiesLoading(false)
      setActionModalOpen(true)
    }
  }

  const handleActionSubmit = async () => {
    if (!selectedReferral) return
    setSubmitting(true)
    try {
      if (actionType === 'convert') {
        const convertPayload = {}
        if (projectType === 'houses') {
          convertPayload.propertyId = convertPropertyId
        } else {
          convertPayload.apartmentId = convertPropertyId
        }
        await referralService.convert(selectedReferral._id, convertPayload)
        
      } else if (actionType === 'approve') {
        const payload = {
          rewardType: selectedReferral.rewardType || 'cash'
        }

        if (selectedReferral.rewardType === 'cash') {
          payload.rewardAmount = Number(rewardAmount)
        } else if (selectedReferral.rewardType === 'property_discount') {
          payload.discountBase = approveFormData.discountBase
          
          if (approveFormData.discountPercent) {
            payload.discountPercent = Number(approveFormData.discountPercent)
          }
          
          if (projectType === 'houses') {
            payload.rewardPropertyId = approveFormData.rewardPropertyId
          } else {
            payload.rewardApartmentId = approveFormData.rewardApartmentId
          }
        }
        
        await referralService.approveReward(selectedReferral._id, payload)
      }
      setActionModalOpen(false)
      refreshReferrals()
    } catch (err) {
      console.error('Error en acción de referido:', err)
      alert(err.response?.data?.message || 'Error al procesar la acción')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateSuccess = () => {
    setCreateModalOpen(false)
    refreshReferrals()
  }

  const columns = useReferralColumns({ t, referrerMap, projects, onAction: openActionModal })
  const conversionRate = stats?.total > 0 ? (((stats.byStatus?.converted || 0) / stats.total) * 100).toFixed(1) : 0

  return (
    <PageLayout title={t('page.title')} subtitle={t('page.subtitle')}>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #ececec', px: 2, bgcolor: '#fafafa' }}>
          <Tab label={t('page.title', 'Referidos')} />
          <Tab label={t('leaderboard.title', 'Tabla de Líderes')} />
          <Tab label={t('program.title', 'Configuración')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e3f2fd' }}>
                    <TrendingUp color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('stats.total')}</Typography>
                      <Typography variant="h5" fontWeight={700}>{statsLoading ? '...' : (stats?.total ?? 0)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8f5e9' }}>
                    <EmojiEvents color="success" fontSize="large" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('stats.conversionRate')}</Typography>
                      <Typography variant="h5" fontWeight={700}>{statsLoading ? '...' : `${conversionRate}%`}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff3e0' }}>
                    <AttachMoney color="warning" fontSize="large" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('stats.rewardsPaid')}</Typography>
                      <Typography variant="h5" fontWeight={700}>{statsLoading ? '...' : `$${stats?.rewardsPaid ?? 0}`}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>{t('columns.project')}</InputLabel>
                  <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('columns.project')}>
                    <MenuItem value="">{t('stats.allProjects', 'Todos los Proyectos')}</MenuItem>
                    {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>{t('columns.status')}</InputLabel>
                  <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} label={t('columns.status')}>
                    <MenuItem value="">{t('statuses.all', 'Todos')}</MenuItem>
                    {['pending', 'contacted', 'qualified', 'converted', 'reward_pending', 'reward_paid', 'expired'].map(s => (
                      <MenuItem key={s} value={s}>{t(`statuses.${s}`, s)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" startIcon={<Add />} onClick={() => setCreateModalOpen(true)}>
                  {t('actions.createReferral', 'Nuevo Referido')}
                </Button>
              </Box>

              <DataTable columns={columns} data={referrals || []} loading={referralsLoading} />
            </Box>
          )}

          {tabValue === 1 && <ReferrerLeaderboard referrals={referrals || []} residents={residents} />}
          {tabValue === 2 && <ReferralProgramConfig projects={projects} />}
        </Box>
      </Paper>

      <SubmitReferralModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={handleCreateSuccess} mode="crm" />

      {/* Modal de Acción (Convertir / Aprobar) */}
      <Dialog open={actionModalOpen} onClose={() => setActionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'convert' ? t('actions.convert', 'Marcar como Venta') : t('actions.approveReward', 'Aprobar Recompensa')}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>{t('actions.referralInfo', 'Información del Referido')}</strong></Typography>
              <Typography variant="body2"><strong>{t('actions.name', 'Nombre')}:</strong> {selectedReferral?.referredName || 'N/A'}</Typography>
              <Typography variant="body2"><strong>{t('actions.phone', 'Teléfono')}:</strong> {selectedReferral?.referredPhone || 'N/A'}</Typography>
            </Box>
            
            {/* ================= CONVERTIR ================= */}
            {actionType === 'convert' && (
              <FormControl fullWidth required>
                <InputLabel>{t('actions.propertyId', 'Propiedad Comprada (Referido)')}</InputLabel>
                <Select value={convertPropertyId} onChange={(e) => setConvertPropertyId(e.target.value)} label={t('actions.propertyId', 'Propiedad Comprada (Referido)')} disabled={propertiesLoading}>
                  {propertiesLoading ? (
                    <MenuItem value=""><em>{t('loading', 'Cargando...')}</em></MenuItem>
                  ) : properties.length === 0 ? (
                    <MenuItem value=""><em>{t('noProperties', 'No hay propiedades asignadas a este usuario')}</em></MenuItem>
                  ) : (
                    properties.map(property => {
                      const label = projectType === 'houses' 
                        ? `Lote ${property.lot?.number || property.lot || 'N/A'} ${property.model?.model || property.model?.name ? `- ${property.model.model || property.model.name}` : ''}`
                        : `Apto ${property.apartmentNumber || 'N/A'} ${property.floorNumber ? `(Piso ${property.floorNumber})` : ''}`
                      return <MenuItem key={property._id} value={property._id}>{label}</MenuItem>
                    })
                  )}
                </Select>
              </FormControl>
            )}

            {/* ================= APROBAR RECOMPENSA ================= */}
            {actionType === 'approve' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedReferral?.rewardType === 'property_discount' ? (
                  <>
                    <Alert severity="info" sx={{ mb: 1 }}>
                      {t('actions.discountInfo', 'Seleccione la propiedad del referidor sobre la cual se aplicará el descuento.')}
                    </Alert>
                    
                    <FormControl fullWidth required>
                      <InputLabel>{t('actions.discountBase', 'Base del Descuento')}</InputLabel>
                      <Select 
                        value={approveFormData.discountBase} 
                        onChange={(e) => setApproveFormData(prev => ({ ...prev, discountBase: e.target.value }))}
                        label={t('actions.discountBase', 'Base del Descuento')}
                      >
                        <MenuItem value="original_100">100% del Precio Original</MenuItem>
                        <MenuItem value="after_first_10">Después del primer 10%</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required error={referrerProperties.length === 0}>
                      <InputLabel>{projectType === 'houses' ? 'Lote del Referidor' : 'Apartamento del Referidor'}</InputLabel>
                      <Select 
                        value={projectType === 'houses' ? approveFormData.rewardPropertyId : approveFormData.rewardApartmentId} 
                        onChange={(e) => {
                          if (projectType === 'houses') {
                            setApproveFormData(prev => ({ ...prev, rewardPropertyId: e.target.value, rewardApartmentId: '' }))
                          } else {
                            setApproveFormData(prev => ({ ...prev, rewardApartmentId: e.target.value, rewardPropertyId: '' }))
                          }
                        }}
                        label={projectType === 'houses' ? 'Lote del Referidor' : 'Apartamento del Referidor'}
                      >
                        {referrerProperties.length === 0 ? (
                          <MenuItem value="" disabled><em>{t('actions.noReferrerProperties', 'El referidor no tiene propiedades asignadas')}</em></MenuItem>
                        ) : (
                          referrerProperties.map(prop => {
                            const label = projectType === 'houses' 
                              ? `Lote ${prop.lot?.number || prop.lot || 'N/A'} ${prop.model?.model || prop.model?.name ? `- ${prop.model.model || prop.model.name}` : ''}`
                              : `Apto ${prop.apartmentNumber || 'N/A'} ${prop.floorNumber ? `(Piso ${prop.floorNumber})` : ''}`
                            return <MenuItem key={prop._id} value={prop._id}>{label}</MenuItem>
                          })
                        )}
                      </Select>
                    </FormControl>

                    <TextField 
                      type="number"
                      size="small" 
                      value={approveFormData.discountPercent} 
                      onChange={(e) => setApproveFormData(prev => ({ ...prev, discountPercent: e.target.value }))}
                      label={t('actions.overrideDiscount', 'Sobrescribir % Descuento (Opcional)')}
                      helperText="Dejar vacío para usar el % configurado en el programa del proyecto"
                    />
                  </>
                ) : (
                  <>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      {t('actions.cashWarning', 'Nota: El sistema rechazará esta acción si el referidor tiene saldo pendiente en alguna de sus unidades.')}
                    </Alert>
                    <TextField 
                      type="number"
                      size="small" 
                      value={rewardAmount} 
                      onChange={(e) => setRewardAmount(e.target.value)}
                      label={t('actions.rewardAmount', 'Monto de Recompensa (Cash)')}
                      required
                    />
                  </>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionModalOpen(false)} disabled={submitting}>{t('actions.cancel')}</Button>
          <Button 
            variant="contained" 
            onClick={handleActionSubmit} 
            disabled={submitting || (actionType === 'convert' && !convertPropertyId) || (actionType === 'approve' && selectedReferral?.rewardType === 'property_discount' && (!approveFormData.rewardPropertyId && !approveFormData.rewardApartmentId))}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? t('loading', 'Procesando...') : t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}