import { useState } from 'react'
import { Box, Typography, List, ListItem, IconButton, Tooltip, CircularProgress, Select, MenuItem, Link } from '@mui/material'
import { UploadFile, CheckCircle, Description, Delete, OpenInNew } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export default function LoanDocumentChecklist({ loanId, documentChecklist = [], onUpdate, onUpload, onDelete }) {
  const { t } = useTranslation('loans')
  const [uploadingType, setUploadingType] = useState(null)
  const [updatingType, setUpdatingType] = useState(null)

  const handleFileChange = async (docType, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingType(docType)
    try {
      await onUpload(loanId, docType, file)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploadingType(null)
    }
  }

  const handleStatusChange = async (docType, status) => {
    setUpdatingType(docType)
    try {
      await onUpdate(loanId, docType, { status })
    } catch (err) {
      console.error('Status update error:', err)
    } finally {
      setUpdatingType(null)
    }
  }

  const handleDeleteFile = async (docType) => {
    setUploadingType(docType)
    try {
      await onDelete(loanId, docType)
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setUploadingType(null)
    }
  }

  // ✅ Statuses traducidos dinámicamente
  const statusOptions = [
    { value: 'requested', label: t('loans.documentChecklist.status.requested') },
    { value: 'received', label: t('loans.documentChecklist.status.received') },
    { value: 'missing', label: t('loans.documentChecklist.status.missing') },
    { value: 'under_review', label: t('loans.documentChecklist.status.under_review') },
    { value: 'approved', label: t('loans.documentChecklist.status.approved') },
    { value: 'not_applicable', label: t('loans.documentChecklist.status.not_applicable') }
  ]

  return (
    <Box sx={{ border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff' }}>
      <List sx={{ p: 0, maxHeight: 600, overflowY: 'auto' }}>
        {documentChecklist.map((doc) => {
          const status = doc.status || 'requested'
          const label = t(`loans.documentTypes.${doc.documentType}`, doc.documentType)
          const busy = uploadingType === doc.documentType || updatingType === doc.documentType

          return (
            <ListItem key={doc._id || doc.documentType} sx={{ borderBottom: '1px solid #f0f0f0', py: 1.5, px: 2, alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ color: status === 'approved' ? '#4caf50' : '#9e9e9e', display: 'flex' }}>
                {status === 'approved' ? <CheckCircle /> : <Description />}
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Helvetica Neue", sans-serif' }}>
                  {label}
                </Typography>
                {doc.fileUrl ? (
                  <Link href={doc.fileUrl} target="_blank" rel="noopener" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <OpenInNew sx={{ fontSize: 12 }} /> {doc.gcsFileName || t('loans.documentChecklist.viewFile', 'View file')}
                  </Link>
                ) : (
                  <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#9e9e9e' }}>
                    {t('loans.documentChecklist.noFileUploaded')}
                  </Typography>
                )}
                {doc.notes && (
                  <Typography variant="caption" sx={{ display: 'block', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#706f6f', fontStyle: 'italic' }}>
                    {t('loans.documentChecklist.note', 'Note')}: {doc.notes}
                  </Typography>
                )}
              </Box>

              <Select
                size="small"
                value={status}
                disabled={busy}
                onChange={(e) => handleStatusChange(doc.documentType, e.target.value)}
                sx={{
                  minWidth: 140, borderRadius: 0,
                  fontFamily: '"Courier New", monospace', fontSize: '0.7rem',
                  '& .MuiSelect-select': { py: 0.75, fontFamily: '"Courier New", monospace' }
                }}
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <input
                  accept="application/pdf,image/*"
                  style={{ display: 'none' }}
                  id={`upload-${doc.documentType}`}
                  type="file"
                  onChange={(e) => handleFileChange(doc.documentType, e)}
                />
                <Tooltip title={t('loans.documents.upload')}>
                  <IconButton
                    size="small"
                    disabled={busy}
                    onClick={() => document.getElementById(`upload-${doc.documentType}`)?.click()}
                    sx={{ color: '#2196f3', borderRadius: 0 }}
                  >
                    {uploadingType === doc.documentType ? <CircularProgress size={16} /> : <UploadFile fontSize="small" />}
                  </IconButton>
                </Tooltip>

                {doc.fileUrl && (
                  <Tooltip title={t('loans.documents.delete')}>
                    <IconButton
                      size="small"
                      disabled={busy}
                      onClick={() => handleDeleteFile(doc.documentType)}
                      sx={{ color: '#f44336', borderRadius: 0 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}