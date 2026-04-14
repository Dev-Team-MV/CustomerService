// AgoraImagesModal.jsx
import { useState } from "react"
import { Box, Typography, Tabs, Tab, Grid, Alert, CircularProgress } from "@mui/material"
import { CloudUpload, Map, Layers, Check } from "@mui/icons-material"
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import ModalWrapper from "@shared/constants/ModalWrapper"
import PrimaryButton from "@shared/constants/PrimaryButton"
import ImagePreview from '@shared/components/ImgPreview'
import communitySpacesService from "../../../Services/ComunitySpacesService"

const PHASE_2_PROJECT_ID = import.meta.env.VITE_PROJECT_ID || '6751c5e6a6f0f0e0e6f0f0e0'

const AgoraImagesModal = ({ 
  open, 
  onClose, 
  agoraData = null,
  onUploaded
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['agora', 'common'])
  const [tab, setTab] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState({
    exterior: [],
    planos: []
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const AGORA_SECTIONS = [
    { key: 'exterior', label: t('agora:sections.exterior'), icon: Map },
    { key: 'planos', label: t('agora:sections.blueprints'), icon: Layers }
  ]

  const getCurrentSection = () => AGORA_SECTIONS[tab].key
  
  const getCurrentExistingImages = () => {
    if (!agoraData?.space?.sections) return []
    const section = agoraData.space.sections[getCurrentSection()]
    return getCurrentSection() === 'exterior' ? (section?.images || []) : (section?.items || [])
  }
  
  const getCurrentSelectedFiles = () => selectedFiles[getCurrentSection()] || []
  const getTotalSelectedFiles = () => Object.values(selectedFiles).reduce((sum, files) => sum + files.length, 0)

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return
    
    const section = getCurrentSection()
    setSelectedFiles(prev => ({
      ...prev,
      [section]: [
        ...prev[section],
        ...files.map(file => ({ file, isPublic: false }))
      ]
    }))
  }

  const handleRemoveSelectedFile = (idx) => {
    const section = getCurrentSection()
    setSelectedFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== idx)
    }))
  }

  const handleToggleSelectedFileVisibility = (idx, checked) => {
    const section = getCurrentSection()
    setSelectedFiles(prev => ({
      ...prev,
      [section]: prev[section].map((f, i) =>
        i === idx ? { ...f, isPublic: checked } : f
      )
    }))
  }

  const handleToggleUploadedImageVisibility = async (idx, checked) => {
    const section = getCurrentSection()
    const currentImages = getCurrentExistingImages()
    
    try {
      const updatedSections = { ...agoraData.space.sections }
      
      if (section === 'exterior') {
        updatedSections.exterior = {
          ...updatedSections.exterior,
          images: currentImages.map((img, i) =>
            i === idx ? { ...img, isPublic: checked } : img
          )
        }
      } else {
        updatedSections.planos = {
          ...updatedSections.planos,
          items: currentImages.map((img, i) =>
            i === idx ? { ...img, isPublic: checked } : img
          )
        }
      }

      await communitySpacesService.updateCommunitySpace(
        PHASE_2_PROJECT_ID, 'agora',
        { label: agoraData.space.label, sections: updatedSections }
      )

      if (onUploaded) onUploaded()
    } catch (err) {
      console.error('[AgoraImagesModal] Error toggling visibility:', err)
      setError(t('agora:errorVisibility'))
    }
  }

  const handleDeleteUploadedImage = async (idx) => {
    const section = getCurrentSection()
    const currentImages = getCurrentExistingImages()
    
    try {
      const updatedSections = { ...agoraData.space.sections }
      
      if (section === 'exterior') {
        updatedSections.exterior = {
          ...updatedSections.exterior,
          images: currentImages.filter((_, i) => i !== idx)
        }
      } else {
        updatedSections.planos = {
          ...updatedSections.planos,
          items: currentImages.filter((_, i) => i !== idx)
        }
      }

      await communitySpacesService.updateCommunitySpace(
        PHASE_2_PROJECT_ID, 'agora',
        { label: agoraData.space.label, sections: updatedSections }
      )

      if (onUploaded) onUploaded()
    } catch (err) {
      console.error('[AgoraImagesModal] Error deleting image:', err)
      setError(t('agora:errorDelete'))
    }
  }

  const handleConfirmUpload = async () => {
    setUploading(true)
    setError(null)
    
    try {
      const updatedSections = { ...agoraData.space.sections }

      for (const section of AGORA_SECTIONS) {
        const key = section.key
        if (selectedFiles[key].length > 0) {
          const uploadedImages = await communitySpacesService.uploadCommunitySpaceImages(
            selectedFiles[key],
            'agora',
            key
          )

          if (key === 'exterior') {
            updatedSections.exterior = {
              ...updatedSections.exterior,
              images: [
                ...(updatedSections.exterior?.images || []),
                ...uploadedImages
              ]
            }
          } else {
            updatedSections.planos = {
              ...updatedSections.planos,
              items: [
                ...(updatedSections.planos?.items || []),
                ...uploadedImages.map(img => ({
                  ...img,
                  name: img.name || `Plano ${(updatedSections.planos?.items?.length || 0) + 1}`
                }))
              ]
            }
          }
        }
      }

      await communitySpacesService.updateCommunitySpace(
        PHASE_2_PROJECT_ID, 'agora',
        { label: agoraData.space.label, sections: updatedSections }
      )

      setSelectedFiles({ exterior: [], planos: [] })
      
      if (onUploaded) onUploaded()
      onClose()
    } catch (err) {
      console.error('[AgoraImagesModal] Error uploading:', err)
      setError(t('agora:errorUpload'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={CloudUpload}
      title={t('agora:manageImagesTitle')}
      subtitle={
        getTotalSelectedFiles() > 0
          ? `${getTotalSelectedFiles()} ${t('agora:filesReady')}`
          : undefined
      }
      actions={
        <>
          <PrimaryButton variant="outlined" color="secondary" onClick={onClose}>
            {t('agora:close')}
          </PrimaryButton>
          <PrimaryButton
            onClick={handleConfirmUpload}
            disabled={getTotalSelectedFiles() === 0 || uploading}
            loading={uploading}
            startIcon={!uploading ? <Check /> : undefined}
          >
            {uploading ? t('agora:uploading') : `${t('agora:uploadAll')} (${getTotalSelectedFiles()})`}
          </PrimaryButton>
        </>
      }
      maxWidth="md"
      fullWidth
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        {AGORA_SECTIONS.map((section) => (
          <Tab 
            key={section.key}
            icon={<section.icon />} 
            label={section.label} 
            iconPosition="start"
          />
        ))}
      </Tabs>

      <Box mb={3}>
        <PrimaryButton 
          component="label" 
          startIcon={<CloudUpload />} 
          disabled={uploading}
        >
          {t('agora:selectImages')}
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </PrimaryButton>
        <Typography variant="caption" display="block" mt={1} color="text.secondary">
          {t('agora:currentSection')}: <strong>{AGORA_SECTIONS[tab].label}</strong>
        </Typography>
      </Box>

      {uploading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: theme.palette.secondary.main }} />
        </Box>
      ) : (
        <>
          {getCurrentSelectedFiles().length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                {t('agora:newImages')} ({getCurrentSelectedFiles().length})
              </Typography>
              <Grid container spacing={2}>
                {getCurrentSelectedFiles().map((item, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <ImagePreview
                      src={URL.createObjectURL(item.file)}
                      alt={`Preview ${idx + 1}`}
                      isPublic={!!item.isPublic}
                      onTogglePublic={checked => handleToggleSelectedFileVisibility(idx, checked)}
                      onDelete={() => handleRemoveSelectedFile(idx)}
                      showVisibilityChip={true}
                      label={t('common:new')}
                      publicLabel={t('common:public')}
                      privateLabel={t('common:private')}
                      noImageLabel={t('common:noImage')}
                      imgSx={{ height: 150 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {getCurrentExistingImages().length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                {t('agora:uploadedImages')} ({getCurrentExistingImages().length})
              </Typography>
              <Grid container spacing={2}>
                {getCurrentExistingImages().map((img, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <ImagePreview
                      src={typeof img === 'string' ? img : img.url}
                      alt={img.name || `${AGORA_SECTIONS[tab].label} ${idx + 1}`}
                      isPublic={!!(img.isPublic ?? true)}
                      onTogglePublic={checked => handleToggleUploadedImageVisibility(idx, checked)}
                      onDelete={() => handleDeleteUploadedImage(idx)}
                      showVisibilityChip={true}
                      publicLabel={t('common:public')}
                      privateLabel={t('common:private')}
                      noImageLabel={t('common:noImage')}
                      imgSx={{ height: 150 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {getCurrentExistingImages().length === 0 && getCurrentSelectedFiles().length === 0 && (
            <Box sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              border: '1px dashed #e0e0e0'
            }}>
              <Typography variant="body2" color="text.secondary">
                {t('agora:noImagesYet')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                {t('agora:selectToStart')}
              </Typography>
            </Box>
          )}
        </>
      )}
    </ModalWrapper>
  )
}

export default AgoraImagesModal