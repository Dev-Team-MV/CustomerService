import { Box, Typography, Grid, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import uploadService from '../../services/uploadService'
import ImagePreview from '../../components/ImgPreview'
import PrimaryButton from '../../constants/PrimaryButton'
import ModalWrapper from '../../constants/ModalWrapper'

const RecorridoImagesModal = ({ open, onClose, puntos, imagesMap, onUpload, onVisibilityChange, loading }) => {
  const { t } = useTranslation(['masterPlan']);
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})
  const [isPublicMap, setIsPublicMap] = useState({});

  const handleIsPublicChange = (id, value) => {
    setIsPublicMap(prev => ({ ...prev, [id]: value }));
  };

  const getImageSrc = (id) => {
    const p = previews && previews[String(id)];
    if (p) return p;
    const img = imagesMap && imagesMap[String(id)];
    if (!img) return null;
    return typeof img === 'string' ? img : (img.url || null);
  };

  const handleToggleIsPublic = async (id, checked) => {
    const prev = { ...isPublicMap };
    setIsPublicMap(prevMap => ({ ...prevMap, [id]: checked })); // optimistic

    const stored = imagesMap && imagesMap[String(id)];
    const identifier = stored ? (typeof stored === 'string' ? stored : (stored.url || stored.filename || null)) : null;

    const getFilenameFromIdentifier = (ident) => {
      if (!ident) return null;
      if (typeof ident !== 'string') return null;
      try {
        const u = new URL(ident);
        return u.pathname.split('/').pop();
      } catch (e) {
        return ident.split('/').pop().split('?')[0];
      }
    };

    const filename = getFilenameFromIdentifier(identifier);
    if (!filename) {
      setIsPublicMap(prev);
      return;
    }

    const payload = { filename, isPublic: checked };

    try {
      const res = await uploadService.updateRecorridoVisibility(payload);
      const serverIsPublic = res?.isPublic ?? res?.data?.isPublic ?? null;
      if (serverIsPublic !== null && serverIsPublic !== undefined) {
        setIsPublicMap(prevMap => ({ ...prevMap, [id]: !!serverIsPublic }));
      } else {
        setIsPublicMap(prevMap => ({ ...prevMap, [id]: checked }));
      }
      if (onVisibilityChange) onVisibilityChange(id, { filename, isPublic: !!checked });
    } catch (err) {
      setIsPublicMap(prev); // revert
    }
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0]
    setFiles(prev => ({ ...prev, [id]: file }))
    setPreviews(prev => ({ ...prev, [id]: file ? URL.createObjectURL(file) : null }));
    setIsPublicMap(prev => ({ ...prev, [id]: false }));
  }

  useEffect(() => {
    if (!open) return;
    const init = {};
    (puntos || []).forEach(p => {
      const key = String(p.id);
      const img = imagesMap && imagesMap[key];
      if (img && typeof img === 'object' && ('isPublic' in img)) {
        init[p.id] = !!img.isPublic;
      } else {
        init[p.id] = false;
      }
    });
    setIsPublicMap(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imagesMap, puntos]);

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('manageTourImages')}
      actions={
        <PrimaryButton variant="outlined" color="secondary" onClick={onClose} disabled={loading}>
          {t('common:close')}
        </PrimaryButton>
      }
      maxWidth="md"
      fullWidth
    >
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
                  : undefined
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
                <PrimaryButton
                  variant="outlined"
                  component="span"
                  size="small"
                  fullWidth
                  disabled={loading}
                >
                  {imagesMap[point.id] ? t('replaceImage') : t('uploadImage')}
                </PrimaryButton>
              </label>
              {files[point.id] && (
                <PrimaryButton
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={() => onUpload(point.id, files[point.id], isPublicMap[point.id])}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={18} /> : 'Save'}
                </PrimaryButton>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </ModalWrapper>
  )
}

export default RecorridoImagesModal