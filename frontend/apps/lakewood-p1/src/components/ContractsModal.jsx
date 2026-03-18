import {
  Button, Box, Typography, IconButton,
  Stepper, Step, StepLabel, StepContent,
  CircularProgress, Paper, Chip, Alert
} from '@mui/material'
import {
  Description, Delete, CheckCircle,
  CloudUpload, Send, AttachFile, Download
} from '@mui/icons-material'

import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import { useContracts } from '../hooks/useContracts'

const ContractsModal = ({ open, onClose, property, onContractUpdated }) => {
  const {
    existingContracts,
    pendingFiles,
    DOCUMENT_TYPES,
    activeStep, setActiveStep,
    loading,
    submitting,
    deleting,
    error, setError,
    handleFileSelect,
    handleRemovePendingFile,
    handleDeleteContract,
    handleDownloadContract,
    handleViewContract,
    handleSubmitContracts,
    getPendingCount,
    getExistingCount,
    getTotalProgress,
  } = useContracts({ property, open, onContractUpdated })

  // ── Actions ───────────────────────────────────────────────
  const modalActions = (
    <>
      <PrimaryButton
        onClick={handleSubmitContracts}
        disabled={getPendingCount() === 0 || submitting || deleting}
        loading={submitting}
        startIcon={<Send />}
      >
        {`Submit ${getPendingCount() > 0 ? `${getPendingCount()} ` : ''}Contract${getPendingCount() !== 1 ? 's' : ''}`}
      </PrimaryButton>
    </>
  )

  // ── Render ────────────────────────────────────────────────
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Description}
      title="Contract Management"
      subtitle={`Upload and manage property contracts - Lot ${property?.lot?.number || 'N/A'}`}
      maxWidth="md"
      actions={modalActions}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress sx={{ color: '#8CA551' }} />
        </Box>
      ) : (
        <>
          {/* ERROR ALERT */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                fontFamily: '"Poppins", sans-serif'
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* PROGRESS INDICATOR */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              bgcolor: '#fafafa',
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif',
                  mb: 0.5
                }}
              >
                Upload Progress
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {getExistingCount()} uploaded • {getPendingCount()} pending
              </Typography>
            </Box>
            <Chip
              label={`${getTotalProgress()}%`}
              sx={{
                bgcolor: getTotalProgress() === 100
                  ? 'rgba(140, 165, 81, 0.12)'
                  : 'rgba(229, 134, 60, 0.12)',
                color: '#333F1F',
                border: `1px solid ${getTotalProgress() === 100 ? '#8CA551' : '#E5863C'}`,
                fontWeight: 700,
                fontSize: '1rem',
                fontFamily: '"Poppins", sans-serif',
                px: 2
              }}
            />
          </Paper>

          {/* PENDING FILES ALERT */}
          {getPendingCount() > 0 && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                fontFamily: '"Poppins", sans-serif',
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.3)',
                '& .MuiAlert-icon': {
                  color: '#8CA551'
                }
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {getPendingCount()} file(s) ready to upload
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Click "Submit All Contracts" to complete the upload
              </Typography>
            </Alert>
          )}

          {/* STEPPER TIMELINE */}
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              '& .MuiStepLabel-root': {
                cursor: 'pointer'
              },
              '& .MuiStepConnector-line': {
                borderColor: 'rgba(140, 165, 81, 0.3)',
                borderWidth: '2px',
                minHeight: 24
              },
              '& .MuiStepLabel-label': {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                color: '#706f6f',
                '&.Mui-active': {
                  color: '#333F1F',
                  fontWeight: 700
                },
                '&.Mui-completed': {
                  color: '#8CA551',
                  fontWeight: 600
                }
              }
            }}
          >
            {DOCUMENT_TYPES.map((docType, idx) => {
              const existingContract = existingContracts[docType.key]
              const pendingFile = pendingFiles[docType.key]
              const isCompleted = !!existingContract
              const isDeleting = deleting === docType.key

              return (
                <Step key={docType.key} completed={isCompleted}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: isCompleted ? '#8CA551' : (pendingFile ? '#E5863C' : '#e0e0e0'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: (isCompleted || pendingFile) ? '0 4px 12px rgba(140, 165, 81, 0.25)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
                        ) : pendingFile ? (
                          <AttachFile sx={{ fontSize: 20, color: 'white' }} />
                        ) : (
                          <Typography fontSize="1.2rem">{docType.icon}</Typography>
                        )}
                      </Box>
                    )}
                    onClick={() => setActiveStep(idx)}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Typography
                        variant="body1"
                        fontWeight={activeStep === idx ? 700 : 600}
                        sx={{
                          color: isCompleted ? '#8CA551' : (pendingFile ? '#E5863C' : (activeStep === idx ? '#333F1F' : '#706f6f')),
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {docType.label}
                      </Typography>
                      {isCompleted && (
                        <Chip
                          label="Uploaded"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(140, 165, 81, 0.12)',
                            color: '#8CA551',
                            border: '1px solid #8CA551',
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif',
                            height: 22
                          }}
                        />
                      )}
                      {!isCompleted && pendingFile && (
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(229, 134, 60, 0.12)',
                            color: '#E5863C',
                            border: '1px solid #E5863C',
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif',
                            height: 22
                          }}
                        />
                      )}
                    </Box>
                  </StepLabel>

                  <StepContent>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        mt: 1.5,
                        mb: 2,
                        bgcolor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2
                      }}
                    >
                      {existingContract ? (
                        // YA ESTÁ SUBIDO
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#8CA551',
                              fontFamily: '"Poppins", sans-serif',
                              fontWeight: 600,
                              mb: 0.5
                            }}
                          >
                            ✅ {docType.label} uploaded
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif',
                              display: 'block',
                              mb: 2
                            }}
                          >
                            Uploaded on {new Date(existingContract.uploadedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>

                          <Box display="flex" gap={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Description />}
                              onClick={() => handleViewContract(docType)}
                              disabled={isDeleting}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                borderColor: 'rgba(25, 118, 210, 0.3)',
                                borderWidth: '2px',
                                color: '#1976d2',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px',
                                  bgcolor: 'rgba(25, 118, 210, 0.08)'
                                },
                                '&:disabled': {
                                  opacity: 0.5
                                }
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Download />}
                              onClick={() => handleDownloadContract(docType)}
                              disabled={isDeleting}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                borderColor: 'rgba(140, 165, 81, 0.3)',
                                borderWidth: '2px',
                                color: '#333F1F',
                                '&:hover': {
                                  borderColor: '#8CA551',
                                  borderWidth: '2px',
                                  bgcolor: 'rgba(140, 165, 81, 0.08)'
                                },
                                '&:disabled': {
                                  opacity: 0.5
                                }
                              }}
                            >
                              Download
                            </Button>

                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={isDeleting ? <CircularProgress size={16} /> : <Delete />}
                              onClick={() => handleDeleteContract(docType)}
                              disabled={isDeleting || submitting}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                borderColor: 'rgba(229, 134, 60, 0.3)',
                                borderWidth: '2px',
                                color: '#E5863C',
                                '&:hover': {
                                  borderColor: '#E5863C',
                                  borderWidth: '2px',
                                  bgcolor: 'rgba(229, 134, 60, 0.08)'
                                },
                                '&:disabled': {
                                  opacity: 0.5
                                }
                              }}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif',
                              fontStyle: 'italic',
                              display: 'block',
                              mt: 1.5
                            }}
                          >
                            💡 Delete this document to upload a new one if needed
                          </Typography>
                        </Box>
                      ) : pendingFile ? (
                        // ARCHIVO SELECCIONADO (pendiente)
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 2,
                              bgcolor: 'rgba(229, 134, 60, 0.08)',
                              borderRadius: 2,
                              border: '1px solid rgba(229, 134, 60, 0.2)',
                              mb: 2
                            }}
                          >
                            <AttachFile sx={{ color: '#E5863C', fontSize: 20 }} />
                            <Box flex={1}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  color: '#333F1F',
                                  fontFamily: '"Poppins", sans-serif',
                                  mb: 0.3
                                }}
                              >
                                {pendingFile.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#706f6f',
                                  fontFamily: '"Poppins", sans-serif'
                                }}
                              >
                                {(pendingFile.size / (1024 * 1024)).toFixed(2)} MB
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleRemovePendingFile(docType)}
                              sx={{
                                color: '#E5863C',
                                '&:hover': {
                                  bgcolor: 'rgba(229, 134, 60, 0.12)'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif',
                              fontStyle: 'italic'
                            }}
                          >
                            File ready. Click "Submit All Contracts" to upload.
                          </Typography>
                        </Box>
                      ) : (
                        // SELECCIONAR ARCHIVO
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif',
                              mb: 2
                            }}
                          >
                            Select the {docType.label} document for this property
                          </Typography>
                          <Button
                            component="label"
                            variant="outlined"
                            fullWidth
                            startIcon={<CloudUpload />}
                            disabled={submitting || isDeleting}
                            sx={{
                              borderRadius: 3,
                              borderColor: 'rgba(140, 165, 81, 0.3)',
                              borderWidth: '2px',
                              color: '#333F1F',
                              fontWeight: 600,
                              textTransform: 'none',
                              fontFamily: '"Poppins", sans-serif',
                              py: 1.5,
                              '&:hover': {
                                borderColor: '#8CA551',
                                borderWidth: '2px',
                                bgcolor: 'rgba(140, 165, 81, 0.08)'
                              },
                              '&:disabled': {
                                opacity: 0.5
                              }
                            }}
                          >
                            Select File
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleFileSelect(docType, e.target.files[0])
                                }
                                e.target.value = ''
                              }}
                            />
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </StepContent>
                </Step>
              )
            })}
          </Stepper>
        </>
      )}
    </ModalWrapper>
  )
}

export default ContractsModal