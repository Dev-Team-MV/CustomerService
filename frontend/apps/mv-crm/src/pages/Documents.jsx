// apps/mv-crm/src/pages/Documents.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Grid, Paper, ToggleButtonGroup, ToggleButton, Chip, Typography, CircularProgress 
} from '@mui/material'
import { Search, GridOn, ViewList, Add, FilterList } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DocumentCard from '../components/documents/DocumentCard'
import DocumentUploadModal from '../components/documents/DocumentUploadModal'
import DocumentViewer from '../components/documents/DocumentViewer'
import VersionHistoryDrawer from '../components/documents/VersionHistoryDrawer'
import documentService from '../services/documentService'
import { useProjects } from '@shared/hooks/useProjects'
import api from '@shared/services/api' // ✅ Agregado para enriquecer datos

export default function Documents() {
  const { t } = useTranslation('documents')
  const { projects } = useProjects()
  
  const [viewMode, setViewMode] = useState('grid')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [filters, setFilters] = useState({ category: '', projectId: '', includeArchived: false })
  const [search, setSearch] = useState('')
  
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = { ...filters, q: search }
      const data = await documentService.getDocuments(params)
      let docs = data.documents || []
      
      // ✅ ENRIQUECIMIENTO DE DATOS: Resolver IDs de lotes y modelos si el backend no los populó
      const needsEnrichment = docs.some(d => d.propertyId && typeof d.propertyId.lot === 'string')
      
      if (needsEnrichment) {
        try {
          // Obtenemos las propiedades (filtradas por proyecto si es posible para optimizar)
          const propParams = filters.projectId ? { projectId: filters.projectId } : {}
          const propsData = await api.get('/properties', { params: propParams })
          const properties = Array.isArray(propsData.data) 
            ? propsData.data 
            : (propsData.data.properties || propsData.data.data || [])
          
          // Crear mapa de búsqueda rápida: propertyId -> { lotNumber, modelName }
          const propertyMap = {}
          properties.forEach(p => {
            propertyMap[p._id] = {
              lotNumber: typeof p.lot === 'object' ? p.lot?.number : p.lot,
              modelName: typeof p.model === 'object' ? (p.model?.model || p.model?.name) : p.model
            }
          })
          
          // Inyectar datos populados en los documentos
          docs = docs.map(doc => {
            if (doc.propertyId && typeof doc.propertyId === 'object' && propertyMap[doc.propertyId._id]) {
              const enriched = propertyMap[doc.propertyId._id]
              return {
                ...doc,
                propertyId: {
                  ...doc.propertyId,
                  lot: { number: enriched.lotNumber },
                  model: { model: enriched.modelName }
                }
              }
            }
            return doc
          })
        } catch (err) {
          console.error('Error enriqueciendo propiedades:', err)
        }
      }
      
      setDocuments(docs)
      
      // Actualizar el documento seleccionado si está abierto para reflejar los cambios
      if (selectedDoc) {
        const updatedDoc = docs.find(d => d._id === selectedDoc._id)
        if (updatedDoc) {
          setSelectedDoc(updatedDoc)
        }
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [filters, search])

  const handleArchive = async (doc) => {
    if (window.confirm(t('actions.archive') + '?')) {
      await documentService.archiveDocument(doc._id)
      fetchDocuments()
    }
  }

  const handleDelete = async (doc) => {
    if (window.confirm(t('actions.delete') + '?')) {
      await documentService.deleteDocument(doc._id)
      fetchDocuments()
    }
  }

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('subtitle')}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #ececec' }}>
          {/* Toolbar */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} flex={1}>
              <TextField
                size="small"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ color: '#aaa', mr: 1 }} /> }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('filters.category')}</InputLabel>
                <Select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} label={t('filters.category')}>
                  <MenuItem value="">{t('filters.allCategories')}</MenuItem>
                  {['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other'].map(c => (
                    <MenuItem key={c} value={c}>{t(`categories.${c}`)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('filters.project')}</InputLabel>
                <Select value={filters.projectId} onChange={(e) => setFilters({...filters, projectId: e.target.value})} label={t('filters.project')}>
                  <MenuItem value="">{t('filters.allProjects')}</MenuItem>
                  {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" gap={1} alignItems="center">
              <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)} size="small">
                <ToggleButton value="grid"><GridOn fontSize="small" /></ToggleButton>
                <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
              <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)}>
                {t('uploadDocument')}
              </Button>
            </Box>
          </Box>

          {/* Content */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : documents.length === 0 ? (
            <Box textAlign="center" py={8} color="text.secondary">{t('empty')}</Box>
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
        </Paper>
      </motion.div>

      <DocumentUploadModal 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onUploadSuccess={fetchDocuments} 
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
        onUploadSuccess={fetchDocuments}
      />
    </PageLayout>
  )
}