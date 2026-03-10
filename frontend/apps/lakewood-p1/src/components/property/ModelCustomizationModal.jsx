import { Dialog, DialogContent } from '@mui/material'
import ModelCustomizationCore from '../models/Customization/ModelCustomizationCore'

const MODEL_10_ID = "6977c7bbd1f24768968719de"

const ModelCustomizationModal = ({
  open,
  model,
  onClose,
  onConfirm,
  initialOptions = {}
}) => {
  if (!model) return null

  // Detecta si es Modelo 10 y define los labels dinámicos
  const isModel10 = model._id === MODEL_10_ID
  const labels = isModel10
    ? {
        balcony: "Study",
        baseTitle: "With Comedor",
        compareTitle: "With Study"
      }
    : {}

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: '95vw',
          height: '95vh',
          maxWidth: '1800px',
          m: 0,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
        }
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ModelCustomizationCore
          model={model}
          initialOptions={initialOptions}
          onConfirm={onConfirm}
          labels={labels}
          confirmLabel="Confirm Selection"
        />
      </DialogContent>
    </Dialog>
  )
}

export default ModelCustomizationModal