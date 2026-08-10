import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material'
import { Add, Search, FilterList } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import MessageTemplateModal from '../components/MessageTemplateModal'
import useMessageTemplates from '../constants/hooks/useMessageTemplates'
import { getMessageTemplatesColumns } from '../constants/Columns/messageTemplates'
import { useProjects } from '@shared/hooks/useProjects'

export default function MessageTemplates() {
  const { t } = useTranslation('sms')
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } = useMessageTemplates()
  const { projects } = useProjects()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  
  // Estados de filtros
  const [searchValue, setSearchValue] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')

  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setModalOpen(true)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setModalOpen(true)
  }

  const handleSaveTemplate = async (data, templateId) => {
    try {
      if (templateId) {
        await updateTemplate(templateId, data)
      } else {
        await createTemplate(data)
      }
      setModalOpen(false)
      setEditingTemplate(null)
    } catch (err) {
      console.error('Error saving template:', err)
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (window.confirm(t('templates.deleteConfirm', 'Are you sure you want to delete this template?'))) {
      try {
        await deleteTemplate(id)
      } catch (err) {
        console.error('Error deleting template:', err)
      }
    }
  }

  const columns = useMemo(
    () => getMessageTemplatesColumns(t, handleEditTemplate, handleDeleteTemplate),
    [t] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // ✅ Lógica de filtrado corregida
  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    
    return templates.filter(template => {
      // ✅ CORRECCIÓN: Manejar projectId null correctamente
      const templateProjectId = template.projectId ? 
        (typeof template.projectId === 'object' ? template.projectId._id : template.projectId) 
        : null

      // Filtro por proyecto
      if (projectFilter !== 'all') {
        if (templateProjectId !== projectFilter) return false
      }

      // Filtro por búsqueda (nombre, descripción o contenido)
      if (searchValue.trim()) {
        const search = searchValue.toLowerCase()
        const matchName = template.name?.toLowerCase().includes(search)
        const matchDesc = template.description?.toLowerCase().includes(search)
        const matchContent = template.template?.toLowerCase().includes(search)
        
        if (!matchName && !matchDesc && !matchContent) return false
      }

      return true
    })
  }, [templates, projectFilter, searchValue])

  // ✅ Estilos unificados
  const unifiedButtonSx = { 
    borderRadius: 0, 
    textTransform: 'none', 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    letterSpacing: '0.5px', 
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 }
  }

  const menuItemSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '&:hover': { bgcolor: '#f5f5f5' }
  }

  return (
    <PageLayout
      title={t('sms.templates.title', 'Message Templates')}
      subtitle={t('sms.templates.subtitle', 'Create and manage templates for bulk sending')}
      topbarLabel={t('sms.topbarLabel', 'SMS Campaigns')}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* ✅ Panel de Filtros y Acciones */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} gap={2}>
          
          <Box display="flex" gap={2} flexWrap="wrap" width={{ xs: '100%', sm: 'auto' }}>
            {/* Búsqueda */}
            <TextField
              placeholder={t('sms.form.searchPlaceholder', 'Search by name, description...')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
              sx={{ width: { xs: '100%', sm: 250 }, ...inputSx }}
              InputProps={{
                startAdornment: <Search sx={{ color: '#aaa', mr: 1, fontSize: 18 }} />
              }}
            />

            {/* Filtro por Proyecto */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>{t('sms.filters.project', 'Project')}</InputLabel>
              <Select 
                value={projectFilter} 
                onChange={(e) => setProjectFilter(e.target.value)} 
                label={t('sms.filters.project', 'Project')}
                sx={inputSx}
              >
                <MenuItem value="all" sx={menuItemSx}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FilterList fontSize="small" />
                    {t('sms.filters.allProjects', 'All projects')}
                  </Box>
                </MenuItem>
                {projects.map(p => (
                  <MenuItem key={p._id} value={p._id} sx={menuItemSx}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Badge de resultados */}
            {(searchValue || projectFilter !== 'all') ? (
              <Chip 
                label={t('sms.filters.results', '{{count}} results', { count: filteredTemplates.length }).replace('{{count}}', filteredTemplates.length)}
                size="small" 
                sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', bgcolor: '#e3f2fd', color: '#1976d2' }} 
              />
            ) : null}
          </Box>

          {/* Botón de Nueva Plantilla */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTemplate}
            sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, width: { xs: '100%', sm: 'auto' }, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
          >
            {t('sms.templates.newBtn', 'New Template')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}

        <Box flex={1} sx={{ overflow: 'hidden' }}>
          <DataTable
            data={filteredTemplates}
            columns={columns}
            loading={loading}
            emptyMessage={t('sms.templates.empty', 'No templates found')}
          />
        </Box>

        <MessageTemplateModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingTemplate(null)
          }}
          template={editingTemplate}
          onSave={handleSaveTemplate}
        />
      </Box>
    </PageLayout>
  )
}