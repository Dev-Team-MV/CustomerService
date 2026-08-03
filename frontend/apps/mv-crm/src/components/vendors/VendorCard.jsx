// apps/mv-crm/src/components/vendors/VendorCard.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip, IconButton, Tooltip, Avatar } from '@mui/material'
import { Phone, LocationOn, Edit, Delete, Public, Business } from '@mui/icons-material'

const VendorCard = ({ vendor, onClick, onEdit, onDelete, categories = [] }) => {
  const { t, i18n } = useTranslation('vendors')
  const lang = i18n.language.startsWith('es') ? 'es' : 'en'

  const firstPhone = vendor.contactPhones?.[0]
  const firstLocation = vendor.locations?.[0]
  const projectName = vendor.projectId?.name || t('vendors.generalVendor')

  const getCategoryLabel = (slug) => {
    const cat = categories.find(c => c.slug === slug)
    return cat ? cat.label[lang] : slug
  }

  const getSubcategoryLabel = (slug) => {
    const cat = categories.find(c => c.slug === vendor.category)
    if (!cat) return slug
    const sub = cat.subcategories.find(s => s.slug === slug)
    return sub ? sub.label[lang] : slug
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 0,
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        // ✅ NUEVO: Fuerza a la tarjeta a ocupar toda la altura de la celda del Grid
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: '4px 4px 0px rgba(0,0,0,0.08)',
          borderColor: '#000'
        }
      }}
    >
      {/* Header: Foto + Nombre + Acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} gap={1}>
        <Avatar
          src={vendor.photo}
          alt={vendor.name}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 0,
            bgcolor: vendor.photo ? 'transparent' : '#f5f5f5',
            color: '#888',
            fontSize: '1.5rem',
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {!vendor.photo && vendor.name.charAt(0).toUpperCase()}
        </Avatar>
        
        <Box display="flex" gap={0.5}>
          <Tooltip title={t('actions.update', 'Editar')}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit?.() }}
              sx={{ borderRadius: 0, color: '#888', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.delete', 'Eliminar')}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete?.() }}
              sx={{ borderRadius: 0, color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Nombre */}
      <Typography
        variant="subtitle2"
        fontWeight={600}
        sx={{
          mb: 1,
          fontFamily: '"Helvetica Neue", sans-serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {vendor.name}
      </Typography>

      {/* Proyecto */}
      <Box mb={1} display="flex" alignItems="center" gap={0.5}>
        <Business sx={{ fontSize: 14, color: '#666', flexShrink: 0 }} />
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#666', 
            fontFamily: '"Helvetica Neue", sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          {projectName}
        </Typography>
      </Box>

      {/* Categoría y Subcategoría */}
      <Box mb={1} display="flex" flexWrap="wrap" gap={0.5}>
        <Chip
          label={getCategoryLabel(vendor.category)}
          size="small"
          sx={{
            borderRadius: 0,
            bgcolor: '#f5f5f5',
            color: '#666',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.65rem',
            height: 20
          }}
        />
        {vendor.subcategory && (
          <Chip
            label={getSubcategoryLabel(vendor.subcategory)}
            size="small"
            sx={{
              borderRadius: 0,
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              height: 20
            }}
          />
        )}
      </Box>

      {/* Espaciador para empujar el contenido inferior al fondo si la tarjeta es muy alta */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Teléfono */}
      {firstPhone && (
        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
          <Phone sx={{ fontSize: 14, color: '#888', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#666', fontFamily: '"Helvetica Neue", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {firstPhone}
          </Typography>
        </Box>
      )}

      {/* Ubicación */}
      {firstLocation && (
        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
          <LocationOn sx={{ fontSize: 14, color: '#888', flexShrink: 0 }} />
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontFamily: '"Helvetica Neue", sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}
          >
            {firstLocation.formattedAddress}
          </Typography>
        </Box>
      )}

      {/* Website */}
      {vendor.website && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Public sx={{ fontSize: 14, color: '#888', flexShrink: 0 }} />
          <Typography
            variant="caption"
            sx={{ color: '#1976d2', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
          >
            {vendor.website.replace(/^https?:\/\//, '')}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default VendorCard