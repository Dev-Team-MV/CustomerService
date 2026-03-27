import {
  Button, Box, Typography, IconButton,
  Stepper, Step, StepLabel, StepContent,
  CircularProgress, Paper, Chip, Alert, useTheme
} from '@mui/material'
import {
  Description, Delete, CheckCircle,
  CloudUpload, Send, AttachFile, Download
} from '@mui/icons-material'

import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import { useContracts, DOCUMENT_TYPES } from '../../hooks/useContracts'

const ContractsModal = ({
  open,
  onClose,
  resource,
  resourceType, // 'property' o 'apartment'
  onContractUpdated,
  title,
  subtitle
}) => {
  const {
    existingContracts,
    pendingFiles,
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
  } = useContracts({ resource, resourceType, open, onContractUpdated })
  const theme = useTheme()

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
      title={title || (resourceType === 'apartment' ? 'Apartment Contracts' : 'Property Contracts')}
      subtitle={subtitle || (resourceType === 'apartment'
        ? `Upload and manage contracts for Apartment ${resource?.apartmentNumber || ''}`
        : `Upload and manage contracts for Property ${resource?.lot?.number || ''}`)}
      maxWidth="md"
      actions={modalActions}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress sx={{ color: theme.palette.secondary.main }} />
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
              bgcolor: theme.palette.background.default,
              borderRadius: 3,
              border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
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
                  color: theme.palette.primary.main,
                  fontFamily: '"Poppins", sans-serif',
                  mb: 0.5
                }}
              >
                Upload Progress
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
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
                  ? theme.palette.secondary.light + '14'
                  : theme.palette.warning.light + '14',
                color: theme.palette.primary.main,
                border: `1px solid ${getTotalProgress() === 100 ? theme.palette.secondary.main : theme.palette.warning.main}`,
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
                bgcolor: theme.palette.secondary.light + '14',
                border: `1px solid ${theme.palette.secondary.main}4D`,
                '& .MuiAlert-icon': {
                  color: theme.palette.secondary.main
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
                borderColor: theme.palette.secondary.main + '4D',
                borderWidth: '2px',
                minHeight: 24
              },
              '& .MuiStepLabel-label': {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                '&.Mui-active': {
                  color: theme.palette.primary.main,
                  fontWeight: 700
                },
                '&.Mui-completed': {
                  color: theme.palette.secondary.main,
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
                          bgcolor: isCompleted
                            ? theme.palette.secondary.main
                            : (pendingFile
                              ? theme.palette.warning.main
                              : theme.palette.cardBorder || '#e0e0e0'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: (isCompleted || pendingFile)
                            ? `0 4px 12px ${theme.palette.secondary.main}40`
                            : 'none',
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
                          color: isCompleted
                            ? theme.palette.secondary.main
                            : (pendingFile
                              ? theme.palette.warning.main
                              : (activeStep === idx
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary)),
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
                            bgcolor: theme.palette.secondary.light + '14',
                            color: theme.palette.secondary.main,
                            border: `1px solid ${theme.palette.secondary.main}`,
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
                            bgcolor: theme.palette.warning.light + '14',
                            color: theme.palette.warning.main,
                            border: `1px solid ${theme.palette.warning.main}`,
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
                        bgcolor: theme.palette.background.default,
                        border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
                        borderRadius: 2
                      }}
                    >
                      {existingContract ? (
                        // YA ESTÁ SUBIDO
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.secondary.main,
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
                              color: theme.palette.text.secondary,
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
                                borderColor: theme.palette.info.light,
                                borderWidth: '2px',
                                color: theme.palette.info.main,
                                '&:hover': {
                                  borderColor: theme.palette.info.main,
                                  borderWidth: '2px',
                                  bgcolor: theme.palette.info.light + '14'
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
                                borderColor: theme.palette.secondary.light,
                                borderWidth: '2px',
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  borderColor: theme.palette.secondary.main,
                                  borderWidth: '2px',
                                  bgcolor: theme.palette.secondary.light + '14'
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
                                borderColor: theme.palette.warning.light,
                                borderWidth: '2px',
                                color: theme.palette.warning.main,
                                '&:hover': {
                                  borderColor: theme.palette.warning.main,
                                  borderWidth: '2px',
                                  bgcolor: theme.palette.warning.light + '14'
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
                              color: theme.palette.text.secondary,
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
                              bgcolor: theme.palette.warning.light + '14',
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.warning.main}33`,
                              mb: 2
                            }}
                          >
                            <AttachFile sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                            <Box flex={1}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontFamily: '"Poppins", sans-serif',
                                  mb: 0.3
                                }}
                              >
                                {pendingFile.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
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
                                color: theme.palette.warning.main,
                                '&:hover': {
                                  bgcolor: theme.palette.warning.light + '14'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
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
                              color: theme.palette.text.secondary,
                              fontFamily: '"Poppins", sans-serif',
                              mb: 2
                            }}
                          >
                            Select the {docType.label} document for this {resourceType}
                          </Typography>
                          <Button
                            component="label"
                            variant="outlined"
                            fullWidth
                            startIcon={<CloudUpload />}
                            disabled={submitting || isDeleting}
                            sx={{
                              borderRadius: 3,
                              borderColor: theme.palette.secondary.light,
                              borderWidth: '2px',
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontFamily: '"Poppins", sans-serif',
                              py: 1.5,
                              '&:hover': {
                                borderColor: theme.palette.secondary.main,
                                borderWidth: '2px',
                                bgcolor: theme.palette.secondary.light + '14'
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