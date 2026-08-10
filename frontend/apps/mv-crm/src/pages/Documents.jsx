// apps/mv-crm/src/pages/Documents.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Grid, Paper, ToggleButtonGroup, ToggleButton, Chip, Typography, 
  CircularProgress, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton,
  useMediaQuery, useTheme
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
import { useDocuments } from '../constants/hooks/useDocuments'

const getFileIcon = (mimeType) => {
  if (mimeType?.includes('image')) return <Image sx={{ color: '#4caf50' }} />
  if (mimeType === 'application/pdf') return <PictureAsPdf sx={{ color: '#f44336' }} />
  return <Description sx={{ color: '#1976d2' }} />
}

export default function Documents() {
  const { t } = useTranslation('documents')
  const { projects } = useProjects()
  const { users: clients } = useResidents(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [viewMode, setViewMode] = useState('grid')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [initialFiles, setInitialFiles] = useState([])

  const { documents, loading, error, filters, search, setSearch, updateFilter, refetch } = useDocuments({ includeArchived: false })

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

  const handleDragOver = (e) => e.preventDefault()
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

  // ✅ Estilos unificados
  const unifiedButtonSx = {
    borderRadius: 0,
    textTransform: 'none',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    width: { xs: '100%', sm: 'auto' },
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
  }

const inputSx = {
  fontFamily: '"Courier New", monospace',
  fontSize: '0.75rem',
  borderRadius: 0,
  width: { xs: '100%', sm: 220, md: 250 }, // ✅ CORREGIDO: Anchos responsivos
  '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
  '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }
}
  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('subtitle')}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Zona de Drag & Drop Responsive */}
        <Paper 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            mb: 3, 
            borderRadius: 0, 
            border: '2px dashed #ccc', 
            textAlign: 'center', 
            cursor: 'pointer', 
            bgcolor: '#fafafa',
            transition: 'all 0.2s',
            '&:hover': { borderColor: '#000', bgcolor: '#f5f5f5' }
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => { setInitialFiles([]); setUploadOpen(true) }}
        >
          <CloudUpload sx={{ fontSize: 48, color: '#000', mb: 1 }} />
          <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {t('upload.dragDrop', 'Arrastra y suelta archivos aquí o haz clic para subir')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {t('upload.supportedFormats', 'PDF, JPG, PNG hasta 10MB')}
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 0, border: '1px solid #ececec' }}>
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            
            {/* Fila Superior: Búsqueda y Acciones (Responsive) */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexWrap="wrap" gap={2}>
              <TextField
                size="small"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ 
                  startAdornment: <Search sx={{ color: '#aaa', mr: 1 }} />,
                  sx: { '& .MuiOutlinedInput-root': { borderRadius: 0 } }
                }}
                sx={{ width: { xs: '100%', sm: 250 }, flexGrow: { xs: 0, sm: 1 }, ...inputSx }}
              />
              
              <Box display="flex" gap={1} alignItems="center" width={{ xs: '100%', sm: 'auto' }} flexDirection={{ xs: 'column', sm: 'row' }}>
                <ToggleButtonGroup 
                  value={viewMode} 
                  exclusive 
                  onChange={(e, val) => val && setViewMode(val)} 
                  size="small" 
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    '& .MuiToggleButton-root': { 
                      borderRadius: 0, 
                      border: '1px solid #000', 
                      fontFamily: '"Courier New", monospace', 
                      fontSize: '0.7rem',
                      flex: { xs: 1, sm: 'none' }
                    } 
                  }}
                >
                  <ToggleButton value="grid"><GridOn fontSize="small" /></ToggleButton>
                  <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
                
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => { setInitialFiles([]); setUploadOpen(true) }} 
                  sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
                >
                  {t('uploadDocument')}
                </Button>
              </Box>
            </Box>

            {/* Fila de Filtros (Responsive) */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} flexWrap="wrap" alignItems={{ xs: 'stretch', sm: 'center' }}>
              <FormControl size="small" sx={inputSx}>
                <InputLabel>{t('filters.category')}</InputLabel>
                <Select value={filters.category || ''} onChange={(e) => updateFilter('category', e.target.value)} label={t('filters.category')}>
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('filters.allCategories')}</MenuItem>
                  {['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other'].map(c => (
                    <MenuItem key={c} value={c} sx={{ fontFamily: '"Courier New", monospace' }}>{t(`categories.${c}`)}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={inputSx}>
                <InputLabel>{t('filters.project')}</InputLabel>
                <Select value={filters.projectId || ''} onChange={(e) => updateFilter('projectId', e.target.value)} label={t('filters.project')}>
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('filters.allProjects')}</MenuItem>
                  {projects.map(p => <MenuItem key={p._id} value={p._id} sx={{ fontFamily: '"Courier New", monospace' }}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small" sx={inputSx}>
                <InputLabel>{t('filters.clients')}</InputLabel>
                <Select value={filters.clientId || ''} onChange={(e) => updateFilter('clientId', e.target.value)} label={t('filters.clients')}>
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('filters.allClients')}</MenuItem>
                  {clients.map(c => <MenuItem key={c._id} value={c._id} sx={{ fontFamily: '"Courier New", monospace' }}>{c.firstName} {c.lastName}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder={t('filters.tags', 'Etiquetas')}
                value={filters.tags || ''}
                onChange={(e) => updateFilter('tags', e.target.value)}
                sx={{ ...inputSx, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              
              {hasActiveFilters && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error" 
                  onClick={clearAllFilters} 
                  sx={{ ...unifiedButtonSx, border: '1px solid #f44336', color: '#f44336', '&:hover': { bgcolor: '#ffebee', borderColor: '#d32f2f', color: '#d32f2f', boxShadow: '4px 4px 0px rgba(244,67,54,0.12)' } }}
                >
                  {t('filters.clear', 'Limpiar')}
                </Button>
              )}
            </Box>
          </Box>

          {error && <Typography color="error" sx={{ mb: 2, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{error}</Typography>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : documents.length === 0 ? (
            <Box textAlign="center" py={8} color="text.secondary">
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem' }}>{t('empty')}</Typography>
            </Box>
          ) : viewMode === 'grid' ? (
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
            <List sx={{ width: '100%' }}>
              {documents.map((doc, index) => (
                <Box key={doc._id}>
                  <ListItem 
                    sx={{ 
                      px: { xs: 1, sm: 2 }, 
                      py: 1.5, 
                      borderRadius: 0, 
                      border: '1px solid transparent',
                      '&:hover': { bgcolor: '#f5f5f5', borderColor: '#ececec' },
                      cursor: 'pointer',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 0 }
                    }}
                    onClick={() => { setSelectedDoc(doc); setViewerOpen(true) }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 'auto', sm: 40 }, mr: { xs: 0, sm: 2 } }}>
                      {getFileIcon(doc.mimeType)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography fontWeight={600} sx={{ fontSize: '0.9rem', fontFamily: '"Helvetica Neue", sans-serif', wordBreak: 'break-word' }}>
                          {doc.title}
                          {doc.version > 1 && (
                            <Chip label={`v${doc.version}`} size="small" sx={{ ml: 1, height: 20, fontSize: '0.65rem', verticalAlign: 'middle', borderRadius: 0, fontFamily: '"Courier New", monospace' }} />
                          )}
                        </Typography>
                      }
                      secondary={
                        <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                          <Chip label={t(`categories.${doc.category}`)} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', borderRadius: 0, fontFamily: '"Courier New", monospace' }} />
                          {doc.projectId && <Chip label={doc.projectId.name || doc.projectId.title?.es} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', borderRadius: 0, fontFamily: '"Courier New", monospace' }} />}
                          {doc.clientId && <Chip label={`${doc.clientId.firstName} ${doc.clientId.lastName}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', borderRadius: 0, fontFamily: '"Courier New", monospace' }} />}
                          {doc.tags?.map(tag => (
                            <Chip key={tag} label={`#${tag}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f5f5f5', borderRadius: 0, fontFamily: '"Courier New", monospace' }} />
                          ))}
                        </Box>
                      }
                    />
                    <Box display="flex" gap={0.5} sx={{ mt: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setHistoryOpen(true) }} title="Historial" sx={{ borderRadius: 0 }}><History fontSize="small" /></IconButton>
                      <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); handleArchive(doc) }} title="Archivar" sx={{ borderRadius: 0 }}><Archive fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(doc) }} title="Eliminar" sx={{ borderRadius: 0 }}><Delete fontSize="small" /></IconButton>
                    </Box>
                  </ListItem>
                  {index < documents.length - 1 && <Divider sx={{ mx: { xs: 1, sm: 2 } }} />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </motion.div>

      <DocumentUploadModal open={uploadOpen} onClose={() => { setUploadOpen(false); setInitialFiles([]) }} onUploadSuccess={refetch} defaultFiles={initialFiles} />
      <DocumentViewer open={viewerOpen} onClose={() => setViewerOpen(false)} document={selectedDoc} />
      <VersionHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} document={selectedDoc} onUploadSuccess={refetch} />
    </PageLayout>
  )
}