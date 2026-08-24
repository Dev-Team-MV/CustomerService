// apps/mv-crm/src/components/comissions/CommissionDetailModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, 
  Chip, Divider, TextField, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, IconButton
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

  const agent = commission.agentId
  const agentName = agent && typeof agent === 'object' 
    ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email 
    : commission.agentName || (typeof agent === 'string' ? agent : 'N/A')

  const project = commission.projectId
  const projectName = project && typeof project === 'object'
    ? project.name || (project.title && (project.title.es || project.title.en))
    : commission.projectName || (typeof project === 'string' ? project : 'N/A')

  const unifiedButtonSx = {
    borderRadius: 0,
    textTransform: 'none',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
  }

  return (
    // ✅ ID 1: Para que el tour resalte todo el modal
    <Dialog 
      id="commission-detail-modal" 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec' }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          {isEditing ? t('detail.editTitle', 'Editar Comisión') : isDisputing ? t('detail.disputeTitle', 'Disputar Comisión') : t('detail.title', 'Detalle de Comisión')}
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid' }}>{error}</Alert>}
        
        {/* ✅ ID 2: Para que el tour explique la información general de la comisión */}
        <Box id="commission-detail-overview" display="flex" flexDirection="column" gap={2}>
          {!isEditing && !isDisputing && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('detail.status', 'Estado')}</Typography>
                <Chip 
                  label={t(`status.${commission.status}`, commission.status)} 
                  color={commission.status === 'paid' ? 'success' : commission.status === 'approved' ? 'primary' : 'warning'} 
                  size="small" 
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600 }} 
                />
              </Box>
              <Divider />
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>{t('detail.agent', 'Agente')}</Typography>
                  <Typography fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{agentName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>{t('detail.project', 'Proyecto')}</Typography>
                  <Typography fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{projectName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>{t('detail.saleAmount', 'Monto de Venta')}</Typography>
                  <Typography fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>${commission.saleAmount?.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>{t('detail.commissionAmount', 'Monto de Comisión')}</Typography>
                  <Typography fontWeight={700} color="success.main" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                    ${commission.commissionAmount?.toLocaleString()} ({commission.commissionRate}%)
                  </Typography>
                </Box>
              </Box>
              {commission.splitWith?.length > 0 && (
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                  <Typography variant="caption" fontWeight={600} display="block" mb={1} sx={{ fontFamily: '"Courier New", monospace' }}>{t('detail.splits', 'Divisiones')}</Typography>
                  {commission.splitWith.map((split, idx) => {
                    const splitAgent = split.agentId
                    const splitAgentName = splitAgent && typeof splitAgent === 'object' 
                      ? `${splitAgent.firstName || ''} ${splitAgent.lastName || ''}`.trim() 
                      : split.agentName || splitAgent
                    return (
                      <Typography key={idx} variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                        • {splitAgentName}: {split.percentage}% (${split.amount?.toLocaleString()})
                      </Typography>
                    )
                  })}
                </Box>
              )}
              <TextField 
                label={t('detail.notes', 'Notas')} 
                value={commission.notes || ''} 
                multiline rows={2} fullWidth size="small" disabled 
                sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </>
          )}

          {isEditing && (
            <>
              <TextField label={t('detail.saleAmount', 'Monto de Venta')} type="number" value={formData.saleAmount} onChange={(e) => setFormData({...formData, saleAmount: Number(e.target.value)})} fullWidth size="small" sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
              <TextField label={t('detail.overrideRate', 'Tasa Personalizada (%)')} type="number" value={formData.overrideRate} onChange={(e) => setFormData({...formData, overrideRate: Number(e.target.value)})} fullWidth size="small" sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
              <TextField label={t('detail.overrideAmount', 'Monto Personalizado ($)')} type="number" value={formData.overrideAmount} onChange={(e) => setFormData({...formData, overrideAmount: Number(e.target.value)})} fullWidth size="small" sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
              <TextField label={t('detail.notes', 'Notas')} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} multiline rows={3} fullWidth size="small" sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
            </>
          )}

          {isDisputing && (
            <TextField 
              label={t('detail.disputeReason', 'Motivo de la disputa')} 
              value={disputeReason} 
              onChange={(e) => setDisputeReason(e.target.value)} 
              multiline rows={3} fullWidth size="small" required 
              sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
          )}
        </Box>
      </DialogContent>

      {/* ✅ ID 3: Para que el tour explique los botones de acción (Aprobar, Pagar, Cerrar, etc.) */}
      <DialogActions id="commission-detail-actions" sx={{ p: 2, gap: 1, borderTop: '1px solid #ececec' }}>
        <Button onClick={onClose} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>
          {t('actions.close', 'Cerrar')}
        </Button>
        
        {isEditing && (
          <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {t('actions.save', 'Guardar')}
          </Button>
        )}
        
        {isDisputing && (
          <Button variant="contained" color="error" onClick={() => handleAction('dispute')} disabled={loading || !disputeReason} startIcon={loading ? <CircularProgress size={16} /> : <ReportProblem />} sx={{ ...unifiedButtonSx, bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {t('actions.confirmDispute', 'Confirmar Disputa')}
          </Button>
        )}

        {!isEditing && !isDisputing && commission.status === 'pending' && (
          <Button variant="contained" color="success" onClick={() => handleAction('approve')} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />} sx={{ ...unifiedButtonSx, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {t('actions.approve', 'Aprobar')}
          </Button>
        )}

        {!isEditing && !isDisputing && commission.status === 'approved' && (
          <Button variant="contained" color="primary" onClick={() => handleAction('markPaid')} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <Payment />} sx={{ ...unifiedButtonSx, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {t('actions.markPaid', 'Marcar Pagado')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CommissionDetailModal