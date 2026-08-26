import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Typography, Chip, IconButton, MenuItem, Select, Tooltip
} from '@mui/material'
import {
  CloudUpload, Delete, Download, Description
} from '@mui/icons-material'
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
  LOAN_DOCUMENT_STATUSES
} from '../../services/loanService'

export default function LoanDocumentChecklist({
  checklist = [],
  onStatusChange,
  onUpload,
  onDeleteFile
}) {
  const { t } = useTranslation('loans')
  const fileInputRefs = useRef({})

  const handleFileSelect = (docType) => (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload?.(docType, file)
      e.target.value = ''
    }
  }

  const received = checklist.filter(d => d.status === 'received' || d.status === 'approved').length
  const total = checklist.filter(d => d.status !== 'not_applicable').length

  return (
    <Box id="loan-document-checklist" sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff', mb: 3 }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000' }}
        >
          {t('loans.documentChecklist.title')}
        </Typography>
        {total > 0 && (
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#888' }}>
            {received}/{total} {t('loans.documentChecklist.complete', 'complete')}
          </Typography>
        )}
      </Box>

      <Box sx={{ overflow: 'auto' }}>
        {checklist.map((doc) => (
          <Box
            key={doc.documentType}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderBottom: '1px solid #f5f5f5',
              '&:hover': { bgcolor: '#fafafa' }
            }}
          >
            <Description sx={{ fontSize: 16, color: '#bbb' }} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '0.8rem',
                  color: '#000',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
              </Typography>
              {doc.uploadedAt && (
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: '#aaa' }}>
                  {t('loans.documentChecklist.uploaded', 'Uploaded')} {new Date(doc.uploadedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>

            <Select
              value={doc.status || 'not_applicable'}
              onChange={(e) => onStatusChange?.(doc.documentType, { status: e.target.value })}
              size="small"
              sx={{
                height: 28,
                fontSize: '0.65rem',
                fontFamily: '"Courier New", monospace',
                borderRadius: 0,
                minWidth: 120,
                '& .MuiSelect-select': { py: 0.5 }
              }}
            >
              {LOAN_DOCUMENT_STATUSES.map(s => (
                <MenuItem key={s} value={s} sx={{ fontSize: '0.72rem' }}>
                  {DOCUMENT_STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>

            <Chip
              label={DOCUMENT_STATUS_LABELS[doc.status] || doc.status}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.55rem',
                fontFamily: '"Courier New", monospace',
                borderRadius: 0,
                bgcolor: (DOCUMENT_STATUS_COLORS[doc.status] || '#9e9e9e') + '18',
                color: DOCUMENT_STATUS_COLORS[doc.status] || '#9e9e9e',
                border: `1px solid ${(DOCUMENT_STATUS_COLORS[doc.status] || '#9e9e9e')}40`,
                minWidth: 60
              }}
            />

            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <input
                type="file"
                hidden
                ref={(el) => { fileInputRefs.current[doc.documentType] = el }}
                onChange={handleFileSelect(doc.documentType)}
              />
              <Tooltip title={t('loans.documents.upload')}>
                <IconButton
                  size="small"
                  onClick={() => fileInputRefs.current[doc.documentType]?.click()}
                >
                  <CloudUpload sx={{ fontSize: 16, color: '#2196f3' }} />
                </IconButton>
              </Tooltip>

              {doc.fileUrl && (
                <>
                  <Tooltip title={t('loans.documents.download', 'Download')}>
                    <IconButton size="small" component="a" href={doc.fileUrl} target="_blank" rel="noopener">
                      <Download sx={{ fontSize: 16, color: '#4caf50' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('loans.documents.delete')}>
                    <IconButton size="small" onClick={() => onDeleteFile?.(doc.documentType)}>
                      <Delete sx={{ fontSize: 16, color: '#f44336' }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}