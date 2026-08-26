import { useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Chip, LinearProgress, Typography, Avatar } from '@mui/material'
import DataTable from '@shared/components/table/DataTable'
import {
  STAGE_LABELS,
  SPECIAL_STATUS_LABELS,
  STAGE_PHASE_MAP,
  PHASE_COLORS,
  SPECIAL_STATUS_COLORS
} from '../../services/loanService'

// ✅ FIX CRÍTICO: Detecta el formato de argumentos de renderCell
const getRow = (a, b) => {
  if (a && typeof a === 'object' && a.row && typeof a.row === 'object') return a.row
  if (b && typeof b === 'object') return b
  if (a && typeof a === 'object') return a
  return {}
}

let __debugLogged = false

// ===== Helpers seguros =====
const buyerName = (row) => {
  const b = row?.buyer
  if (!b) return '—'
  if (typeof b === 'object') return [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email || '—'
  return String(b)
}

const buyerEmail = (row) => {
  const b = row?.buyer
  return b && typeof b === 'object' ? (b.email || '') : ''
}

const buyerInitials = (row) => {
  const b = row?.buyer
  if (!b || typeof b !== 'object') return '?'
  const f = (b.firstName || '?')[0] || '?'
  const l = (b.lastName || '')[0] || ''
  return `${f}${l}`.toUpperCase()
}

const getPropertyInfo = (row) => {
  try {
    if (row?.propertyId) {
      const prop = row.propertyId
      const lot = prop?.lot?.number || '—'
      const model = prop?.model?.model || prop?.model?.name || ''
      const price = prop?.price ? `$${Number(prop.price).toLocaleString()}` : ''
      const project = row?.projectId?.name || ''
      return {
        main: `🏠 Lot ${lot}${model ? ` — ${model}` : ''}`,
        sub: [project, price].filter(Boolean).join(' • ')
      }
    }
    if (row?.apartmentId) {
      const apt = row.apartmentId
      const aptNum = apt?.apartmentNumber || '—'
      const floor = apt?.floorNumber
      const model = apt?.apartmentModel?.name || apt?.apartmentModel?.modelNumber || ''
      const building = apt?.building?.name || ''
      const price = apt?.price ? `$${Number(apt.price).toLocaleString()}` : ''
      return {
        main: `🏢 Apt ${aptNum}${floor ? ` (Floor ${floor})` : ''}`,
        sub: [building, model ? `Model ${model}` : '', price].filter(Boolean).join(' • ')
      }
    }
    if (row?.propertyAddress) return { main: row.propertyAddress, sub: '' }
    return { main: '—', sub: '' }
  } catch {
    return { main: '—', sub: '' }
  }
}

export default function LoanSummaryTable({ loans = [], loading, onRowClick }) {
  const { t } = useTranslation('loans')
  const safeLoans = Array.isArray(loans) ? loans : []
  const tableRef = useRef(null)

  // ✅ Marcar la primera fila con ID para el tour después del render
  useEffect(() => {
    const markFirstRow = () => {
      // Busca la primera fila del DataTable (maneja tanto MUI DataGrid como custom)
      const selectors = [
        '[data-rowindex="0"]',
        '.MuiDataGrid-row:first-of-type',
        'tbody tr:first-child',
        '[class*="row"]:first-child'
      ]
      
      let firstRow = null
      for (const selector of selectors) {
        firstRow = document.querySelector(selector)
        if (firstRow) break
      }
      
      // Remover ID anterior si existe
      const existing = document.getElementById('loans-row-first')
      if (existing) existing.removeAttribute('id')
      
      // Asignar ID a la primera fila encontrada
      if (firstRow) {
        firstRow.setAttribute('id', 'loans-row-first')
      }
    }

    // Delay para asegurar que el DOM del DataTable esté renderizado
    const timer = setTimeout(markFirstRow, 200)
    return () => clearTimeout(timer)
  }, [safeLoans, loading])

  const columns = useMemo(() => [
    // ===== BUYER =====
    {
      field: 'buyer',
      headerName: t('loans.table.borrower', 'Buyer'),
      flex: 1.3,
      minWidth: 180,
      tourId: 'loans-col-borrower',  // ✅ ID para el tour
      renderCell: (a, b) => {
        const row = getRow(a, b)
        if (!__debugLogged) {
          __debugLogged = true
          console.log('🔍 [LoanSummaryTable] renderCell args:', { a, b, resolved: row })
        }
        try {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 700, fontSize: '0.75rem', width: 32, height: 32 }}>
                {buyerInitials(row)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {buyerName(row)}
                </Typography>
                {buyerEmail(row) && (
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#706f6f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {buyerEmail(row)}
                  </Typography>
                )}
              </Box>
            </Box>
          )
        } catch {
          return <Typography sx={{ color: '#999' }}>—</Typography>
        }
      }
    },

    // ===== PROPERTY / APARTMENT =====
    {
      field: 'property',
      headerName: t('loans.table.property', 'Property'),
      flex: 1.2,
      minWidth: 180,
      tourId: 'loans-col-property',  // ✅ ID para el tour
      renderCell: (a, b) => {
        const row = getRow(a, b)
        try {
          const info = getPropertyInfo(row)
          return (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {info.main}
              </Typography>
              {info.sub && (
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#706f6f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {info.sub}
                </Typography>
              )}
            </Box>
          )
        } catch {
          return <Typography sx={{ color: '#999' }}>—</Typography>
        }
      }
    },

    // ===== LOAN AMOUNT =====
    {
      field: 'loanAmount',
      headerName: t('loans.table.loanAmount', 'Loan Amount'),
      width: 130,
      renderCell: (a, b) => {
        const row = getRow(a, b)
        try {
          const amount = Number(row?.loanAmount) || 0
          return (
            <Box>
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', fontWeight: 700, color: '#2e7d32' }}>
                ${amount.toLocaleString()}
              </Typography>
              {row?.interestRate > 0 && (
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#706f6f' }}>
                  {row.interestRate}% • {row.loanType || 'Conv'}
                </Typography>
              )}
            </Box>
          )
        } catch {
          return <Typography>—</Typography>
        }
      }
    },

    // ===== PROGRESS =====
    {
      field: 'percentComplete',
      headerName: t('loans.table.progress', 'Progress'),
      width: 130,
      renderCell: (a, b) => {
        const row = getRow(a, b)
        try {
          const percent = Math.min(100, Math.max(0, Number(row?.percentComplete) || 0))
          const barColor = percent >= 80 ? '#4caf50' : percent >= 40 ? '#ff9800' : '#2196f3'
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{ flex: 1, height: 6, borderRadius: 0, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { borderRadius: 0, bgcolor: barColor } }}
              />
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#888', minWidth: 28, fontWeight: 600 }}>
                {percent}%
              </Typography>
            </Box>
          )
        } catch {
          return <Typography>—</Typography>
        }
      }
    },

    // ===== PIPELINE STAGE =====
    {
      field: 'pipelineStage',
      headerName: t('loans.table.stage', 'Stage'),
      flex: 1,
      minWidth: 160,
      tourId: 'loans-col-stage',  // ✅ ID para el tour
      renderCell: (a, b) => {
        const row = getRow(a, b)
        try {
          const stageId = row?.pipelineStage
          if (!stageId) return <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#999' }}>—</Typography>
          const phase = STAGE_PHASE_MAP?.[stageId] || 'Application'
          const color = PHASE_COLORS?.[phase] || '#757575'
          const label = STAGE_LABELS?.[stageId] || stageId.replace(/_/g, ' ')
          return (
            <Chip
              label={label}
              size="small"
              sx={{ height: 22, fontSize: '0.6rem', fontFamily: '"Courier New", monospace', letterSpacing: '0.3px', borderRadius: 0, bgcolor: `${color}18`, color: color, border: `1px solid ${color}40`, maxWidth: '100%' }}
            />
          )
        } catch {
          return <Typography sx={{ color: '#999' }}>—</Typography>
        }
      }
    },

    // ===== SPECIAL STATUS =====
    {
      field: 'specialStatus',
      headerName: t('loans.table.status', 'Status'),
      width: 140,
      renderCell: (a, b) => {
        const row = getRow(a, b)
        try {
          const status = row?.specialStatus
          if (!status) {
            return <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', fontWeight: 600, color: '#4caf50' }}>NORMAL</Typography>
          }
          const color = SPECIAL_STATUS_COLORS?.[status] || '#757575'
          const label = SPECIAL_STATUS_LABELS?.[status] || status.replace(/_/g, ' ')
          return (
            <Chip
              label={label}
              size="small"
              sx={{ height: 20, fontSize: '0.58rem', fontFamily: '"Courier New", monospace', borderRadius: 0, bgcolor: `${color}18`, color: color, border: `1px solid ${color}40` }}
            />
          )
        } catch {
          return <Typography>—</Typography>
        }
      }
    },

    // ===== ASSIGNED TO =====
    {
      field: 'assignedTo',
      headerName: t('loans.table.assignedTo', 'Assigned To'),
      width: 150,
      renderCell: (a, b) => {
        const row = getRow(a, b)
        try {
          const assigned = row?.assignedTo
          if (!assigned || typeof assigned !== 'object') {
            return <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#999', fontStyle: 'italic' }}>Unassigned</Typography>
          }
          const name = [assigned.firstName, assigned.lastName].filter(Boolean).join(' ')
          const initials = `${(assigned.firstName || '?')[0] || '?'}${(assigned.lastName || '')[0] || ''}`.toUpperCase()
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#004535', color: 'white', fontWeight: 700, fontSize: '0.65rem', width: 26, height: 26 }}>
                {initials}
              </Avatar>
              <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.78rem', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name}
              </Typography>
            </Box>
          )
        } catch {
          return <Typography>—</Typography>
        }
      }
    },

    // ===== EST. CLOSING =====
    {
      field: 'estimatedClosingDate',
      headerName: t('loans.table.estimatedClosing', 'Est. Closing'),
      width: 120,
      tourId: 'loans-col-closing',  // ✅ ID para el tour
      renderCell: (a, b) => {
        const row = getRow(a, b)
        try {
          const dateStr = row?.estimatedClosingDate
          if (!dateStr) return <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#999' }}>—</Typography>
          const closing = new Date(dateStr)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const norm = new Date(closing)
          norm.setHours(0, 0, 0, 0)
          const days = Math.ceil((norm - today) / (1000 * 60 * 60 * 24))
          const overdue = days < 0
          const urgent = days >= 0 && days <= 7
          const sub = overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d left`
          return (
            <Box>
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.72rem', color: overdue ? '#f44336' : urgent ? '#ff9800' : '#1a1a1a', fontWeight: overdue || urgent ? 700 : 400 }}>
                {closing.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Typography>
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: overdue ? '#f44336' : urgent ? '#ff9800' : '#706f6f' }}>
                {sub}
              </Typography>
            </Box>
          )
        } catch {
          return <Typography>—</Typography>
        }
      }
    }
  ], [t])

  return (
    <DataTable
      columns={columns}
      data={safeLoans}
      loading={loading}
      rowKey="_id"
      onRowClick={onRowClick}
    />
  )
}