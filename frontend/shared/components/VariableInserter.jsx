// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/projects/VariableInserter.jsx

import { useState, useMemo } from 'react'
import {
  Box, Typography, Chip, Paper, Collapse, IconButton, Tooltip,
  CircularProgress, Alert, Tabs, Tab, Divider
} from '@mui/material'
import {
  Code, ExpandMore, ExpandLess, ContentCopy, Category, Info
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useProjectVariables } from '@shared/hooks/useProjectVariables'

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS CON COLORES
// ═══════════════════════════════════════════════════════════════

const CATEGORY_COLORS = {
  'Usuario': '#2196f3',
  'Cliente': '#4caf50',
  'Proyecto': '#9c27b0',
  'Lote': '#ff9800',
  'Edificio': '#795548',
  'Apartamento': '#009688',
  'ApartamentoModelo': '#673ab7',
  'Pago': '#f44336',
  'Custom': '#607d8b'
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const VariableInserter = ({ 
  projectId,
  onInsert,
  compact = false,
  showCategories = true,
  maxHeight = 300
}) => {
  const { t } = useTranslation('common')
  const [expanded, setExpanded] = useState(!compact)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedVar, setCopiedVar] = useState(null)

  const {
    variables,
    loading,
    error,
    categories,
    variablesForTemplates
  } = useProjectVariables(projectId, { enabled: !!projectId })

  const filteredVariables = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return variablesForTemplates
    return variablesForTemplates.filter(v => v.categoria === selectedCategory)
  }, [variablesForTemplates, selectedCategory])

  const handleInsert = (varName) => {
    onInsert?.(varName)
    setCopiedVar(varName)
    setTimeout(() => setCopiedVar(null), 1000)
  }

  const handleCopy = (varName, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`{{${varName}}}`)
    setCopiedVar(varName)
    setTimeout(() => setCopiedVar(null), 1000)
  }

  if (!projectId) {
    return null
  }

  // ═══════════════════════════════════════════════════════════
  // MODO COMPACTO
  // ═══════════════════════════════════════════════════════════

  if (compact) {
    if (loading) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">
            {t('variables.loading')}
          </Typography>
        </Box>
      )
    }

    if (variables.length === 0) {
      return (
        <Typography variant="caption" color="text.secondary">
          {t('variables.noVariablesForProject')}
        </Typography>
      )
    }

    return (
      <Box display="flex" gap={0.5} flexWrap="wrap">
        {variablesForTemplates.slice(0, 10).map(v => (
          <Tooltip 
            key={v.key} 
            title={`${t(`variables.categories.${v.categoria}`, v.categoria)}: ${v.recorrido}`}
            arrow
          >
            <Chip
              label={`{{${v.key}}}`}
              size="small"
              onClick={() => handleInsert(v.key)}
              sx={{
                cursor: 'pointer',
                bgcolor: copiedVar === v.key ? '#4caf50' : '#e3f2fd',
                color: copiedVar === v.key ? '#fff' : '#1976d2',
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: '"Courier New", monospace',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#1976d2',
                  color: '#fff'
                }
              }}
            />
          </Tooltip>
        ))}
        {variablesForTemplates.length > 10 && (
          <Chip
            label={`+${variablesForTemplates.length - 10}`}
            size="small"
            sx={{
              bgcolor: '#f5f5f5',
              color: '#666',
              fontSize: '0.65rem'
            }}
          />
        )}
      </Box>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // MODO EXPANDIDO
  // ═══════════════════════════════════════════════════════════

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Code sx={{ fontSize: 16, color: '#666' }} />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#333'
            }}
          >
            {t('variables.availableVariables')}
          </Typography>
          <Chip
            label={variables.length}
            size="small"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 700,
              height: 18
            }}
          />
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Contenido colapsable */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* Info */}
          <Box
            sx={{
              p: 1,
              bgcolor: '#e3f2fd',
              borderRadius: 1,
              mb: 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1
            }}
          >
            <Info sx={{ fontSize: 14, color: '#1976d2', mt: 0.2 }} />
            <Typography
              variant="caption"
              sx={{
                color: '#1976d2',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.65rem',
                lineHeight: 1.4
              }}
            >
              {t('variables.clickToInsert')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : variables.length === 0 ? (
            <Box
              sx={{
                py: 3,
                textAlign: 'center',
                border: '2px dashed #e0e0e0',
                borderRadius: 2
              }}
            >
              <Code sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  color: '#888'
                }}
              >
                {t('variables.noVariablesYet')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#aaa', display: 'block', mt: 0.5 }}
              >
                {t('variables.goToConfig')}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Tabs de categorías */}
              {showCategories && categories.length > 1 && (
                <>
                  <Tabs
                    value={selectedCategory}
                    onChange={(_, v) => setSelectedCategory(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      mb: 2,
                      minHeight: 32,
                      '& .MuiTab-root': {
                        minHeight: 32,
                        py: 0.5,
                        px: 1.5,
                        minWidth: 'auto',
                        textTransform: 'none',
                        fontSize: '0.7rem'
                      }
                    }}
                  >
                    <Tab
                      value="all"
                      label={
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Category sx={{ fontSize: 14 }} />
                          {t('variables.categories.all')}
                        </Box>
                      }
                    />
                    {categories.map(cat => (
                      <Tab
                        key={cat}
                        value={cat}
                        label={
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: CATEGORY_COLORS[cat] || '#607d8b'
                              }}
                            />
                            {t(`variables.categories.${cat}`, cat)}
                          </Box>
                        }
                      />
                    ))}
                  </Tabs>
                  <Divider sx={{ mb: 2 }} />
                </>
              )}

              {/* Grid de Chips */}
              <Box
                sx={{
                  maxHeight,
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  p: 1
                }}
              >
                {filteredVariables.map(v => {
                  const catColor = CATEGORY_COLORS[v.categoria] || '#607d8b'
                  const isCopied = copiedVar === v.key
                  
                  return (
                    <Tooltip
                      key={v.key}
                      title={
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                            {t(`variables.categories.${v.categoria}`, v.categoria)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>
                            {v.recorrido}
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Chip
                        label={`{{${v.key}}}`}
                        onClick={() => handleInsert(v.key)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isCopied ? '#4caf50' : `${catColor}15`,
                          color: isCopied ? '#fff' : catColor,
                          border: `1px solid ${isCopied ? '#4caf50' : catColor}`,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          fontFamily: '"Courier New", monospace',
                          height: 28,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: catColor,
                            color: '#fff',
                            transform: 'translateY(-1px)',
                            boxShadow: `0 2px 4px ${catColor}40`
                          },
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                      />
                    </Tooltip>
                  )
                })}
              </Box>

              {/* Contador */}
              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {filteredVariables.length} {t('variables.total')}
                  {selectedCategory !== 'all' && ` - ${t(`variables.categories.${selectedCategory}`, selectedCategory)}`}
                </Typography>
                <Box display="flex" gap={0.5}>
                  {categories.slice(0, 4).map(cat => (
                    <Box
                      key={cat}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: CATEGORY_COLORS[cat] || '#607d8b'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default VariableInserter