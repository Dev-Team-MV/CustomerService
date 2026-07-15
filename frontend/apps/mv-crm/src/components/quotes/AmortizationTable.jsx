// apps/mv-crm/src/components/quotes/AmortizationTable.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material'

export default function AmortizationTable({ schedule }) {
  const { t } = useTranslation('quoteCrm')

  if (!schedule || schedule.length === 0) return null

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid #ececec', borderRadius: 2, mt: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>{t('table.month')}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{t('table.date')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{t('table.payment')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{t('table.principal')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{t('table.interest')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{t('table.balance')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((row, idx) => (
            <TableRow 
              key={idx} 
              sx={{ 
                bgcolor: row.isBalloon ? '#fff8e1' : 'inherit',
                '&:hover': { bgcolor: '#f9f9f9' }
              }}
            >
              <TableCell>
                {row.monthNumber}
                {row.isBalloon && <Chip label="Balloon" size="small" sx={{ ml: 1, height: 20, fontSize: '0.65rem', bgcolor: '#ff9800', color: '#fff' }} />}
              </TableCell>
              <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: row.isBalloon ? 700 : 400, color: row.isBalloon ? '#e65100' : 'inherit' }}>
                ${row.payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell align="right">${row.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
              <TableCell align="right">${row.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>${row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}