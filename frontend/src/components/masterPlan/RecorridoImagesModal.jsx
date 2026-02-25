import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch, FormControlLabel } from '@mui/material';
import uploadService from '../../services/uploadService'

const RecorridoImagesModal = ({ open, onClose, puntos, imagesMap, onUpload, onVisibilityChange, loading }) => {
  const { t } = useTranslation(['masterPlan']);
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})

  const [isPublicMap, setIsPublicMap] = useState({});

  const handleIsPublicChange = (id, value) => {
    setIsPublicMap(prev => ({ ...prev, [id]: value }));
      console.log(`[RecorridoImagesModal] Punto ${id} isPublic:`, value);

  };

    const getImageSrc = (id) => {
    // previews tienen prioridad (archivo local seleccionado)
    const p = previews && previews[String(id)];
    if (p) return p;
    // imagesMap puede ser string (url) o objeto { url, isPublic, filename }
    const img = imagesMap && imagesMap[String(id)];
    if (!img) return null;
    return typeof img === 'string' ? img : (img.url || null);
  };

    // NEW: toggle handler that persists visibility (optimistic)
  const handleToggleIsPublic = async (id, checked) => {
    const prev = { ...isPublicMap };
    setIsPublicMap(prevMap => ({ ...prevMap, [id]: checked })); // optimistic

    const identifier = imagesMap && imagesMap[String(id)]
      ? (typeof imagesMap[String(id)] === 'string' ? imagesMap[String(id)] : imagesMap[String(id)].url || null)
      : null;

    const payload = {
      // backend expects filename in body; uploadService will extract filename from identifier if needed
      identifier,
      isPublic: checked
    };
    console.log('[RecorridoImagesModal] toggle visibility ->', { id, payload });

    try {
      const res = await uploadService.updateRecorridoImageVisibility(payload);
      // If backend returns explicit isPublic, use it; otherwise keep optimistic value
      const serverIsPublic = res?.isPublic ?? res?.data?.isPublic ?? null;
      if (serverIsPublic !== null && serverIsPublic !== undefined) {
        setIsPublicMap(prevMap => ({ ...prevMap, [id]: !!serverIsPublic }));
      } else {
        // keep optimistic checked value
        setIsPublicMap(prevMap => ({ ...prevMap, [id]: checked }));
      }
      console.log('[RecorridoImagesModal] visibility updated on server', res);
    } catch (err) {
      console.error('[RecorridoImagesModal] error updating visibility, revert local', err);
      setIsPublicMap(prev); // revert
    }
  };


  const handleFileChange = (id, e) => {
    const file = e.target.files[0]
    setFiles(prev => ({ ...prev, [id]: file }))
    setPreviews(prev => ({ ...prev, [id]: file ? URL.createObjectURL(file) : null }));
    setIsPublicMap(prev => ({ ...prev, [id]: false }));

  }

    // Sync isPublicMap from imagesMap when modal opens or imagesMap changes.
  // imagesMap can be either { pointId: url } or { pointId: { url, isPublic } }
  useEffect(() => {
    if (!open) return;
    const init = {};
    (puntos || []).forEach(p => {
      const key = String(p.id);
      const img = imagesMap && imagesMap[key];
      if (img && typeof img === 'object' && ('isPublic' in img)) {
        init[p.id] = !!img.isPublic;
      } else {
        // default to false (private) if we don't have explicit isPublic info
        init[p.id] = false;
      }
    });
    setIsPublicMap(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imagesMap, puntos]);
  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('manageTourImages')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {puntos.map((point) => (
            <Grid item xs={12} sm={6} md={4} key={point.id}>
              <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2 }}>

                <FormControlLabel
  control={
    <Switch
      checked={!!isPublicMap[point.id]}
                      onChange={e => {
                        const v = e.target.checked;
                        // if there's already an uploaded image, persist toggle; otherwise just set local
                        if (imagesMap && imagesMap[String(point.id)]) {
                          handleToggleIsPublic(point.id, v);
                        } else {
                          handleIsPublicChange(point.id, v);
                        }
                      }}      
      color="success"
      size="small"
    />
  }
  label={isPublicMap[point.id] ? t('public', 'Public') : t('private', 'Private')}
  sx={{ mb: 1, fontFamily: '"Poppins", sans-serif' }}
/>

                <Typography fontWeight={600}>{t(`tourPoints.${point.name}`, point.name)}</Typography>
                {getImageSrc(point.id) ? (
                  <Box
                    component="img"
                    src={getImageSrc(point.id)}
                    alt={point.name}
                    sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, my: 1 }}
                  />
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
                    {imagesMap[point.id] ? t('replaceImage') : t('uploadImage')}
                  </Button>
                </label>
                {files[point.id] && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    fullWidth
  onClick={() => onUpload(point.id, files[point.id], isPublicMap[point.id])}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={18} /> : 'Save'}
                  </Button>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{t('common:close')}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RecorridoImagesModal