// apps/mv-crm/src/components/postSale/tabs/SurveysPanel.jsx
import { useState, useMemo } from 'react'
import { 
  Box, Tabs, Tab, Paper, Typography, Grid, 
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  CircularProgress, Rating, Chip, Divider, Button
} from '@mui/material'
import { Add, Close, Warning as WarningIcon, Edit, Home, Apartment, BarChart } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import DataTable from '@shared/components/table/DataTable'
import { useSurveys } from '@shared/hooks/useSurveys'
import { useSurveyStats } from '@shared/hooks/useSurveyStats'
import { useSurveyTemplates } from '@shared/hooks/useSurveyTemplates'
import { useResolvedProperties } from '@shared/hooks/useResolvedProperties'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useSurveyColumns } from '../../../constants/Columns/surveyColumns'
import surveyService from '@shared/services/surveyService'

import SurveyForm from '../SurveyForm'
import TemplateManager from '../TemplateManager'

export default function SurveysPanel({ onNotify }) {
  const { t } = useTranslation('postSale')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)

  const [tabValue, setTabValue] = useState(0)
  const [filters, setFilters] = useState({ projectId: '', clientId: '', type: '', templateId: '' })
  
  const [showSurveyForm, setShowSurveyForm] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [surveyDetailOpen, setSurveyDetailOpen] = useState(false)
  const [surveyDeleteDialogOpen, setSurveyDeleteDialogOpen] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState(null)

  const { data: surveys, loading: surveysLoading, refresh: refreshSurveys } = useSurveys(filters)
  const { stats: surveyStats, loading: statsLoading } = useSurveyStats(filters.projectId, { type: filters.type || undefined, templateId: filters.templateId || undefined })
  const { propertiesMap: surveyPropertiesMap, loading: resolvingSurveys } = useResolvedProperties(surveys)
  const { data: templates } = useSurveyTemplates({ isActive: true })

  const filteredResidents = useMemo(() => {
    if (!filters.projectId) return residents.filter(r => r.role === 'user')
    return residents.filter(r => r.role === 'user' && (r.projects?.some(p => p._id === filters.projectId) || r.projectMemberships?.some(m => m.project?._id === filters.projectId || m.project === filters.projectId)))
  }, [residents, filters.projectId])

  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }))
  const clearFilters = () => setFilters({ projectId: '', clientId: '', type: '', templateId: '' })

  const handleView = (row) => { setSelectedSurvey(row); setSurveyDetailOpen(true) }
  const handleEdit = (row) => { setSelectedSurvey(row); setShowSurveyForm(true) }
  const promptDelete = (row) => { setSurveyToDelete(row); setSurveyDeleteDialogOpen(true) }
  
  const confirmDelete = async () => {
    if (!surveyToDelete) return
    try {
      await surveyService.delete(surveyToDelete._id)
      onNotify(t('actions.deletedMsg'), 'success')
      refreshSurveys()
    } catch (error) {
      onNotify(t('actions.deleteErrorMsg'), 'error')
    } finally { 
      setSurveyDeleteDialogOpen(false)
      setSurveyToDelete(null) 
    }
  }

  const handleSuccess = () => {
    setShowSurveyForm(false)
    setSelectedSurvey(null)
    refreshSurveys()
    onNotify(t('surveys.saveSuccess'), 'success')
  }

  const columns = useSurveyColumns({ t, propertiesMap: surveyPropertiesMap, onView: handleView, onEdit: handleEdit, onDelete: promptDelete })
  const isLoading = surveysLoading || resolvingSurveys

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }

  return (
    <Box>
      <Paper sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid #ececec' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #ececec', px: 2, bgcolor: '#fafafa' }}>
          <Tab label={t('tabs.surveys')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
          <Tab label={t('tabs.templates')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              {!showSurveyForm && (
                <>
                  <Box sx={{ mb: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Helvetica Neue", sans-serif' }}>
                      <BarChart color="primary" /> {t('surveys.summary')}
                    </Typography>
                    
                    {statsLoading ? (
                      <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
                    ) : surveyStats ? (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('surveys.totalSurveys')}</Typography>
                            <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{surveyStats.total}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.rating')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                              <Rating value={surveyStats.avgOverallRating || 0} readOnly size="large" sx={{ color: '#ffb300' }} />
                              <Typography variant="h6" sx={{ ml: 1, fontFamily: '"Helvetica Neue", sans-serif' }}>({(surveyStats.avgOverallRating || 0).toFixed(1)}/5)</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.nps')}</Typography>
                            <Typography variant="h4" fontWeight={700} color={(surveyStats.avgNps || 0) >= 9 ? 'success.main' : (surveyStats.avgNps || 0) >= 7 ? 'warning.main' : 'error.main'} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                              {(surveyStats.avgNps || 0).toFixed(1)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.templatesUsed')}</Typography>
                            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                              {surveyStats.byType?.length || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {surveyStats.byQuestion && surveyStats.byQuestion.length > 0 && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontFamily: '"Courier New", monospace' }}>
                              {t('surveys.byQuestion')}
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                              {surveyStats.byQuestion.map((item, idx) => (
                                <Chip 
                                  key={idx}
                                  label={`${item.question || item.questionKey}: ${item.avgRating.toFixed(1)}/5 (${item.count} resp.)`}
                                  variant="outlined"
                                  size="small"
                                  color={item.avgRating >= 4 ? 'success' : item.avgRating >= 3 ? 'warning' : 'error'}
                                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2, fontFamily: '"Courier New", monospace' }}>
                        {t('surveys.selectProjectForStats')}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mb: 2, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={2.4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('filters.project')}</InputLabel>
                          <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('filters.project')} sx={inputSx}>
                            <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} value="">{t('filters.all')}</MenuItem>
                            {projects.map(p => <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} key={p._id} value={p._id}>{p.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <FormControl fullWidth size="small" disabled={!filters.projectId}>
                          <InputLabel>{t('filters.client')}</InputLabel>
                          <Select value={filters.clientId} onChange={(e) => handleFilterChange('clientId', e.target.value)} label={t('filters.client')} sx={inputSx}>
                            <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} value="">{t('filters.all')}</MenuItem>
                            {filteredResidents.map(client => <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} key={client._id} value={client._id}>{client.firstName} {client.lastName}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('filters.type')}</InputLabel>
                          <Select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} label={t('filters.type')} sx={inputSx}>
                            <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} value="">{t('filters.all')}</MenuItem>
                            {['post_sale', 'post_construction', 'post_warranty', 'annual'].map(type => (
                              <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} key={type} value={type}>{t(`survey.types.${type}`)}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('filters.template')}</InputLabel>
                          <Select value={filters.templateId} onChange={(e) => handleFilterChange('templateId', e.target.value)} label={t('filters.template')} sx={inputSx}>
                            <MenuItem value="">{t('filters.all')}</MenuItem>
                            {templates.map(tpl => <MenuItem key={tpl._id} value={tpl._id}>{tpl.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <Button variant="outlined" fullWidth startIcon={<Close />} onClick={clearFilters} sx={{ ...unifiedButtonSx, height: 40, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
                          {t('filters.clear')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setShowSurveyForm(true)} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
                      {t('surveys.newSurvey')}
                    </Button>
                  </Box>
                </>
              )}

              {showSurveyForm ? (
                <SurveyForm open={showSurveyForm} onClose={() => { setShowSurveyForm(false); setSelectedSurvey(null); }} initialData={selectedSurvey} onSuccess={handleSuccess} onError={(err) => onNotify(t('surveys.saveError'), 'error')} />
              ) : (
                <DataTable columns={columns} data={Array.isArray(surveys) ? surveys : (surveys?.items || surveys?.data || [])} loading={isLoading} />
              )}
            </Box>
          )}

          {tabValue === 1 && <TemplateManager onNotify={onNotify} />}
        </Box>
      </Paper>

      <Dialog open={surveyDetailOpen} onClose={() => setSurveyDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
        <DialogTitle sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('surveys.surveyDetails')}</DialogTitle>
        <DialogContent dividers>
          {selectedSurvey && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.client')}</Typography>
                <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{selectedSurvey.clientId?.firstName} {selectedSurvey.clientId?.lastName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.project')}</Typography>
                <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{selectedSurvey.projectId?.name || selectedSurvey.projectId?.title?.es || t('common.na')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.property')}</Typography>
                <Typography variant="body1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Helvetica Neue", sans-serif' }}>
                  {selectedSurvey.apartmentId ? (
                    <><Apartment fontSize="small" color="primary" /> Apt {selectedSurvey.apartmentId.apartmentNumber || selectedSurvey.apartmentId}</>
                  ) : selectedSurvey.propertyId ? (
                    (() => {
                      const prop = selectedSurvey.propertyId;
                      const lotData = typeof prop.lot === 'string' ? surveyPropertiesMap.lots[prop.lot] : prop.lot;
                      const lotNumber = lotData?.number || lotData?.name || (typeof prop.lot === 'string' ? `ID: ${prop.lot.slice(-6)}` : t('common.na'));
                      return <><Home fontSize="small" color="success" /> {t('onboarding.lot')} {lotNumber}</>;
                    })()
                  ) : t('common.na')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('surveys.overallRating')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={selectedSurvey.overallRating || 0} readOnly size="small" sx={{ color: '#ffb300' }} />
                  <Typography variant="body2" sx={{ ml: 1, fontFamily: '"Helvetica Neue", sans-serif' }}>({selectedSurvey.overallRating || 0}/5)</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.responses')}</Typography>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedSurvey.responses?.map((r, idx) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{r.question || r.questionKey}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('surveys.rating')}: {r.rating}/5</Typography>
                      {r.comment && <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', fontFamily: '"Helvetica Neue", sans-serif' }}>"{r.comment}"</Typography>}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSurveyDetailOpen(false)} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('actions.close')}</Button>
          <Button variant="contained" startIcon={<Edit />} onClick={() => { setSurveyDetailOpen(false); handleEdit(selectedSurvey); }} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {t('actions.edit')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={surveyDeleteDialogOpen} onClose={() => setSurveyDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('actions.confirmDelete')}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{t('actions.deleteWarning')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setSurveyDeleteDialogOpen(false)} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('actions.cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" sx={{ ...unifiedButtonSx, bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f', boxShadow: '6px 6px 0px rgba(244,67,54,0.12)' } }}>{t('actions.yesDelete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}