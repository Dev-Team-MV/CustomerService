// apps/mv-crm/src/components/documents/DocumentViewer.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton, Alert } from '@mui/material'
import { Close, Download, OpenInNew } from '@mui/icons-material'
import documentService from '../../services/documentService'

export default function DocumentViewer({ open, onClose, document: doc }) {
  const { t } = useTranslation('documents')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (open && doc) loadPreview()
  }, [open, doc?._id])

  const loadPreview = async () => {
    if (!doc) return
    setLoading(true)
    setError(null)
    try {
      if (doc.fileUrl) {
        setPreviewUrl(doc.fileUrl)
        return
      }
      if (doc._id) {
        const data = await documentService.getDocumentById(doc._id)
        setPreviewUrl(data.fileUrl)
      }
    } catch (err) {
      console.error('Error cargando vista previa:', err)
      setError(err.response?.data?.message || 'Error al cargar la vista previa')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = doc?.title || 'documento'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    if (previewUrl) window.open(previewUrl, '_blank')
  }

  const fileUrlLower = doc?.fileUrl?.toLowerCase() || ''
  const isImage = doc?.mimeType?.startsWith('image/') || fileUrlLower.includes('.jpg') || fileUrlLower.includes('.jpeg') || fileUrlLower.includes('.png') || fileUrlLower.includes('.gif') || fileUrlLower.includes('.webp')
  const isPDF = doc?.mimeType === 'application/pdf' || fileUrlLower.includes('.pdf')

  const handleClose = () => {
    setPreviewUrl(null)
    setError(null)
    onClose()
  }

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }

  return (
    <Dialog id="document-viewer-modal" open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec' }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{doc?.title || 'Documento'}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>
            {doc?.category && t(`categories.${doc.category}`)}
            {doc?.tags?.length > 0 && ` • ${doc.tags.join(', ')}`}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent id="document-viewer-content" dividers sx={{ minHeight: 400, position: 'relative' }}>
        {loading && <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid' }}>{error}</Alert>}

        {!loading && !error && previewUrl && (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isImage ? (
              <img src={previewUrl} alt={doc?.title} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
            ) : isPDF ? (
              <iframe src={previewUrl} title={doc?.title} style={{ width: '100%', height: '70vh', border: 'none' }} />
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary" mb={2} sx={{ fontFamily: '"Courier New", monospace' }}>Vista previa no disponible para este tipo de archivo</Typography>
                <Button variant="contained" startIcon={<OpenInNew />} onClick={handleOpenInNewTab} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>Abrir en nueva pestaña</Button>
              </Box>
            )}
          </Box>
        )}

        {!loading && !error && !previewUrl && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>No hay archivo disponible para previsualizar</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions id="document-viewer-actions" sx={{ p: 2, gap: 1, borderTop: '1px solid #ececec' }}>
        <Button onClick={handleClose} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('actions.close', 'Cerrar')}</Button>
        {previewUrl && (
          <>
            <Button variant="outlined" startIcon={<OpenInNew />} onClick={handleOpenInNewTab} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>{t('actions.openInNewTab', 'Abrir')}</Button>
            <Button variant="contained" startIcon={<Download />} onClick={handleDownload} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>{t('actions.download', 'Descargar')}</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}