import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, Typography, Button, CircularProgress, Alert, Grid, 
  TextField, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material'
import { Add, Search } from '@mui/icons-material'
import { useDocuments } from '../../constants/hooks/useDocuments'
import DocumentCard from '../documents/DocumentCard'
import DocumentUploadModal from '../documents/DocumentUploadModal'
import DocumentViewer from '../documents/DocumentViewer'
import VersionHistoryDrawer from '../documents/VersionHistoryDrawer'
import documentService from '../../services/documentService'
import { useResidents } from '@shared/hooks/useResidents'

export default function ProjectDocuments({ projectId, projectName }) {
  const { t } = useTranslation('documents')
  const { users: clients } = useResidents(null) // Para el filtro de clientes
  
  // ✅ Fijamos el projectId en los filtros iniciales del hook
  const { documents, loading, error, refetch, updateFilter, filters, search, setSearch } = useDocuments({ projectId })
  
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const handleArchive = async (doc) => {
    if (window.confirm(t('actions.archive') + '?')) {
      await documentService.archiveDocument(doc._id)
      refetch()
    }
  }

  const handleDelete = async (doc) => {
    if (window.confirm(t('actions.delete') + '?')) {
      await documentService.deleteDocument(doc._id)
      refetch()
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontWeight: 700 }}>
          {t('projectDocuments.title', 'Documentos del Proyecto')}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)}>
          {t('uploadDocument')}
        </Button>
      </Box>

      {/* Filtros rápidos para el contexto del proyecto */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <Search sx={{ color: '#aaa', mr: 1 }} /> }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.category')}</InputLabel>
          <Select value={filters.category || ''} onChange={(e) => updateFilter('category', e.target.value)} label={t('filters.category')}>
            <MenuItem value="">{t('filters.allCategories')}</MenuItem>
            {['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other'].map(c => (
              <MenuItem key={c} value={c}>{t(`categories.${c}`)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t('filters.client')}</InputLabel>
          <Select value={filters.clientId || ''} onChange={(e) => updateFilter('clientId', e.target.value)} label={t('filters.client')}>
            <MenuItem value="">{t('filters.allClients')}</MenuItem>
            {clients.map(c => (
              <MenuItem key={c._id} value={c._id}>
                {c.firstName} {c.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Estado de carga o error */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Box textAlign="center" py={8} color="text.secondary">
          <Typography>{t('empty')}</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {documents.map(doc => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id}>
              <DocumentCard 
                doc={doc} 
                onPreview={() => { setSelectedDoc(doc); setViewerOpen(true) }}
                onHistory={() => { setSelectedDoc(doc); setHistoryOpen(true) }}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ✅ Modales pre-llenados con el contexto del proyecto */}
      <DocumentUploadModal 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onUploadSuccess={refetch}
        defaultProjectId={projectId} // ✅ Pre-llena el proyecto
      />
      
      <DocumentViewer 
        open={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
        document={selectedDoc} 
      />
      
      <VersionHistoryDrawer 
        open={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        document={selectedDoc} 
        onUploadSuccess={refetch}
      />
    </Box>
  )
}