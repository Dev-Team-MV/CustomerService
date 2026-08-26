import { useMemo } from 'react'
import { Box, Typography, Avatar, Chip, IconButton, Tooltip } from '@mui/material'
import { Visibility, Edit, Delete, Warning } from '@mui/icons-material'
import { STAGE_COLORS, LOAN_SPECIAL_STATUSES, LOAN_PIPELINE_STAGES } from '../../services/loanService'

export const useLoanColumns = ({ t, onViewDetails, onEdit, onDelete }) => {
  return useMemo(() => [
    // ✅ BORROWER (objeto populado)
    {
      field: 'borrower',
      headerName: t('loans.table.borrower', 'Borrower'),
      minWidth: 220,
      renderCell: ({ row }) => {
        const buyer = row.buyer && typeof row.buyer === 'object' ? row.buyer : null
        const firstName = buyer?.firstName || 'Unknown'
        const lastName = buyer?.lastName || ''
        const email = buyer?.email || row.buyerContactInfo || t('loans.common.noEmail', 'No email')
        const initials = `${(firstName[0] || '?')}${(lastName[0] || '')}`.toUpperCase()

        return (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 700, fontSize: '0.8rem', width: 36, height: 36 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {firstName} {lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },

    // ✅ PROPERTY / APARTMENT (maneja ambos tipos de recurso)
    {
      field: 'property',
      headerName: t('loans.table.property', 'Property'),
      minWidth: 200,
      renderCell: ({ row }) => {
        const projectName = row.projectId?.name || ''
        
        // Caso 1: Property (casa/lote)
        if (row.propertyId) {
          const prop = row.propertyId
          const lotNumber = prop.lot?.number || prop.lot?.lotNumber || '-'
          const modelName = prop.model?.model || prop.model?.name || '-'
          const price = prop.price ? `$${Number(prop.price).toLocaleString()}` : ''

          return (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                🏠 Lot {lotNumber} - {modelName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontSize: '0.68rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {projectName} {price && `• ${price}`}
              </Typography>
            </Box>
          )
        }
        
        // Caso 2: Apartment (apartamento)
        if (row.apartmentId) {
          const apt = row.apartmentId
          const aptNumber = apt.apartmentNumber || '-'
          const floorNum = apt.floorNumber || '-'
          const modelName = apt.apartmentModel?.name || apt.apartmentModel?.modelNumber || '-'
          const buildingName = apt.building?.name || ''
          const price = apt.price ? `$${Number(apt.price).toLocaleString()}` : ''

          return (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                🏢 Apt {aptNumber} (Floor {floorNum}) 
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontSize: '0.68rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
               {projectName} • {buildingName && `${buildingName} • `}Model {modelName} {price && `• ${price}`}
              </Typography>
            </Box>
          )
        }
        
        // Caso 3: Sin propiedad ni apartamento
        return (
          <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
            {t('loans.common.notAvailable', 'N/A')}
          </Typography>
        )
      }
    },

    // ✅ LOAN AMOUNT
    {
      field: 'loanAmount',
      headerName: t('loans.table.loanAmount', 'Loan Amount'),
      minWidth: 130,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>
            ${Number(row.loanAmount || 0).toLocaleString()}
          </Typography>
          {row.interestRate > 0 && (
            <Typography variant="caption" sx={{ color: '#706f6f', fontSize: '0.68rem' }}>
              {row.interestRate}% • {row.loanType || 'Conventional'}
            </Typography>
          )}
        </Box>
      )
    },

    // ✅ PURCHASE PRICE
    {
      field: 'purchasePrice',
      headerName: t('loans.table.purchasePrice', 'Purchase Price'),
      minWidth: 130,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          ${Number(row.purchasePrice || 0).toLocaleString()}
        </Typography>
      )
    },

    // ✅ PIPELINE STAGE (usando LOAN_PIPELINE_STAGES para el label bonito)
    {
      field: 'pipelineStage',
      headerName: t('loans.table.stage', 'Pipeline Stage'),
      minWidth: 180,
      renderCell: ({ row }) => {
        const stageId = row.pipelineStage || row.stage
        const stageDef = LOAN_PIPELINE_STAGES.find(s => s.id === stageId)
        const phaseColor = STAGE_COLORS[stageDef?.phase] || '#757575'
        const stageLabel = stageDef?.name || (stageId ? stageId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A')

        return (
          <Box>
            <Chip 
              label={stageLabel} 
              size="small" 
              sx={{ 
                bgcolor: `${phaseColor}15`, 
                color: phaseColor, 
                fontWeight: 600, 
                border: `1px solid ${phaseColor}40`,
                fontSize: '0.7rem',
                borderRadius: 0,
                height: 22
              }} 
            />
            {row.percentComplete !== undefined && row.percentComplete !== null && (
              <Typography variant="caption" sx={{ display: 'block', color: '#706f6f', fontSize: '0.65rem', mt: 0.3, fontFamily: '"Courier New", monospace' }}>
                {row.percentComplete}% complete
              </Typography>
            )}
          </Box>
        )
      }
    },

    // ✅ SPECIAL STATUS
    {
      field: 'specialStatus',
      headerName: t('loans.table.status', 'Status'),
      minWidth: 140,
      renderCell: ({ row }) => {
        if (!row.specialStatus) {
          return (
            <Typography variant="caption" sx={{ color: '#4caf50', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }}>
              NORMAL
            </Typography>
          )
        }
        const status = LOAN_SPECIAL_STATUSES.find(s => s.key === row.specialStatus)
        const statusLabel = status?.label || row.specialStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        return (
          <Chip 
            icon={<Warning sx={{ fontSize: 14 }} />} 
            label={statusLabel} 
            size="small"
            sx={{ 
              bgcolor: `${status?.color || '#ff9800'}15`, 
              color: status?.color || '#ff9800', 
              fontWeight: 600, 
              border: `1px solid ${status?.color || '#ff9800'}40`,
              fontSize: '0.7rem',
              borderRadius: 0,
              height: 22
            }}
          />
        )
      }
    },

    // ✅ NEXT ACTION
    {
      field: 'nextAction',
      headerName: t('loans.table.nextAction', 'Next Action'),
      minWidth: 200,
      renderCell: ({ row }) => {
        const na = row.nextAction
        if (!na || !na.description) {
          return (
            <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
              {t('loans.common.none', 'None defined')}
            </Typography>
          )
        }

        const responsible = na.responsiblePerson && typeof na.responsiblePerson === 'object'
          ? `${na.responsiblePerson.firstName || ''} ${na.responsiblePerson.lastName || ''}`.trim()
          : ''

        const isOverdue = na.deadline && new Date(na.deadline) < new Date()
        const deadlineStr = na.deadline 
          ? new Date(na.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : ''

        return (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1a1a1a' }}>
              {na.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.3, flexWrap: 'wrap' }}>
              {deadlineStr && (
                <Typography variant="caption" sx={{ 
                  color: isOverdue ? '#f44336' : '#706f6f', 
                  fontSize: '0.65rem', 
                  fontFamily: '"Courier New", monospace',
                  fontWeight: isOverdue ? 700 : 400
                }}>
                  {isOverdue ? '⚠ ' : ''}{deadlineStr}
                </Typography>
              )}
              {responsible && (
                <Typography variant="caption" sx={{ color: '#706f6f', fontSize: '0.65rem' }}>
                  • {responsible}
                </Typography>
              )}
            </Box>
          </Box>
        )
      }
    },

    // ✅ ASSIGNED TO
    {
      field: 'assignedTo',
      headerName: t('loans.table.assignedTo', 'Assigned To'),
      minWidth: 160,
      renderCell: ({ row }) => {
        const assigned = row.assignedTo && typeof row.assignedTo === 'object' ? row.assignedTo : null
        if (!assigned) {
          return (
            <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
              {t('loans.common.unassigned', 'Unassigned')}
            </Typography>
          )
        }
        const initials = `${(assigned.firstName?.[0] || '?')}${(assigned.lastName?.[0] || '')}`.toUpperCase()
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: '#004535', color: 'white', fontWeight: 700, fontSize: '0.7rem', width: 28, height: 28 }}>
              {initials}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {assigned.firstName} {assigned.lastName}
            </Typography>
          </Box>
        )
      }
    },

    // ✅ ACTIONS
    {
      field: 'actions',
      headerName: t('loans.table.actions', 'Actions'),
      align: 'center',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" justifyContent="center" gap={0.5}>
          <Tooltip title={t('loans.actions.view', 'View')}>
            <IconButton size="small" onClick={() => onViewDetails(row)} sx={{ color: '#1976d2' }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('loans.actions.edit', 'Edit')}>
            <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: '#ff9800' }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('loans.actions.delete', 'Delete')}>
            <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: '#f44336' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [t, onViewDetails, onEdit, onDelete])
}