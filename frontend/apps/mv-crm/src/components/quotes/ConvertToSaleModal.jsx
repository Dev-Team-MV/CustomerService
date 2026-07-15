// apps/mv-crm/src/components/quotes/ConvertToSaleModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Alert, CircularProgress
} from '@mui/material'
import { CheckCircle, Home, Apartment } from '@mui/icons-material'
import quoteService from '../../services/quoteService'
import propertyService from '@shared/services/propertyService'
import buildingService from '@shared/services/buildingService'

// ✅ Helper para extraer siempre un string ID
const getId = (val) => (typeof val === 'object' && val !== null ? val._id : val) || ''

export default function ConvertToSaleModal({ open, onClose, quote, onSuccess }) {
  const { t } = useTranslation('quoteCrm')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')

  useEffect(() => {
    if (open) {
      setError('')
      setHint('')
    }
  }, [open])

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    setHint('')
    try {
      let payload = {}
      
      const existingPropertyId = getId(quote.propertyId)
      const existingApartmentId = getId(quote.apartmentId)
      const clientId = getId(quote.clientId)
      const projectId = getId(quote.projectId)

      // ==========================================
      // CASO 1: YA ES UNA PROPIEDAD (LOTE/CASA)
      // ==========================================
      if (existingPropertyId) {
        payload.propertyId = existingPropertyId
      } 
      // ==========================================
      // CASO 2: ES UN APARTAMENTO (H Tower, Phase 2, ISQ)
      // ==========================================
      else {
        // Extraemos los datos del apartamento, ya sea del objeto populado o de campos sueltos
        const aptObj = typeof quote.apartmentId === 'object' ? quote.apartmentId : {}
        const aptModelId = getId(aptObj.apartmentModel) || getId(quote.apartmentModelId)
        const floorNum = aptObj.floorNumber || quote.floorNumber
        const aptNum = aptObj.apartmentNumber || quote.apartmentNumber
        const bldgId = getId(aptObj.building) || getId(quote.buildingId)

        if (aptModelId && floorNum && aptNum && clientId && projectId) {
          const aptPayload = {
            projectId,
            ...(bldgId ? { buildingId: bldgId } : {}),
            apartmentModelId: aptModelId,
            floorNumber: Number(floorNum),
            apartmentNumber: String(aptNum),
            user: clientId,
            users: [clientId],
            price: quote.totalPrice || 0,
            initialPayment: quote.downPayment || 0,
            status: 'pending', // O 'sold' según tu regla de negocio
            selectedRenderType: quote.selectedRenderType || 'basic'
          }

          try {
            if (existingApartmentId) {
              // ✅ ACTUALIZAR el apartamento existente para asignarle el cliente y los precios
              console.log('📤 Actualizando apartamento existente:', existingApartmentId, aptPayload)
              await buildingService.updateApartment(existingApartmentId, aptPayload)
              payload.apartmentId = existingApartmentId
            } else {
              // ✅ CREAR un nuevo apartamento si la cotización no lo tenía guardado aún
              console.log('📤 Creando nuevo apartamento:', aptPayload)
              const newApartment = await buildingService.createApartment(aptPayload)
              payload.apartmentId = newApartment._id
            }
          } catch (createErr) {
            console.error('Error auto-creating/updating apartment:', createErr)
            const errMsg = createErr.response?.data?.message || 'Error al asignar/crear el apartamento.'
            setHint(errMsg)
            return // Detenemos la ejecución para no convertir la quote sin asignar la propiedad
          }
        } 
        // ==========================================
        // CASO 3: FALLBACK A LOTE/CASA (6Town, LakeWood)
        // ==========================================
        else {
          const lotId = getId(quote.lotId)
          const modelId = getId(quote.modelId)
          const buildingId = getId(quote.buildingId)
          const facadeId = getId(quote.facadeId) || getId(quote.facade)

          if (lotId && modelId && clientId && projectId) {
            try {
              const newProperty = await propertyService.createProperty({
                projectId,
                ...(buildingId ? { buildingId } : {}),
                lot: lotId,
                model: modelId,
                facade: facadeId || undefined,
                userId: clientId,
                users: [clientId],
                initialPayment: quote.downPayment || 0,
                price: quote.totalPrice || 0,
                status: 'pending',
                selectedOptions: quote.selectedOptions || {},
                selectedRenderType: quote.selectedRenderType || 'basic'
              })
              payload.propertyId = newProperty._id
            } catch (createErr) {
              console.error('Error auto-creating property:', createErr)
              const errMsg = createErr.response?.data?.message || 'Error al crear la propiedad automáticamente.'
              setHint(errMsg)
              return
            }
          }
        }
      }

      // ==========================================
      // PASO FINAL: CONVERTIR LA COTIZACIÓN
      // ==========================================
      // Si llegamos aquí, payload ya tiene apartmentId o propertyId correctamente asignado y actualizado
      console.log('📤 Convirtiendo cotización con payload:', payload)
      const res = await quoteService.convertToSale(quote._id, payload)
      
      if (res?.propertyCreateHint) {
        const hintMsg = typeof res.propertyCreateHint === 'string' 
          ? res.propertyCreateHint 
          : (res.propertyCreateHint.message || JSON.stringify(res.propertyCreateHint))
        setHint(hintMsg)
      } else {
        onSuccess?.(res)
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.message || t('errors.convertFailed', 'Error al convertir'))
    } finally {
      setLoading(false)
    }
  }

  if (!quote) return null

  const clientObj = typeof quote.clientId === 'object' ? quote.clientId : null
  const clientName = clientObj 
    ? `${clientObj.firstName || ''} ${clientObj.lastName || ''}`.trim() 
    : (quote.leadId?.name || (typeof quote.leadId === 'object' ? quote.leadId.name : '') || 'N/A')

  const hasPropertyData = getId(quote.propertyId) || getId(quote.apartmentId) || (getId(quote.lotId) && getId(quote.modelId)) || (getId(quote.apartmentModelId) && quote.floorNumber)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircle color="success" />
        <Typography variant="h6" fontWeight={700}>{t('convertToSale.title', 'Convertir a Venta')}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">{t('convertToSale.client', 'Cliente')}</Typography>
          <Typography fontWeight={600}>{clientName}</Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">{t('convertToSale.amount', 'Monto Cotizado')}</Typography>
          <Typography fontWeight={700} color="primary">${quote.totalPrice?.toLocaleString()}</Typography>
        </Box>

        {hasPropertyData ? (
          <Alert severity="info" sx={{ mb: 2 }} icon={<Home fontSize="small" />}>
            {t('convertToSale.hasProperty', 'Esta cotización tiene datos de propiedad. Se vinculará o creará automáticamente.')}
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }} icon={<Apartment fontSize="small" />}>
            {t('convertToSale.noProperty', 'Faltan datos de propiedad. Es posible que debas crearla manualmente.')}
          </Alert>
        )}

        {hint && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('convertToSale.hintTitle', 'Acción requerida')}
            </Typography>
            <Typography variant="body2">{hint}</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
              {t('convertToSale.hintAction', 'Por favor, asegúrate de que la cotización incluya todos los datos obligatorios o crea la propiedad manualmente desde el módulo de propiedades.')}
            </Typography>
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>{t('actions.cancel', 'Cancelar')}</Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={handleConvert} 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
        >
          {loading ? t('actions.converting', 'Convirtiendo...') : t('actions.confirmConvert', 'Confirmar Conversión')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}