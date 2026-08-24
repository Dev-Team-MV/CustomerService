import { useState } from 'react'
import { 
  Box, Button, Grid, FormControl, InputLabel, Select, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Typography
} from '@mui/material'
import { Add, Close, Warning as WarningIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import DataTable from '@shared/components/table/DataTable'
import { useSurveyTemplates } from '@shared/hooks/useSurveyTemplates'
import { useProjects } from '@shared/hooks/useProjects'
import { useTemplateColumns } from '../../constants/Columns/useTemplateColumns'
import surveyService from '@shared/services/surveyService'

// ✅ Asegúrate de que este import apunte al archivo correcto (SurveyTemplateForm.jsx)
import SurveyTemplateForm from './SurveyForm' // ✅ Corregido el nombre del import

export default function TemplateManager({ onNotify, isTourMode = false }) {
  const { t } = useTranslation('postSale')
  const { projects } = useProjects()
  
  const [filters, setFilters] = useState({ projectId: '', type: '' })
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateDeleteDialogOpen, setTemplateDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)

  const { data: templates, loading: templatesLoading, refresh: refreshTemplates } = useSurveyTemplates(filters)
  
  const columns = useTemplateColumns({ 
    t, 
    onView: (template) => setSelectedTemplate(template),
    onEdit: (template) => {
      setSelectedTemplate(template)
      setShowTemplateForm(true)
    },
    onDelete: (template) => {
      setTemplateToDelete(template)
      setTemplateDeleteDialogOpen(true)
    }
  })

  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }))
  const clearFilters = () => setFilters({ projectId: '', type: '' })

  const handleTemplateSuccess = () => {
    setShowTemplateForm(false)
    setSelectedTemplate(null)
    refreshTemplates()
    onNotify(t('templates.saveSuccess'), 'success')
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return
    try {
      await surveyService.deleteTemplate(templateToDelete._id)
      onNotify(t('actions.deletedMsg'), 'success')
      refreshTemplates()
    } catch (error) {
      onNotify(t('actions.deleteErrorMsg'), 'error')
    } finally {
      setTemplateDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }

  return (
    <Box>
      {/* ✅ ID: Filtros de Plantillas */}
      <Box id="templates-filters" sx={{ mb: 3, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{fontFamily: '"Courier New", monospace'}}>{t('filters.project')}</InputLabel>
              <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('filters.project')} sx={inputSx}>
                <MenuItem value="">{t('filters.all')}</MenuItem>
                {projects.map(p => <MenuItem key={p._id} value={p._id} sx={{ fontFamily: '"Courier New", monospace' }}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{fontFamily: '"Courier New", monospace'}}>{t('filters.type')}</InputLabel>
              <Select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} label={t('filters.type')} sx={inputSx}>
                <MenuItem value="">{t('filters.all')}</MenuItem>
                {['post_sale', 'post_construction', 'post_warranty', 'annual'].map(type => (
                  <MenuItem key={type} value={type} sx={{ fontFamily: '"Courier New", monospace' }}>{t(`survey.types.${type}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button variant="outlined" fullWidth startIcon={<Close />} onClick={clearFilters} sx={{ ...unifiedButtonSx, height: 40, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
              {t('filters.clear')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* ✅ ID: Botón Nueva Plantilla */}
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button 
          id="templates-new-btn" 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setShowTemplateForm(true)} 
          sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
        >
          {t('templates.newTemplate')}
        </Button>
      </Box>

      {/* ✅ ID: Tabla de Plantillas */}
      <Box id="templates-data-table">
        <DataTable columns={columns} data={templates || []} loading={templatesLoading} />
      </Box>

      {showTemplateForm && (
        <SurveyTemplateForm 
          open={showTemplateForm}
          onClose={() => { 
            setShowTemplateForm(false); 
            setSelectedTemplate(null); 
          }}
          initialData={selectedTemplate}
          onSuccess={handleTemplateSuccess}
          onError={(err) => onNotify(t('templates.saveError'), 'error')}
          isTourMode={isTourMode}
        />
      )}

      <Dialog open={templateDeleteDialogOpen} onClose={() => setTemplateDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('actions.confirmDelete')}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {t('actions.deleteWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setTemplateDeleteDialogOpen(false)} sx={{ ...unifiedButtonSx, color: '#888' }}>
            {t('actions.cancel')}
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            sx={{ ...unifiedButtonSx, bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f', boxShadow: '6px 6px 0px rgba(244,67,54,0.12)' } }}
          >
            {t('actions.yesDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}