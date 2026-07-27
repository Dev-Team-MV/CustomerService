// apps/mv-crm/src/constants/Columns/quoteColumns.jsx
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, PictureAsPdf, ShoppingCart, Send } from '@mui/icons-material'

export const useQuoteColumns = ({ t, onEdit, onDelete, onSend, onConvert, onDownload }) => {
  const getStatusConfig = (status) => {
    const map = {
      draft: { label: t('status.draft', 'Borrador'), color: '#757575', bg: '#f5f5f5' },
      sent: { label: t('status.sent', 'Enviado'), color: '#1976d2', bg: '#e3f2fd' },
      accepted: { label: t('status.accepted', 'Aceptado'), color: '#2e7d32', bg: '#e8f5e9' },
      expired: { label: t('status.expired', 'Expirado'), color: '#d32f2f', bg: '#ffebee' },
      converted: { label: t('status.converted', 'Convertido'), color: '#7b1fa2', bg: '#f3e5f5' }
    }
    return map[status] || map.draft
  }

  return [
    {
      field: 'date',
      headerName: t('table.date', 'Fecha'),
      minWidth: 120,
      renderCell: ({ row }) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#666' }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'client',
      headerName: t('table.client', 'Cliente'),
      minWidth: 180,
      renderCell: ({ row }) => {
        const clientName = row.clientId 
          ? `${row.clientId.firstName || ''} ${row.clientId.lastName || ''}`.trim() 
          : (row.leadId?.name || 'N/A')
        return (
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {clientName}
          </Typography>
        )
      }
    },
    {
      field: 'project',
      headerName: t('table.project', 'Proyecto'),
      minWidth: 150,
      renderCell: ({ row }) => {
        const projectName = typeof row.projectId === 'object' 
          ? row.projectId.name || (row.projectId.title && (row.projectId.title.es || row.projectId.title.en))
          : row.projectName || 'N/A'
        return (
          <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>
            {projectName}
          </Typography>
        )
      }
    },
    {
      field: 'total',
      headerName: t('table.totalPrice', 'Precio Total'),
      minWidth: 120,
      align: 'right',
      renderCell: ({ row }) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
          ${row.totalPrice?.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: t('table.status', 'Estado'),
      minWidth: 130,
      renderCell: ({ row }) => {
        const config = getStatusConfig(row.status)
        return (
          <Chip 
            label={config.label} 
            size="small" 
            sx={{ bgcolor: config.bg, color: config.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }} 
          />
        )
      }
    },
    {
      field: 'actions',
      headerName: t('table.actions', 'Acciones'),
      minWidth: 150,
      align: 'center',
      renderCell: ({ row }) => {
        // ✅ Si ya está convertida, SOLO mostrar el botón de PDF
        if (row.status === 'converted') {
          return (
            <Tooltip title={t('actions.downloadPdf', 'Descargar PDF')}>
              <IconButton size="small" onClick={() => onDownload?.(row)} sx={{ color: '#f44336' }}>
                <PictureAsPdf fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }

        // Para el resto de estados, mostramos las acciones normales
        // (Ocultamos editar/eliminar/enviar/convertir si está expirada)
        const isExpired = row.status === 'expired'

        return (
          <Box display="flex" gap={0.5} justifyContent="center">
            {!isExpired && (
              <Tooltip title={t('actions.edit', 'Editar')}>
                <IconButton size="small" onClick={() => onEdit?.(row)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {!isExpired && (
              <>
                <Tooltip title={t('actions.send', 'Enviar')}>
                  <IconButton size="small" onClick={() => onSend?.(row)} sx={{ color: '#1976d2' }}>
                    <Send fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('actions.convertToSale', 'Convertir a Venta')}>
                  <IconButton size="small" onClick={() => onConvert?.(row)} sx={{ color: '#4caf50' }}>
                    <ShoppingCart fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            <Tooltip title={t('actions.downloadPdf', 'Descargar PDF')}>
              <IconButton size="small" onClick={() => onDownload?.(row)} sx={{ color: '#f44336' }}>
                <PictureAsPdf fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {!isExpired && (
              <Tooltip title={t('actions.delete', 'Eliminar')}>
                <IconButton size="small" onClick={() => onDelete?.(row._id)} sx={{ color: '#9e9e9e' }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )
      }
    }
  ]
}

export default useQuoteColumns