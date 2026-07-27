// apps/mv-crm/src/components/documents/EntityDocuments.jsx
import { useState, useEffect } from 'react'
import { Box, Button, Grid } from '@mui/material'
import { Add } from '@mui/icons-material'
import DocumentCard from './DocumentCard'
import DocumentUploadModal from './DocumentUploadModal'
import documentService from '../../services/documentService'

export default function EntityDocuments({ entityType, entityId }) {
  const [docs, setDocs] = useState([])
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    const fetchDocs = async () => {
      const params = entityType === 'client' ? { clientId: entityId } : { projectId: entityId }
      const res = await documentService.getDocuments(params)
      setDocs(res.documents || [])
    }
    if (entityId) fetchDocs()
  }, [entityType, entityId])

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" startIcon={<Add />} onClick={() => setUploadOpen(true)}>
          Subir Documento
        </Button>
      </Box>
      <Grid container spacing={2}>
        {docs.map(doc => (
          <Grid item xs={12} sm={6} md={4} key={doc._id}>
            <DocumentCard doc={doc} onPreview={() => {}} onHistory={() => {}} onArchive={() => {}} onDelete={() => {}} />
          </Grid>
        ))}
      </Grid>
      <DocumentUploadModal 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        defaultClientId={entityType === 'client' ? entityId : undefined}
        defaultProjectId={entityType === 'project' ? entityId : undefined}
        onUploadSuccess={() => {
          setUploadOpen(false)
          // Trigger refetch (simplificado aquí)
          window.location.reload() 
        }} 
      />
    </Box>
  )
}