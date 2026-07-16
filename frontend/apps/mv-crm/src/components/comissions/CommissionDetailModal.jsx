// apps/mv-crm/src/components/commissions/CommissionDetailModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, 
  Chip, Divider, TextField, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, IconButton // ✅ AGREGADO: IconButton
} from '@mui/material'
import { Close, CheckCircle, Payment, ReportProblem } from '@mui/icons-material'
import commissionService from '../../services/commissionService'

const CommissionDetailModal = ({ open, onClose, commission, onRefresh, actionType }) => {
  const { t } = useTranslation('commissions')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    saleAmount: commission?.saleAmount || 0,
    overrideRate: commission?.overrideRate || 0,
    overrideAmount: commission?.overrideAmount || 0,
    notes: commission?.notes || '',
    splits: commission?.splitWith || []
  })
  const [disputeReason, setDisputeReason] = useState('')

  useEffect(() => {
    if (commission) {
      setFormData({
        saleAmount: commission.saleAmount || 0,
        overrideRate: commission.overrideRate || 0,
        overrideAmount: commission.overrideAmount || 0,
        notes: commission.notes || '',
        splits: commission.splitWith || []
      })
    }
    setError(null)
    setDisputeReason('')
  }, [commission, open])

  if (!commission) return null

  const handleSave = async () => {
    setLoading(true)
    try {
      await commissionService.updateCommission(commission._id, formData)
      onRefresh()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || t('errors.updateFailed', 'Error al actualizar'))
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action) => {
    setLoading(true)
    try {
      if (action === 'approve') await commissionService.approveCommission(commission._id)
      if (action === 'dispute') await commissionService.disputeCommission(commission._id, disputeReason)
      if (action === 'markPaid') await commissionService.markPaidCommission(commission._id)
      onRefresh()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || t('errors.actionFailed', 'Error en la acción'))
    } finally {
      setLoading(false)
    }
  }

  const isEditing = actionType === 'edit'
  const isDisputing = actionType === 'dispute'

  // ✅ CORRECCIÓN: Extracción segura de nombres (igual que en las columnas)
  const agent = commission.agentId
  const agentName = agent && typeof agent === 'object' 
    ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email 
    : commission.agentName || (typeof agent === 'string' ? agent : 'N/A')

  const project = commission.projectId
  const projectName = project && typeof project === 'object'
    ? project.name || (project.title && (project.title.es || project.title.en))
    : commission.projectName || (typeof project === 'string' ? project : 'N/A')

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {isEditing ? t('detail.editTitle', 'Editar Comisión') : isDisputing ? t('detail.disputeTitle', 'Disputar Comisión') : t('detail.title', 'Detalle de Comisión')}
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box display="flex" flexDirection="column" gap={2}>
          {!isEditing && !isDisputing && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">{t('detail.status', 'Estado')}</Typography>
                <Chip label={t(`status.${commission.status}`, commission.status)} color={commission.status === 'paid' ? 'success' : commission.status === 'approved' ? 'primary' : 'warning'} size="small" />
              </Box>
              <Divider />
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.agent', 'Agente')}</Typography>
                  <Typography fontWeight={600}>{agentName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.project', 'Proyecto')}</Typography>
                  <Typography fontWeight={600}>{projectName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.saleAmount', 'Monto de Venta')}</Typography>
                  <Typography fontWeight={600}>${commission.saleAmount?.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.commissionAmount', 'Monto de Comisión')}</Typography>
                  <Typography fontWeight={700} color="success.main">
                    ${commission.commissionAmount?.toLocaleString()} ({commission.commissionRate}%)
                  </Typography>
                </Box>
              </Box>
              {commission.splitWith?.length > 0 && (
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight={600} display="block" mb={1}>{t('detail.splits', 'Divisiones')}</Typography>
                  {commission.splitWith.map((split, idx) => {
                    const splitAgent = split.agentId
                    const splitAgentName = splitAgent && typeof splitAgent === 'object' 
                      ? `${splitAgent.firstName || ''} ${splitAgent.lastName || ''}`.trim() 
                      : split.agentName || splitAgent
                    return (
                      <Typography key={idx} variant="body2">
                        • {splitAgentName}: {split.percentage}% (${split.amount?.toLocaleString()})
                      </Typography>
                    )
                  })}
                </Box>
              )}
              <TextField label={t('detail.notes', 'Notas')} value={commission.notes || ''} multiline rows={2} fullWidth size="small" disabled />
            </>
          )}

          {isEditing && (
            <>
              <TextField label={t('detail.saleAmount', 'Monto de Venta')} type="number" value={formData.saleAmount} onChange={(e) => setFormData({...formData, saleAmount: Number(e.target.value)})} fullWidth size="small" />
              <TextField label={t('detail.overrideRate', 'Tasa Personalizada (%)')} type="number" value={formData.overrideRate} onChange={(e) => setFormData({...formData, overrideRate: Number(e.target.value)})} fullWidth size="small" />
              <TextField label={t('detail.overrideAmount', 'Monto Personalizado ($)')} type="number" value={formData.overrideAmount} onChange={(e) => setFormData({...formData, overrideAmount: Number(e.target.value)})} fullWidth size="small" />
              <TextField label={t('detail.notes', 'Notas')} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} multiline rows={3} fullWidth size="small" />
            </>
          )}

          {isDisputing && (
            <TextField 
              label={t('detail.disputeReason', 'Motivo de la disputa')} 
              value={disputeReason} 
              onChange={(e) => setDisputeReason(e.target.value)} 
              multiline rows={3} fullWidth size="small" required 
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>{t('actions.close', 'Cerrar')}</Button>
        
        {isEditing && (
          <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}>
            {t('actions.save', 'Guardar')}
          </Button>
        )}
        
        {isDisputing && (
          <Button variant="contained" color="error" onClick={() => handleAction('dispute')} disabled={loading || !disputeReason} startIcon={loading ? <CircularProgress size={16} /> : <ReportProblem />}>
            {t('actions.confirmDispute', 'Confirmar Disputa')}
          </Button>
        )}

        {!isEditing && !isDisputing && commission.status === 'pending' && (
          <>
            <Button variant="contained" color="success" onClick={() => handleAction('approve')} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}>
              {t('actions.approve', 'Aprobar')}
            </Button>
          </>
        )}

        {!isEditing && !isDisputing && commission.status === 'approved' && (
          <Button variant="contained" color="primary" onClick={() => handleAction('markPaid')} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <Payment />}>
            {t('actions.markPaid', 'Marcar Pagado')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CommissionDetailModal