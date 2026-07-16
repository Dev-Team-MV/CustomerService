import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Grid, Paper, ToggleButtonGroup, ToggleButton, Chip, Typography, 
  CircularProgress, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton
} from '@mui/material'
import { 
  Search, GridOn, ViewList, Add, CloudUpload, PictureAsPdf, 
  Description, Image, Archive, Delete, History 
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DocumentCard from '../components/documents/DocumentCard'
import DocumentUploadModal from '../components/documents/DocumentUploadModal'
import DocumentViewer from '../components/documents/DocumentViewer'
import VersionHistoryDrawer from '../components/documents/VersionHistoryDrawer'
import documentService from '../services/documentService'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useDocuments } from '../constants/hooks/useDocuments' // ✅ Hook integrado

// Helper para iconos según tipo de archivo
const getFileIcon = (mimeType) => {
  if (mimeType?.includes('image')) return <Image sx={{ color: '#4caf50' }} />
  if (mimeType === 'application/pdf') return <PictureAsPdf sx={{ color: '#f44336' }} />
  return <Description sx={{ color: '#1976d2' }} />
}

export default function Documents() {
  const { t } = useTranslation('documents')
  const { projects } = useProjects()
  const { users: clients } = useResidents(null)
  
  const [viewMode, setViewMode] = useState('grid')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [initialFiles, setInitialFiles] = useState([]) // ✅ Para Drag & Drop

  // ✅ Integración del hook useDocuments
  const { 
    documents, 
    loading, 
    error, 
    filters, 
    search, 
    setSearch, 
    updateFilter, 
    refetch 
  } = useDocuments({ includeArchived: false })

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

  // ✅ Manejadores de Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setInitialFiles(files)
      setUploadOpen(true)
    }
  }

  const clearAllFilters = () => {
    updateFilter('category', '')
    updateFilter('projectId', '')
    updateFilter('clientId', '')
    updateFilter('tags', '')
    setSearch('')
  }

  const hasActiveFilters = filters.category || filters.projectId || filters.clientId || filters.tags || search

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('subtitle')}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* ✅ Zona Global de Drag & Drop */}
        <Paper 
          sx={{ 
            p: 4, mb: 3, borderRadius: 2, border: '2px dashed #ccc', 
            textAlign: 'center', cursor: 'pointer', bgcolor: '#fafafa',
            transition: 'all 0.2s',
            '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f7ff' }
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => { setInitialFiles([]); setUploadOpen(true) }}
        >
          <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
          <Typography variant="h6" fontWeight={600}>{t('upload.dragDropGlobal', 'Arrastra y suelta archivos aquí o haz clic para subir')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('upload.supportedFormats', 'PDF, JPG, PNG hasta 10MB')}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #ececec' }}>
          {/* Toolbar */}
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <TextField
                size="small"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ color: '#aaa', mr: 1 }} /> }}
                sx={{ minWidth: 250, flexGrow: 1 }}
              />
              
              <Box display="flex" gap={1} alignItems="center">
                {/* ✅ Toggle de Vista Corregido */}
                <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)} size="small">
                  <ToggleButton value="grid"><GridOn fontSize="small" /></ToggleButton>
                  <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setInitialFiles([]); setUploadOpen(true) }}>
                  {t('uploadDocument')}
                </Button>
              </Box>
            </Box>

            {/* ✅ Filtros Avanzados */}
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('filters.category')}</InputLabel>
                <Select value={filters.category || ''} onChange={(e) => updateFilter('category', e.target.value)} label={t('filters.category')}>
                  <MenuItem value="">{t('filters.allCategories')}</MenuItem>
                  {['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other'].map(c => (
                    <MenuItem key={c} value={c}>{t(`categories.${c}`)}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('filters.project')}</InputLabel>
                <Select value={filters.projectId || ''} onChange={(e) => updateFilter('projectId', e.target.value)} label={t('filters.project')}>
                  <MenuItem value="">{t('filters.allProjects')}</MenuItem>
                  {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('filters.client')}</InputLabel>
                <Select value={filters.clientId || ''} onChange={(e) => updateFilter('clientId', e.target.value)} label={t('filters.client')}>
                  <MenuItem value="">{t('filters.allClients')}</MenuItem>
                  {clients.map(c => (
                    <MenuItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder={t('filters.tags', 'Etiquetas')}
                value={filters.tags || ''}
                onChange={(e) => updateFilter('tags', e.target.value)}
                sx={{ minWidth: 150 }}
              />
              
              {hasActiveFilters && (
                <Button size="small" variant="outlined" color="error" onClick={clearAllFilters}>
                  {t('filters.clear', 'Limpiar')}
                </Button>
              )}
            </Box>
          </Box>

          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

          {/* Content */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : documents.length === 0 ? (
            <Box textAlign="center" py={8} color="text.secondary">
              <Typography>{t('empty')}</Typography>
            </Box>
          ) : viewMode === 'grid' ? (
            // ✅ Vista Grid
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
          ) : (
            // ✅ Vista Lista
            <List sx={{ width: '100%' }}>
              {documents.map((doc, index) => (
                <Box key={doc._id}>
                  <ListItem 
                    sx={{ 
                      px: 2, py: 1.5, borderRadius: 1, 
                      '&:hover': { bgcolor: '#f5f5f5' },
                      cursor: 'pointer'
                    }}
                    onClick={() => { setSelectedDoc(doc); setViewerOpen(true) }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getFileIcon(doc.mimeType)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography fontWeight={600} sx={{ fontSize: '0.9rem' }}>
                          {doc.title}
                          {doc.version > 1 && (
                            <Chip label={`v${doc.version}`} size="small" sx={{ ml: 1, height: 20, fontSize: '0.65rem', verticalAlign: 'middle' }} />
                          )}
                        </Typography>
                      }
                      secondary={
                        <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                          <Chip label={t(`categories.${doc.category}`)} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                          {doc.projectId && <Chip label={doc.projectId.name || doc.projectId.title?.es} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                          {doc.clientId && <Chip label={`${doc.clientId.firstName} ${doc.clientId.lastName}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                          {doc.tags?.map(tag => (
                            <Chip key={tag} label={`#${tag}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f5f5f5' }} />
                          ))}
                        </Box>
                      }
                    />
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setHistoryOpen(true) }} title="Historial">
                        <History fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); handleArchive(doc) }} title="Archivar">
                        <Archive fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(doc) }} title="Eliminar">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < documents.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </motion.div>

      {/* ✅ Modal de subida con soporte para archivos pre-cargados */}
      <DocumentUploadModal 
        open={uploadOpen} 
        onClose={() => { setUploadOpen(false); setInitialFiles([]) }} 
        onUploadSuccess={refetch}
        defaultFiles={initialFiles} 
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
    </PageLayout>
  )
}