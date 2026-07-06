// apps/mv-crm/src/components/reports/ExportButton.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material'
import { Download, Close, TableChart, Description, Warning } from '@mui/icons-material'
import crmReportsService from '../services/crmReportsService'

const ExportButton = ({
  label,
  exportFn,
  params = {},
  filename,
  variant = 'outlined',
  withModal = false,
  filters = [],
  onSuccess,
  onError,
  disabled = false,
  size = 'medium',
  sx = {},
  externalFormat,
  onExternalFormatChange
}) => {
  const { t } = useTranslation(['reports', 'common'])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalFilters, setModalFilters] = useState({})
  const [internalFormat, setInternalFormat] = useState('csv')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // ✅ Usar formato externo si se proporciona, sino el interno
  const format = externalFormat !== undefined ? externalFormat : internalFormat
  const setFormat = onExternalFormatChange || setInternalFormat

  // ✅ Label con fallback
  const buttonLabel = label || t('reports.exportButton', 'Exportar')

  const handleOpenModal = () => {
    const initialFilters = {}
    filters.forEach(f => {
      initialFilters[f.field] = f.defaultValue || ''
    })
    setModalFilters(initialFilters)
    setFormat('csv')
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleFilterChange = (field, value) => {
    setModalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleClearFilters = () => {
    const initialFilters = {}
    filters.forEach(f => {
      initialFilters[f.field] = f.defaultValue || ''
    })
    setModalFilters(initialFilters)
  }

  const validateFilters = () => {
    for (const filter of filters) {
      if (filter.required && !modalFilters[filter.field]) {
        return { 
          valid: false, 
          message: t('reports.validation.required', { field: filter.label })
        }
      }
    }
    return { valid: true }
  }

  const generateFilename = () => {
    if (filename) return filename

    const prefix = 'export'
    const timestamp = new Date().toISOString().split('T')[0]

    if (modalFilters.dateFrom && modalFilters.dateTo) {
      return `${prefix}-${modalFilters.dateFrom}-a-${modalFilters.dateTo}.${format}`
    }

    return `${prefix}-${timestamp}.${format}`
  }

  const handleExport = async (exportParams = params) => {
    setLoading(true)
    try {
      const finalFilename = generateFilename()

      if (format === 'csv') {
        await crmReportsService.exportAndDownload(exportFn, exportParams, finalFilename)
      } else {
        const data = await exportFn({ ...exportParams, format: 'json' })
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        crmReportsService.downloadBlob(blob, finalFilename)
      }

      setSnackbar({
        open: true,
        message: t('reports.success.exported', { format: format.toUpperCase() }),
        severity: 'success'
      })

      if (onSuccess) onSuccess()
      setModalOpen(false)
    } catch (err) {
      console.error('Error exporting:', err)
      const errorMsg = err.response?.data?.message || err.message || t('reports.errors.exportFailed')
      setSnackbar({
        open: true,
        message: `${t('reports.errors.prefix')} ${errorMsg}`,
        severity: 'error'
      })
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportWithModal = () => {
    const validation = validateFilters()
    if (!validation.valid) {
      setSnackbar({
        open: true,
        message: `⚠️ ${validation.message}`,
        severity: 'warning'
      })
      return
    }

    const exportParams = { format }
    Object.keys(modalFilters).forEach(key => {
      if (modalFilters[key]) {
        exportParams[key] = modalFilters[key]
      }
    })

    handleExport(exportParams)
  }

  const handleClick = () => {
    if (withModal) {
      handleOpenModal()
    } else {
      handleExport({ ...params, format })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <>
      <Button
        variant={variant}
        startIcon={loading ? <CircularProgress size={16} /> : <Download />}
        onClick={handleClick}
        disabled={loading || disabled}
        size={size}
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.75rem',
          textTransform: 'none',
          letterSpacing: '0.5px',
          borderColor: '#000',
          color: '#000',
          '&:hover': {
            borderColor: '#333',
            bgcolor: '#f5f5f5'
          },
          ...sx
        }}
      >
        {loading ? t('reports.exporting') : buttonLabel}
      </Button>

      {withModal && (
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              border: '1px solid #ececec'
            }
          }}
        >
          <DialogTitle sx={{
            borderBottom: '1px solid #ececec',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Download sx={{ fontSize: 20 }} />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                {buttonLabel}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseModal} size="small">
              <Close fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              {filters.some(f => f.required) && (
                <Alert
                  severity="warning"
                  icon={<Warning />}
                  sx={{
                    mb: 3,
                    borderRadius: 0,
                    border: '1px solid #ed6c02',
                    bgcolor: '#fff4e5',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem'
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {t('reports.requiredFieldsNote')}
                  </Typography>
                </Alert>
              )}

              <Box display="flex" flexDirection="column" gap={2.5}>
                {filters.map((filter) => {
                  if (filter.type === 'date') {
                    return (
                      <TextField
                        key={filter.field}
                        size="small"
                        type="date"
                        label={`${filter.label}${filter.required ? ' *' : ''}`}
                        value={modalFilters[filter.field] || ''}
                        onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required={filter.required}
                        error={filter.required && !modalFilters[filter.field]}
                        helperText={filter.required && !modalFilters[filter.field] ? t('reports.validation.requiredShort') : ''}
                        fullWidth
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.75rem'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: filter.required && !modalFilters[filter.field] ? '#d32f2f' : '#ececec'
                          },
                          '& .MuiFormHelperText-root': {
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.65rem',
                            color: '#d32f2f'
                          }
                        }}
                      />
                    )
                  }

                  if (filter.type === 'select') {
                    return (
                      <FormControl key={filter.field} size="small" fullWidth>
                        <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                          {filter.label}
                        </InputLabel>
                        <Select
                          value={modalFilters[filter.field] || ''}
                          onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                          label={filter.label}
                          sx={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.75rem',
                            borderRadius: 0,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
                          }}
                        >
                          <MenuItem value="">{filter.placeholder || t('common.all')}</MenuItem>
                          {filter.options.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.render ? option.render(option) : option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )
                  }

                  return null
                })}

                <Divider />

                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem',
                      color: '#888',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      mb: 1.5
                    }}
                  >
                    {t('reports.formatSelector.title')}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      icon={<TableChart sx={{ fontSize: 16 }} />}
                      label="CSV"
                      onClick={() => setFormat('csv')}
                      color={format === 'csv' ? 'success' : 'default'}
                      variant={format === 'csv' ? 'filled' : 'outlined'}
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        cursor: 'pointer'
                      }}
                    />
                    <Chip
                      icon={<Description sx={{ fontSize: 16 }} />}
                      label="JSON"
                      onClick={() => setFormat('json')}
                      color={format === 'json' ? 'primary' : 'default'}
                      variant={format === 'json' ? 'filled' : 'outlined'}
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1 }}>
            <Button
              onClick={handleClearFilters}
              disabled={loading}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#888',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              {t('common.clearFilters')}
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              onClick={handleCloseModal}
              disabled={loading}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#888',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleExportWithModal}
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <Download />}
              disabled={loading}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                textTransform: 'none',
                letterSpacing: '0.5px',
                bgcolor: '#000',
                borderRadius: 0,
                '&:hover': { bgcolor: '#333' }
              }}
            >
              {loading ? t('reports.exporting') : t('reports.exportFormat', { format: format.toUpperCase() })}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ fontFamily: '"Helvetica Neue", sans-serif', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ExportButton