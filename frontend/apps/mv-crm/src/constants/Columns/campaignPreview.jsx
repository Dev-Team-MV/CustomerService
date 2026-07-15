// apps/mv-crm/src/constants/Columns/campaignPreview.js
import { Box, Typography } from '@mui/material'
import { Person, Phone, Message } from '@mui/icons-material'

export const useCampaignPreviewColumns = ({ t }) => [
  {
    field: 'label',
    headerName: t('table.name', 'Nombre'),
    minWidth: 200,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Person sx={{ fontSize: 16, color: '#888' }} />
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#000'
          }}
        >
          {row.label}
        </Typography>
      </Box>
    )
  },
  {
    field: 'phone',
    headerName: t('table.phone', 'Teléfono'),
    minWidth: 150,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Phone sx={{ fontSize: 16, color: '#888' }} />
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#666',
            letterSpacing: '0.5px'
          }}
        >
          {row.phone}
        </Typography>
      </Box>
    )
  },
  {
    field: 'previewMessage',
    headerName: t('table.message', 'Mensaje'),
    minWidth: 300,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Message sx={{ fontSize: 16, color: '#888' }} />
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 400
          }}
        >
          {row.previewMessage}
        </Typography>
      </Box>
    )
  }
]

export default useCampaignPreviewColumns