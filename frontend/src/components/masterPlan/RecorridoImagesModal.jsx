import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch, FormControlLabel } from '@mui/material';
import uploadService from '../../services/uploadService'
import ImagePreview from '../../components/ImgPreview'; // Ajusta el path si es necesario

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
  // ...existing code...
    const handleToggleIsPublic = async (id, checked) => {
      const prev = { ...isPublicMap };
      setIsPublicMap(prevMap => ({ ...prevMap, [id]: checked })); // optimistic
  
      // Obtener el identificador (url o obj) y extraer filename
      const stored = imagesMap && imagesMap[String(id)];
      const identifier = stored ? (typeof stored === 'string' ? stored : (stored.url || stored.filename || null)) : null;
  
      const getFilenameFromIdentifier = (ident) => {
        if (!ident) return null;
        if (typeof ident !== 'string') return null;
        try {
          // try URL parse (removes query params)
          const u = new URL(ident);
          return u.pathname.split('/').pop();
        } catch (e) {
          // fallback: strip query string if present
          return ident.split('/').pop().split('?')[0];
        }
      };
  
      const filename = getFilenameFromIdentifier(identifier);
      if (!filename) {
        console.warn('[RecorridoImagesModal] No filename could be derived for point', id, { identifier, stored });
        // revert optimistic if we can't target backend
        setIsPublicMap(prev);
        return;
      }
  
      const payload = { filename, isPublic: checked };
      console.log('[RecorridoImagesModal] toggle visibility -> payload prepared:', payload);

      try {
        // Send object payload (service accepts both forms now)
        const res = await uploadService.updateRecorridoVisibility(payload);
        console.log('[RecorridoImagesModal] updateRecorridoVisibility server response:', res);

        const serverIsPublic = res?.isPublic ?? res?.data?.isPublic ?? null;
        if (serverIsPublic !== null && serverIsPublic !== undefined) {
          setIsPublicMap(prevMap => ({ ...prevMap, [id]: !!serverIsPublic }));
        } else {
          setIsPublicMap(prevMap => ({ ...prevMap, [id]: checked }));
        }
        if (onVisibilityChange) onVisibilityChange(id, { filename, isPublic: !!checked });
      } catch (err) {
        console.error('[RecorridoImagesModal] error updating visibility, revert local', err);
        setIsPublicMap(prev); // revert
      }
    };
  // ...existing code...


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

                                <Typography fontWeight={600}>{t(`tourPoints.${point.name}`, point.name)}</Typography>
                <ImagePreview
                  src={getImageSrc(point.id)}
                  alt={point.name}
                  isPublic={!!isPublicMap[point.id]}
                  onTogglePublic={checked => {
                    if (imagesMap && imagesMap[String(point.id)]) {
                      handleToggleIsPublic(point.id, checked);
                    } else {
                      handleIsPublicChange(point.id, checked);
                    }
                  }}
                  onDelete={files[point.id]
                    ? () => setFiles(prev => ({ ...prev, [point.id]: undefined }))
                    : undefined // Si tienes lógica para borrar del backend, ponla aquí
                  }
                  showSwitch={!!getImageSrc(point.id)}
                  switchPosition="top-right"
                  sx={{ my: 1, borderRadius: 2 }}
                  imgSx={{ height: 120 }}
                />
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