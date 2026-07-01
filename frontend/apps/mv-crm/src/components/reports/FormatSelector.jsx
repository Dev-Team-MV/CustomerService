// apps/mv-crm/src/components/reports/FormatSelector.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip } from '@mui/material'
import { TableChart, Description } from '@mui/icons-material'

const FormatSelector = ({ format, onChange }) => {
  const { t } = useTranslation('reports')

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.65rem',
          color: '#888',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}
      >
        {t('formatSelector.label', 'Formato:')}
      </Typography>
      <Chip
        icon={<TableChart sx={{ fontSize: 14 }} />}
        label="CSV"
        onClick={() => onChange('csv')}
        color={format === 'csv' ? 'success' : 'default'}
        variant={format === 'csv' ? 'filled' : 'outlined'}
        size="small"
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          cursor: 'pointer'
        }}
      />
      <Chip
        icon={<Description sx={{ fontSize: 14 }} />}
        label="JSON"
        onClick={() => onChange('json')}
        color={format === 'json' ? 'primary' : 'default'}
        variant={format === 'json' ? 'filled' : 'outlined'}
        size="small"
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          cursor: 'pointer'
        }}
      />
    </Box>
  )
}

export default FormatSelector