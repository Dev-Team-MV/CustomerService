// apps/mv-crm/src/components/documents/VersionHistoryDrawer.jsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer, Box, Typography, List, ListItem, ListItemText, ListItemIcon,
  Button, CircularProgress, Divider, IconButton, Alert, Chip
} from '@mui/material'
import { History, Close, Upload, FilePresent, Download } from '@mui/icons-material'
import documentService from '../../services/documentService'

export default function VersionHistoryDrawer({ open, onClose, document, onUploadSuccess }) {
  const { t } = useTranslation('documents')
  
  const [versions, setVersions] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  // ✅ Construimos el historial directamente desde el objeto del documento (Sin llamadas a API)
  useEffect(() => { 
    if (open && document) {
      const currentVersion = {
        _id: document._id,
        version: document.version || 1,
        uploadedBy: document.uploadedBy 
          ? `${document.uploadedBy.firstName || ''} ${document.uploadedBy.lastName || ''}`.trim() || document.uploadedBy.email 
          : 'Desconocido',
        createdAt: document.createdAt,
        fileUrl: document.fileUrl,
        isCurrent: true
      }

      const versionsList = [currentVersion]

      // Procesar previousVersion (puede ser un objeto o un array)
      if (document.previousVersion) {
        if (Array.isArray(document.previousVersion)) {
          document.previousVersion.forEach(p => {
            versionsList.push({
              _id: p._id,
              version: p.version,
              uploadedBy: 'Versión Anterior',
              createdAt: document.updatedAt, // Fallback de fecha
              fileUrl: p.fileUrl,
              isArchived: true
            })
          })
        } else {
          versionsList.push({
            _id: document.previousVersion._id,
            version: document.previousVersion.version,
            uploadedBy: 'Versión Anterior',
            createdAt: document.updatedAt,
            fileUrl: document.previousVersion.fileUrl,
            isArchived: true
          })
        }
      }

      setVersions(versionsList)
      setUploadError('')
    } 
  }, [open, document])

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !document?._id) return

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      await documentService.uploadVersion(document._id, formData)
      
      if (onUploadSuccess) onUploadSuccess()
      onClose()
    } catch (err) {
      setUploadError(err.response?.data?.message || t('history.uploadError', 'Error al subir la nueva versión'))
    } finally {
      setUploading(false)
      e.target.value = null
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 350 } }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <History color="primary" />
          <Typography variant="h6" fontWeight={600}>{t('history.title')}</Typography>
        </Box>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <List>
          {versions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              {t('history.noVersions', 'No hay historial de versiones disponible')}
            </Typography>
          ) : (
            versions.map((v, idx) => (
              <Box key={v._id}>
                <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ mt: 0.5 }}>
                    <FilePresent color={v.isCurrent ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography fontWeight={700} color={v.isCurrent ? 'primary.main' : 'text.primary'}>
                          {t('history.version')} {v.version}
                        </Typography>
                        {v.isCurrent && (
                          <Chip label={t('history.current', 'Actual')} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                        )}
                        {v.isArchived && (
                          <Chip label={t('history.archived', 'Archivada')} size="small" color="default" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {t('history.uploadedBy')}: {v.uploadedBy}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(v.createdAt).toLocaleString()}
                        </Typography>
                        {/* ✅ Botón para descargar esta versión específica */}
                        {v.fileUrl && (
                          <Button 
                            size="small" 
                            startIcon={<Download fontSize="small" />} 
                            href={v.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem', p: 0, minHeight: 'auto' }}
                          >
                            {t('actions.download', 'Descargar')}
                          </Button>
                        )}
                      </>
                    } 
                  />
                </ListItem>
                {idx < versions.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))
          )}
        </List>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />

        {uploadError && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
            {uploadError}
          </Alert>
        )}

        <Button 
          fullWidth 
          variant="contained" 
          color="primary"
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <Upload />} 
          onClick={handleUploadClick}
          disabled={uploading}
          sx={{ mt: 2, borderRadius: 1 }}
        >
          {uploading ? t('history.uploading', 'Subiendo...') : t('actions.newVersion')}
        </Button>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          {t('history.uploadHint', 'Al subir, la versión anterior se archivará automáticamente')}
        </Typography>
      </Box>
    </Drawer>
  )
}