import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, CircularProgress, IconButton, Tooltip } from '@mui/material'
import Lock from '@mui/icons-material/Lock'
import LockOpen from '@mui/icons-material/LockOpen'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const RecorridoImagesModal = ({ open, onClose, puntos, imagesMap, onUpload, onVisibilityChange, loading }) => {
  const { t } = useTranslation(['masterPlan']);
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})

  const handleFileChange = (id, e) => {
    const file = e.target.files[0]
    setFiles(prev => ({ ...prev, [id]: file }))
    setPreviews(prev => ({ ...prev, [id]: file ? URL.createObjectURL(file) : null }))
  }

  const getImageUrl = (img) => (img && typeof img === 'object' && img.url ? img.url : img)
  const hasImage = (id) => previews[String(id)] || imagesMap[String(id)]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('manageTourImages')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {puntos.map((point) => {
            const img = imagesMap[String(point.id)]
            const imgUrl = getImageUrl(img)
            const isPublic = img && typeof img === 'object' && 'isPublic' in img ? img.isPublic !== false : true
            const filename = img && typeof img === 'object' && img.filename ? img.filename : null
            return (
              <Grid item xs={12} sm={6} md={4} key={point.id}>
                <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, position: 'relative' }}>
                  <Typography fontWeight={600}>{t(`tourPoints.${point.name}`, point.name)}</Typography>
                  {previews[String(point.id)] ? (
                    <Box
                      component="img"
                      src={previews[String(point.id)]}
                      alt={point.name}
                      sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, my: 1 }}
                    />
                  ) : imgUrl ? (
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={imgUrl}
                        alt={point.name}
                        sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, my: 1 }}
                      />
                      {onVisibilityChange && filename && (
                        <Tooltip title={isPublic ? 'Pública (clic para ocultar sin token)' : 'Privada (clic para mostrar sin token)'}>
                          <IconButton
                            size="small"
                            onClick={() => onVisibilityChange(filename, !isPublic)}
                            disabled={loading}
                            sx={{
                              position: 'absolute',
                              bottom: 12,
                              left: 8,
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '&:hover': { bgcolor: isPublic ? '#8CA551' : '#666', color: 'white' }
                            }}
                          >
                            {isPublic ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: 120, bgcolor: '#f5f5f5', borderRadius: 2, my: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                      No image
                    </Box>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`upload-input-${point.id}`}
                    onChange={e => handleFileChange(point.id, e)}
                    disabled={loading}
                  />
                  <label htmlFor={`upload-input-${point.id}`}>
                    <Button
                      variant="outlined"
                      component="span"
                      size="small"
                      fullWidth
                      disabled={loading}
                    >
                      {hasImage(point.id) ? t('replaceImage') : t('uploadImage')}
                    </Button>
                  </label>
                  {files[point.id] && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 1 }}
                      fullWidth
                      onClick={() => onUpload(point.id, files[point.id])}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={18} /> : 'Save'}
                    </Button>
                  )}
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{t('common:close')}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RecorridoImagesModal