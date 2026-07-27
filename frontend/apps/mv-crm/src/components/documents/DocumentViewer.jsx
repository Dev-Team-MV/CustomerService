// // apps/mv-crm/src/components/documents/DocumentViewer.jsx
// import { useState, useEffect } from 'react'
// import { useTranslation } from 'react-i18next'
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
//   CircularProgress, IconButton, Alert
// } from '@mui/material'
// import { Close, Download, OpenInNew } from '@mui/icons-material'
// import documentService from '../../services/documentService'

// export default function DocumentViewer({ open, onClose, document: doc }) {
//   const { t } = useTranslation('documents')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [previewUrl, setPreviewUrl] = useState(null)

//   useEffect(() => {
//     if (open && doc) {
//       loadPreview()
//     }
//   }, [open, doc])

//   const loadPreview = async () => {
//     if (!doc) return
    
//     setLoading(true)
//     setError(null)
    
//     try {
//       // Si ya tiene fileUrl, usar directamente
//       if (doc.fileUrl) {
//         setPreviewUrl(doc.fileUrl)
//         return
//       }
      
//       // Si no, obtener el documento completo
//       const data = await documentService.getDocumentById(doc._id)
//       setPreviewUrl(data.fileUrl)
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error al cargar la vista previa')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDownload = () => {
//     if (!previewUrl) return
    
//     const link = document.createElement('a')
//     link.href = previewUrl
//     link.download = doc.title || 'documento'
//     link.target = '_blank'
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const handleOpenInNewTab = () => {
//     if (previewUrl) {
//       window.open(previewUrl, '_blank')
//     }
//   }

//   const isImage = doc?.mimeType?.startsWith('image/') || 
//                   doc?.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  
//   const isPDF = doc?.mimeType === 'application/pdf' || 
//                 doc?.fileUrl?.match(/\.pdf$/i)

//   const handleClose = () => {
//     setPreviewUrl(null)
//     setError(null)
//     onClose()
//   }

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
//       <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Box>
//           <Typography variant="h6" fontWeight={700}>
//             {doc?.title || 'Documento'}
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             {doc?.category && t(`categories.${doc.category}`)}
//             {doc?.tags?.length > 0 && ` • ${doc.tags.join(', ')}`}
//           </Typography>
//         </Box>
//         <IconButton onClick={handleClose} size="small">
//           <Close />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent dividers sx={{ minHeight: 400, position: 'relative' }}>
//         {loading && (
//           <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//             <CircularProgress />
//           </Box>
//         )}

//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}

//         {!loading && !error && previewUrl && (
//           <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//             {isImage ? (
//               <img
//                 src={previewUrl}
//                 alt={doc?.title}
//                 style={{
//                   maxWidth: '100%',
//                   maxHeight: '70vh',
//                   objectFit: 'contain'
//                 }}
//               />
//             ) : isPDF ? (
//               <iframe
//                 src={previewUrl}
//                 title={doc?.title}
//                 style={{
//                   width: '100%',
//                   height: '70vh',
//                   border: 'none'
//                 }}
//               />
//             ) : (
//               <Box textAlign="center" py={4}>
//                 <Typography variant="body1" color="text.secondary" mb={2}>
//                   Vista previa no disponible para este tipo de archivo
//                 </Typography>
//                 <Button
//                   variant="contained"
//                   startIcon={<OpenInNew />}
//                   onClick={handleOpenInNewTab}
//                 >
//                   Abrir en nueva pestaña
//                 </Button>
//               </Box>
//             )}
//           </Box>
//         )}

//         {!loading && !error && !previewUrl && (
//           <Box textAlign="center" py={4}>
//             <Typography variant="body1" color="text.secondary">
//               No hay archivo disponible para previsualizar
//             </Typography>
//           </Box>
//         )}
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1 }}>
//         <Button onClick={handleClose}>
//           {t('actions.close', 'Cerrar')}
//         </Button>
//         {previewUrl && (
//           <>
//             <Button
//               variant="outlined"
//               startIcon={<OpenInNew />}
//               onClick={handleOpenInNewTab}
//             >
//               {t('actions.openInNewTab', 'Abrir')}
//             </Button>
//             <Button
//               variant="contained"
//               startIcon={<Download />}
//               onClick={handleDownload}
//               sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
//             >
//               {t('actions.download')}
//             </Button>
//           </>
//         )}
//       </DialogActions>
//     </Dialog>
//   )
// }

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  CircularProgress, IconButton, Alert
} from '@mui/material'
import { Close, Download, OpenInNew } from '@mui/icons-material'
import documentService from '../../services/documentService'

export default function DocumentViewer({ open, onClose, document: doc }) {
  const { t } = useTranslation('documents')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // ✅ Dependemos de open y doc._id para recargar solo cuando cambia el documento real
  useEffect(() => {
    if (open && doc) {
      loadPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doc?._id])

  const loadPreview = async () => {
    if (!doc) return
    
    setLoading(true)
    setError(null)
    
    try {
      // ✅ Si el objeto ya viene con fileUrl (como en tu JSON), lo usamos directamente
      if (doc.fileUrl) {
        setPreviewUrl(doc.fileUrl)
        return
      }
      
      // ✅ Si solo viene el _id, lo buscamos en el backend
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
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  // ✅ CORRECCIÓN CLAVE: Usar .includes() en lugar de regex con $ 
  // Esto soporta URLs firmadas que tienen parámetros al final (?GoogleAccessId=...)
  const fileUrlLower = doc?.fileUrl?.toLowerCase() || ''
  
  const isImage = doc?.mimeType?.startsWith('image/') || 
                  fileUrlLower.includes('.jpg') ||
                  fileUrlLower.includes('.jpeg') ||
                  fileUrlLower.includes('.png') ||
                  fileUrlLower.includes('.gif') ||
                  fileUrlLower.includes('.webp')
  
  const isPDF = doc?.mimeType === 'application/pdf' || 
                fileUrlLower.includes('.pdf')

  const handleClose = () => {
    setPreviewUrl(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {doc?.title || 'Documento'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {doc?.category && t(`categories.${doc.category}`)}
            {doc?.tags?.length > 0 && ` • ${doc.tags.join(', ')}`}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 400, position: 'relative' }}>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && previewUrl && (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isImage ? (
              <img
                src={previewUrl}
                alt={doc?.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            ) : isPDF ? (
              <iframe
                src={previewUrl}
                title={doc?.title}
                style={{
                  width: '100%',
                  height: '70vh',
                  border: 'none'
                }}
              />
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  Vista previa no disponible para este tipo de archivo
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<OpenInNew />}
                  onClick={handleOpenInNewTab}
                >
                  Abrir en nueva pestaña
                </Button>
              </Box>
            )}
          </Box>
        )}

        {!loading && !error && !previewUrl && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No hay archivo disponible para previsualizar
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose}>
          {t('actions.close', 'Cerrar')}
        </Button>
        {previewUrl && (
          <>
            <Button
              variant="outlined"
              startIcon={<OpenInNew />}
              onClick={handleOpenInNewTab}
            >
              {t('actions.openInNewTab', 'Abrir')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
            >
              {t('actions.download', 'Descargar')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}