import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const DOCUMENT_TYPES = [
  { key: 'promise', label: 'Land Use' },
  { key: 'PurchaseContract', label: 'Sales Contract' },
  { key: 'leaseContract', label: 'Lease Contract' },
  { key: 'payment', label: 'Payment' },
  { key: 'other1', label: 'Other Document 1' },
  { key: 'other2', label: 'Other Document 2' }
]

const ContractsModal = ({ open, onClose, property }) => {
  const [documents, setDocuments] = useState({})
  const [activeStep, setActiveStep] = useState(0)

  const handleFileChange = (key, file) => {
    setDocuments(prev => ({
      ...prev,
      [key]: file
    }))
  }

  const handleRemoveFile = (key) => {
    setDocuments(prev => {
      const newDocs = { ...prev }
      delete newDocs[key]
      return newDocs
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Contracts for Lot {property?.lot?.number}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Attach contracts or related documents for this property.
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 2 }}>
          {DOCUMENT_TYPES.map((doc, idx) => (
            <Step key={doc.key} completed={!!documents[doc.key]}>
              <StepLabel
                icon={documents[doc.key] ? <CheckCircleIcon color="success" /> : undefined}
                onClick={() => setActiveStep(idx)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography fontWeight="bold">{doc.label}</Typography>
              </StepLabel>
              <StepContent>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  {documents[doc.key] && (
                    <Typography variant="caption" color="success.main">
                      {documents[doc.key].name}
                    </Typography>
                  )}
                  {documents[doc.key] ? (
                    <IconButton onClick={() => handleRemoveFile(doc.key)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      size="small"
                    >
                      Attach
                      <input
                        type="file"
                        hidden
                        onChange={e => {
                          if (e.target.files[0]) handleFileChange(doc.key, e.target.files[0])
                          e.target.value = ''
                        }}
                      />
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContractsModal