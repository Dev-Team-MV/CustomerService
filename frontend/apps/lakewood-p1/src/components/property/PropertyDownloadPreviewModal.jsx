import { useState, useMemo } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography,
  Table, TableHead, TableBody, TableRow, TableCell,
  Divider, LinearProgress, CircularProgress
} from '@mui/material'
import {
  Download, Description, LibraryBooks, AccountBalance, Close
} from '@mui/icons-material'
import propertyService from '../../services/propertyService'

const PHASE_WEIGHTS = { 1: 10, 2: 15, 3: 15, 4: 15, 5: 10, 6: 10, 7: 10, 8: 10, 9: 5 }

function getConstructionPct(phases = []) {
  return phases.reduce(
    (acc, p) => acc + (p.constructionPercentage * (PHASE_WEIGHTS[p.phaseNumber] ?? 0)) / 100,
    0
  )
}

function fmt(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
}

const DOWNLOAD_TYPES = [
  {
    value: 'individual',
    icon: Description,
    label: 'PDF Individual',
    desc: 'Un PDF separado por cada propiedad seleccionada'
  },
  {
    value: 'combined',
    icon: LibraryBooks,
    label: 'PDF Combinado',
    desc: 'Un solo PDF con todas las propiedades, cada una en su sección'
  },
  {
    value: 'balance',
    icon: AccountBalance,
    label: 'Balance General',
    desc: 'Resumen ejecutivo con totales y desglose por propiedad'
  }
]

export default function PropertyDownloadPreviewModal({ open, onClose, selectedProperties }) {
  const [downloadType, setDownloadType] = useState('individual')
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  const count = selectedProperties.length

  const totals = useMemo(() => ({
    totalValue:   selectedProperties.reduce((s, p) => s + Number(p.price || 0), 0),
    totalPending: selectedProperties.reduce((s, p) => s + Number(p.pending || 0), 0),
    totalPaid:    selectedProperties.reduce((s, p) => s + (Number(p.price || 0) - Number(p.pending || 0)), 0)
  }), [selectedProperties])

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      if (downloadType === 'individual') {
        for (const prop of selectedProperties) {
          const label = prop.lot?.number ? `lot-${prop.lot.number}` : prop._id
          await propertyService.downloadAccountStatementPdf(prop._id, `estado-${label}.pdf`)
          await new Promise(r => setTimeout(r, 400))
        }
      } else if (downloadType === 'combined') {
        await propertyService.downloadBulkCombinedStatementPdf(
          selectedProperties.map(p => p._id),
          'estados-combinados.pdf'
        )
      } else {
        await propertyService.downloadBalanceGeneralPdf(
          selectedProperties.map(p => p._id),
          'balance-general.pdf'
        )
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Error al descargar. Intente de nuevo.')
    } finally {
      setDownloading(false)
    }
  }

  const downloadLabel = () => {
    if (downloading) return 'Descargando...'
    if (downloadType === 'individual') return `Descargar ${count} PDF${count !== 1 ? 's' : ''}`
    return 'Descargar PDF'
  }

  return (
    <Dialog
      open={open}
      onClose={downloading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#333F1F' }}>
            Descargar Estado de Propiedades
          </Typography>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#706f6f', mt: 0.3 }}>
            {count} propiedad{count !== 1 ? 'es' : ''} seleccionada{count !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          disabled={downloading}
          sx={{ minWidth: 0, p: 0.5, color: '#706f6f' }}
        >
          <Close fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5, pb: 1 }}>
        {/* Download type selector */}
        <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#333F1F', mb: 1.5 }}>
          Tipo de descarga
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          {DOWNLOAD_TYPES.map(({ value, icon: Icon, label, desc }) => (
            <Box
              key={value}
              onClick={() => !downloading && setDownloadType(value)}
              sx={{
                flex: '1 1 0',
                minWidth: 140,
                p: 2,
                borderRadius: 2,
                cursor: downloading ? 'default' : 'pointer',
                border: '2px solid',
                borderColor: downloadType === value ? '#333F1F' : 'rgba(0,0,0,0.1)',
                bgcolor: downloadType === value ? 'rgba(51,63,31,0.05)' : 'white',
                transition: 'all 0.18s',
                '&:hover': !downloading ? { borderColor: '#8CA551' } : {}
              }}
            >
              <Icon sx={{ fontSize: 22, color: downloadType === value ? '#333F1F' : '#8CA551', mb: 0.75, display: 'block' }} />
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', lineHeight: 1.2 }}>
                {label}
              </Typography>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', color: '#706f6f', mt: 0.5, lineHeight: 1.35 }}>
                {desc}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Balance totals — only shown for 'balance' type */}
        {downloadType === 'balance' && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
            {[
              { label: 'Propiedades',    value: String(count) },
              { label: 'Valor Total',    value: fmt(totals.totalValue)   },
              { label: 'Total Pagado',   value: fmt(totals.totalPaid)    },
              { label: 'Saldo Pendiente', value: fmt(totals.totalPending) }
            ].map(stat => (
              <Box key={stat.label} sx={{ flex: '1 1 0', minWidth: 110, p: 1.5, bgcolor: '#f5f7f0', borderRadius: 2 }}>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: '#706f6f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </Typography>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#333F1F', mt: 0.4 }}>
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Preview table */}
        <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#333F1F', mb: 1 }}>
          Vista previa de propiedades seleccionadas
        </Typography>
        <Box sx={{ overflowX: 'auto', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, maxHeight: 280, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {['Lote', 'Modelo', 'Propietario', 'Precio', 'Pendiente', 'Avance'].map(h => (
                  <TableCell
                    key={h}
                    sx={{
                      fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                      fontSize: '0.72rem', color: '#333F1F', py: 1,
                      bgcolor: '#f5f7f0', borderBottom: '2px solid rgba(51,63,31,0.15)'
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedProperties.map(prop => {
                const constructionPct = getConstructionPct(prop.phases || [])
                const owner = prop.users?.[0]
                return (
                  <TableRow key={prop._id} sx={{ '&:hover': { bgcolor: 'rgba(140,165,81,0.04)' } }}>
                    <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.8rem', py: 1.2, whiteSpace: 'nowrap' }}>
                      Lote {prop.lot?.number || '-'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#706f6f', py: 1.2 }}>
                      {prop.model?.model || '-'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#706f6f', py: 1.2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {owner ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim() : '-'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#333F1F', py: 1.2, whiteSpace: 'nowrap' }}>
                      {fmt(prop.price)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', fontWeight: 600, color: prop.pending > 0 ? '#E5863C' : '#8CA551', py: 1.2, whiteSpace: 'nowrap' }}>
                      {fmt(prop.pending)}
                    </TableCell>
                    <TableCell sx={{ minWidth: 120, py: 1.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(constructionPct, 100)}
                          sx={{
                            flex: 1, height: 6, borderRadius: 1,
                            bgcolor: 'rgba(140,165,81,0.15)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: constructionPct >= 100 ? '#8CA551' : '#333F1F',
                              borderRadius: 1
                            }
                          }}
                        />
                        <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.73rem', fontWeight: 700, color: '#333F1F', minWidth: 34, textAlign: 'right' }}>
                          {constructionPct.toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>

        {error && (
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#d32f2f', mt: 1.5, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={downloading}
          sx={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            fontSize: '0.85rem', textTransform: 'none', color: '#706f6f',
            borderRadius: 2, px: 2
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <Download />}
          onClick={handleDownload}
          disabled={downloading}
          sx={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
            fontSize: '0.85rem', textTransform: 'none',
            borderRadius: 2, px: 3,
            bgcolor: '#333F1F', color: 'white',
            '&:hover': { bgcolor: '#4a5d3a' },
            '&.Mui-disabled': { bgcolor: 'rgba(51,63,31,0.4)', color: 'white' }
          }}
        >
          {downloadLabel()}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
