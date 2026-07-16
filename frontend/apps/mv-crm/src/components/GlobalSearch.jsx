// apps/mv-crm/src/components/search/GlobalSearch.jsx
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material'
import {
  Search,
  Close,
  Person,
  TrendingUp,
  Assignment,
  FolderOpen,
  ArrowForward
} from '@mui/icons-material'
import { useGlobalSearch } from '../constants/hooks/useGlobalSearch'

const GlobalSearch = ({ open, onClose }) => {
  const { t } = useTranslation('search')
  const navigate = useNavigate()
  const inputRef = useRef(null)
  
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    total
  } = useGlobalSearch({ debounceMs: 300 })

  // Configuración de secciones con traducciones
  const SECTION_CONFIG = {
    clients: {
      title: t('sections.clients', 'Clientes'),
      icon: <Person sx={{ fontSize: 16, color: '#2196f3' }} />,
      color: '#2196f3'
    },
    leads: {
      title: t('sections.leads', 'Leads'),
      icon: <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />,
      color: '#4caf50'
    },
    activities: {
      title: t('sections.activities', 'Actividades'),
      icon: <Assignment sx={{ fontSize: 16, color: '#ff9800' }} />,
      color: '#ff9800'
    },
    projects: {
      title: t('sections.projects', 'Proyectos'),
      icon: <FolderOpen sx={{ fontSize: 16, color: '#9c27b0' }} />,
      color: '#9c27b0'
    }
  }

  // Focus automático en el input cuando se abre
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 100)
    }
  }, [open])

  // Navegar a resultado usando la URL del backend
  const handleNavigate = (item) => {
    if (item.url) {
      navigate(item.url)
      onClose()
    }
  }

  // Renderizar resultado
  const renderResult = (item, index) => {
    const config = SECTION_CONFIG[item.type] || {
      title: item.type,
      icon: <Search />,
      color: '#757575'
    }

    return (
      <ListItemButton
        key={`${item.type}-${item._id}-${index}`}
        onClick={() => handleNavigate(item)}
        sx={{
          borderRadius: 0,
          mb: 0.5,
          '&:hover': {
            bgcolor: '#f5f5f5'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {config.icon}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", sans-serif',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#000'
              }}
            >
              {item.label || t('noTitle', 'Sin título')}
            </Typography>
          }
          secondary={
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '0.5px'
              }}
            >
              {item.subtitle || ''}
            </Typography>
          }
        />
        <ArrowForward sx={{ fontSize: 16, color: '#ccc' }} />
      </ListItemButton>
    )
  }

  // Renderizar sección
  const renderSection = (type, items) => {
    if (!items || items.length === 0) return null

    const config = SECTION_CONFIG[type] || {
      title: type,
      icon: <Search />,
      color: '#757575'
    }

    return (
      <Box key={type} sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
            px: 2
          }}
        >
          {config.icon}
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            {config.title} ({items.length})
          </Typography>
        </Box>
        <List disablePadding>
          {items.map((item, index) => renderResult(item, index))}
        </List>
      </Box>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #ececec',
          maxHeight: '80vh',
          mt: 8
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid #ececec',
          p: 0,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <TextField
          inputRef={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder', 'Buscar clientes, leads, actividades...')}
          fullWidth
          variant="standard"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#888' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading && <CircularProgress size={20} />}
                <IconButton
                  size="small"
                  onClick={onClose}
                  sx={{ ml: 1 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontFamily: '"Courier New", monospace',
              fontSize: '0.85rem',
              px: 2,
              py: 1.5
            }
          }}
          sx={{
            '& .MuiInput-underline:before': {
              borderBottom: 'none'
            },
            '& .MuiInput-underline:after': {
              borderBottom: 'none'
            },
            '& .MuiInput-underline:hover:before': {
              borderBottom: 'none !important'
            }
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#d32f2f'
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && query.length >= 2 && total === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: 'center'
            }}
          >
            <Search sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.85rem',
                color: '#888',
                letterSpacing: '0.5px'
              }}
            >
              {t('noResults', 'No se encontraron resultados')}
            </Typography>
          </Box>
        )}

        {!loading && !error && query.length < 2 && (
          <Box
            sx={{
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#888',
                letterSpacing: '0.5px',
                mb: 1
              }}
            >
              {t('minChars', 'Escribe al menos 2 caracteres para buscar')}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                gap: 0.5,
                mt: 2
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#888',
                  bgcolor: '#f5f5f5',
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.5
                }}
              >
                ⌘K
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#888',
                  lineHeight: '24px'
                }}
              >
                {t('shortcut', 'para abrir búsqueda')}
              </Typography>
            </Box>
          </Box>
        )}

        {total > 0 && (
          <Box sx={{ py: 1 }}>
            {renderSection('clients', results.clients)}
            {renderSection('leads', results.leads)}
            {renderSection('projects', results.projects)}
            {renderSection('activities', results.activities)}
          </Box>
        )}

        {loading && (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default GlobalSearch