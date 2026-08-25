import { useMemo } from 'react'
import { Box, Chip, LinearProgress, Typography } from '@mui/material'
import DataTable from '@shared/components/table/DataTable'
import {
  STAGE_LABELS,
  SPECIAL_STATUS_LABELS,
  STAGE_PHASE_MAP,
  PHASE_COLORS,
  SPECIAL_STATUS_COLORS
} from '../../services/loanService'

function buyerName(loan) {
  const b = loan.buyer
  if (!b) return '—'
  if (typeof b === 'object') return [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email || '—'
  return String(b)
}

export default function LoanSummaryTable({ loans = [], loading, onRowClick }) {
  const columns = useMemo(() => [
    {
      field: 'buyer',
      headerName: 'Buyer',
      flex: 1.2,
      minWidth: 150,
      renderCell: (row) => (
        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.82rem', fontWeight: 400 }}>
          {buyerName(row)}
        </Typography>
      )
    },
    {
      field: 'propertyAddress',
      headerName: 'Property',
      flex: 1,
      minWidth: 120,
      renderCell: (row) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#555' }}>
          {row.propertyAddress || row.propertyId?.lot?.number ? `Lot ${row.propertyId.lot.number}` : '—'}
        </Typography>
      )
    },
    {
      field: 'loanAmount',
      headerName: 'Loan Amount',
      width: 120,
      renderCell: (row) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
          {row.loanAmount ? `$${row.loanAmount.toLocaleString()}` : '—'}
        </Typography>
      )
    },
    {
      field: 'pipelineStage',
      headerName: 'Stage',
      flex: 1,
      minWidth: 160,
      renderCell: (row) => {
        const phase = STAGE_PHASE_MAP[row.pipelineStage]
        const color = PHASE_COLORS[phase] || '#757575'
        return (
          <Chip
            label={STAGE_LABELS[row.pipelineStage] || row.pipelineStage}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6rem',
              fontFamily: '"Courier New", monospace',
              letterSpacing: '0.3px',
              borderRadius: 0,
              bgcolor: color + '18',
              color: color,
              border: `1px solid ${color}40`,
              maxWidth: '100%'
            }}
          />
        )
      }
    },
    {
      field: 'specialStatus',
      headerName: 'Status',
      width: 140,
      renderCell: (row) => {
        if (!row.specialStatus) return null
        const color = SPECIAL_STATUS_COLORS[row.specialStatus] || '#757575'
        return (
          <Chip
            label={SPECIAL_STATUS_LABELS[row.specialStatus] || row.specialStatus}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.58rem',
              fontFamily: '"Courier New", monospace',
              borderRadius: 0,
              bgcolor: color + '18',
              color: color,
              border: `1px solid ${color}40`
            }}
          />
        )
      }
    },
    {
      field: 'percentComplete',
      headerName: 'Progress',
      width: 120,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={row.percentComplete || 0}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 0,
              bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 0,
                bgcolor: row.percentComplete >= 80 ? '#4caf50' : row.percentComplete >= 40 ? '#ff9800' : '#2196f3'
              }
            }}
          />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#888', minWidth: 28 }}>
            {row.percentComplete || 0}%
          </Typography>
        </Box>
      )
    },
    {
      field: 'lender',
      headerName: 'Lender',
      width: 130,
      renderCell: (row) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: '#555' }}>
          {row.lender || '—'}
        </Typography>
      )
    },
    {
      field: 'estimatedClosingDate',
      headerName: 'Est. Closing',
      width: 110,
      renderCell: (row) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#555' }}>
          {row.estimatedClosingDate ? new Date(row.estimatedClosingDate).toLocaleDateString() : '—'}
        </Typography>
      )
    }
  ], [])

  return (
    <DataTable
      columns={columns}
      data={loans}
      loading={loading}
      rowKey="_id"
      onRowClick={onRowClick}
    />
  )
}
