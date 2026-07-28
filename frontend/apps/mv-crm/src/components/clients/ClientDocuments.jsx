// apps/mv-crm/src/components/clients/ClientDocuments.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Button, CircularProgress, Alert, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { Add, Search } from '@mui/icons-material'
import { useDocuments } from '../../constants/hooks/useDocuments'
import DocumentCard from '../documents/DocumentCard'
import DocumentUploadModal from '../documents/DocumentUploadModal'
import DocumentViewer from '../documents/DocumentViewer'
import VersionHistoryDrawer from '../documents/VersionHistoryDrawer'
import documentService from '../../services/documentService'
import { useProjects } from '@shared/hooks/useProjects'

export default function ClientDocuments({ clientId, clientName }) {
  const { t } = useTranslation('documents')
  const { projects } = useProjects()
  
  const { documents, loading, error, refetch, updateFilter, filters, search, setSearch } = useDocuments({ clientId })
  
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

  // ✅ Estilos unificados
  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
          {t('clientDocuments.title', 'Documentos del Cliente')}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {t('uploadDocument')}
        </Button>
      </Box>

      {/* Filtros rápidos */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <Search sx={{ color: '#aaa' }} /> }}
          sx={{ minWidth: 200, ...inputSx }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.category')}</InputLabel>
          <Select value={filters.category || ''} onChange={(e) => updateFilter('category', e.target.value)} label={t('filters.category')} sx={inputSx}>
            <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('filters.allCategories')}</MenuItem>
            {['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other'].map(c => (
              <MenuItem key={c} value={c} sx={{ fontFamily: '"Courier New", monospace' }}>{t(`categories.${c}`)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.project')}</InputLabel>
          <Select value={filters.projectId || ''} onChange={(e) => updateFilter('projectId', e.target.value)} label={t('filters.project')} sx={inputSx}>
            <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('filters.allProjects')}</MenuItem>
            {projects.map(p => <MenuItem key={p._id} value={p._id} sx={{ fontFamily: '"Courier New", monospace' }}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : documents.length === 0 ? (
        <Box textAlign="center" py={8} color="text.secondary">
          <Typography sx={{ fontFamily: '"Courier New", monospace' }}>{t('empty')}</Typography>
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

      <DocumentUploadModal 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onUploadSuccess={refetch}
        defaultClientId={clientId}
        defaultProjectId={filters.projectId}
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