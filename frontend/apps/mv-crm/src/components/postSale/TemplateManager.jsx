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
import { useTemplateColumns } from '../../constants/Columns/useTemplateColumns' // Ajusta la ruta si es necesario
import surveyService from '@shared/services/surveyService'

import SurveyTemplateForm from './SurveyForm' 

export default function TemplateManager({ onNotify }) {
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

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.project')}</InputLabel>
              <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('filters.project')}>
                <MenuItem value="">{t('filters.all')}</MenuItem>
                {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.type')}</InputLabel>
              <Select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} label={t('filters.type')}>
                <MenuItem value="">{t('filters.all')}</MenuItem>
                {['post_sale', 'post_construction', 'post_warranty', 'annual'].map(type => (
                  <MenuItem key={type} value={type}>{t(`survey.types.${type}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button variant="outlined" fullWidth startIcon={<Close />} onClick={clearFilters} sx={{ height: 40 }}>
              {t('filters.clear')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowTemplateForm(true)}>
          {t('templates.newTemplate')}
        </Button>
      </Box>

      <DataTable columns={columns} data={templates || []} loading={templatesLoading} />

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
        />
      )}

      <Dialog open={templateDeleteDialogOpen} onClose={() => setTemplateDeleteDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          {t('actions.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('actions.deleteWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setTemplateDeleteDialogOpen(false)}>
            {t('actions.cancel')}
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
          >
            {t('actions.yesDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}