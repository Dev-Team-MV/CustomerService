// import { useState, useEffect } from 'react'
// import { useTranslation } from 'react-i18next'
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   IconButton,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Autocomplete,
//   Chip,
//   Divider,
//   Avatar,
//   Paper,
//   InputAdornment
// } from '@mui/material'
// import { 
//   Close, 
//   Save, 
//   Business, 
//   Person, 
//   PersonAdd, 
//   Phone, 
//   Email as EmailIcon 
// } from '@mui/icons-material'
// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

// import { es, enUS } from 'date-fns/locale'
// import { useResidents } from '@shared/hooks/useResidents'
// import { useProjects } from '@shared/hooks/useProjects'
// import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'
// import SubActivityList from './SubActivityList'

// const initialFormData = {
//   title: '',
//   description: '',
//   columnId: '',
//   priority: 'medium',
//   dueDate: null,
//   assignedTo: null,
//   tags: [],
//   relatedProjects: [],
//   contactType: 'none',
//   contact: null,
//   externalContact: { name: '', phone: '', email: '' }
// }

// const ActivityModal = ({ 
//   open, 
//   onClose, 
//   activity = null, 
//   columns = [],
//   onSave,
//   onAddSubtask,
//   onUpdateSubtask,
//   onDeleteSubtask
// }) => {
//   const { t, i18n } = useTranslation('activities')
//   const [formData, setFormData] = useState(initialFormData)
//   const [saving, setSaving] = useState(false)
//   const [tagInput, setTagInput] = useState('')

//   const isEditing = Boolean(activity?._id)
//   const dateLocale = i18n.language === 'es' ? es : enUS

//   const { users, loading: loadingUsers } = useResidents(null, { 
//     smsProjectId: import.meta.env.VITE_PROJECT_ID 
//   })

//   const { projects, loading: loadingProjects } = useProjects()

//   const userOptions = users.map(u => ({
//     _id: u._id,
//     name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
//     email: u.email,
//     phone: u.phoneNumber || ''
//   }))

//   const projectOptions = projects.map(p => ({
//     _id: p._id,
//     name: p.name || p.title?.es || p.title?.en || p.slug || 'Sin nombre',
//     slug: p.slug,
//     status: p.status
//   }))

//   useEffect(() => {
//     if (activity) {
//       const assignee = activity.assignedTo
      
//       const relatedProjs = (activity.relatedProjects || []).map(p => {
//         if (typeof p === 'object') {
//           return {
//             _id: p._id,
//             name: p.name || p.title?.es || p.title?.en || p.slug || 'Sin nombre',
//             slug: p.slug,
//             status: p.status
//           }
//         }
//         const found = projects.find(proj => proj._id === p)
//         return found ? {
//           _id: found._id,
//           name: found.name || found.title?.es || found.title?.en || found.slug || 'Sin nombre',
//           slug: found.slug,
//           status: found.status
//         } : null
//       }).filter(Boolean)

//       let contactType = 'none'
//       let contact = null
//       let externalContact = { name: '', phone: '', email: '' }
      
//       if (activity.contact) {
//         if (activity.contact.user) {
//           contactType = 'registered'
//           const contactUser = users.find(u => u._id === activity.contact.user)
//           contact = contactUser ? {
//             _id: contactUser._id,
//             name: `${contactUser.firstName || ''} ${contactUser.lastName || ''}`.trim() || contactUser.email,
//             email: contactUser.email,
//             phone: contactUser.phoneNumber || ''
//           } : {
//             _id: activity.contact.user,
//             name: activity.contact.name || '',
//             email: activity.contact.email || '',
//             phone: activity.contact.phone || ''
//           }
//         } else if (activity.contact.name) {
//           contactType = 'external'
//           externalContact = {
//             name: activity.contact.name || '',
//             phone: activity.contact.phone || '',
//             email: activity.contact.email || ''
//           }
//         }
//       }

//       setFormData({
//         title: activity.title || '',
//         description: activity.description || '',
//         columnId: typeof activity.columnId === 'object' 
//           ? activity.columnId._id 
//           : (activity.columnId || columns[0]?._id || ''),
//         priority: activity.priority || 'medium',
//         dueDate: activity.dueDate ? new Date(activity.dueDate) : null,
//         assignedTo: assignee ? {
//           _id: assignee._id,
//           name: `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim(),
//           email: assignee.email,
//           phone: assignee.phoneNumber || ''
//         } : null,
//         tags: activity.tags || [],
//         relatedProjects: relatedProjs,
//         contactType,
//         contact,
//         externalContact
//       })
//     } else {
//       setFormData({
//         ...initialFormData,
//         columnId: columns[0]?._id || ''
//       })
//     }
//   }, [activity, open, columns, projects, users])

//   const handleChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//   }

//   const handleExternalContactChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       externalContact: { ...prev.externalContact, [field]: value }
//     }))
//   }

//   const handleContactTypeChange = (type) => {
//     setFormData(prev => ({
//       ...prev,
//       contactType: type,
//       contact: null,
//       externalContact: { name: '', phone: '', email: '' }
//     }))
//   }

//   const handleAddTag = () => {
//     if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
//       setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
//       setTagInput('')
//     }
//   }

//   const handleRemoveTag = (tag) => {
//     setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
//   }

//   const handleSave = async () => {
//     if (!formData.title.trim() || !formData.columnId) return
    
//     setSaving(true)
//     try {
//       let contactPayload = null
//       if (formData.contactType === 'registered' && formData.contact) {
//         contactPayload = {
//           user: formData.contact._id,
//           name: formData.contact.name,
//           phone: formData.contact.phone || '',
//           email: formData.contact.email || ''
//         }
//       } else if (formData.contactType === 'external' && formData.externalContact.name) {
//         contactPayload = {
//           name: formData.externalContact.name,
//           phone: formData.externalContact.phone || '',
//           email: formData.externalContact.email || ''
//         }
//       }

//       const payload = {
//         title: formData.title,
//         description: formData.description,
//         columnId: formData.columnId,
//         priority: formData.priority,
//         dueDate: formData.dueDate || undefined,
//         assignedTo: formData.assignedTo?._id || undefined,
//         tags: formData.tags,
//         relatedProjects: formData.relatedProjects.map(p => p._id),
//         contact: contactPayload
//       }
//       console.log(payload);
      
//       await onSave?.(payload, activity?._id)
//       onClose()
//     } catch (err) {
//       console.error('Error saving activity:', err)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleAddSubtask = async (activityId, data) => {
//     if (activity?._id) {
//       await onAddSubtask?.(activity._id, data)
//     }
//   }

//   const handleUpdateSubtask = async (subtaskId, data) => {
//     if (activity?._id) {
//       await onUpdateSubtask?.(activity._id, subtaskId, data)
//     }
//   }

//   const handleDeleteSubtask = async (subtaskId) => {
//     if (activity?._id) {
//       await onDeleteSubtask?.(activity._id, subtaskId)
//     }
//   }

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose} 
//       maxWidth="lg" 
//       fullWidth
//       PaperProps={{ sx: { borderRadius: 3 } }}
//     >
//       <DialogTitle>
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Typography variant="h6" fontWeight={700}>
//             {isEditing ? t('activities.editActivity') : t('activities.createActivity')}
//           </Typography>
//           <IconButton onClick={onClose} size="small">
//             <Close />
//           </IconButton>
//         </Box>
//       </DialogTitle>

//       <DialogContent dividers>
//         <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
//           <Box display="flex" gap={3}>
//             <Box flex={1} display="flex" flexDirection="column" gap={2.5} py={1}>
//               <TextField
//                 label={t('activities.form.title')}
//                 value={formData.title}
//                 onChange={(e) => handleChange('title', e.target.value)}
//                 fullWidth
//                 required
//                 placeholder={t('activities.form.titlePlaceholder')}
//               />

//               <TextField
//                 label={t('activities.form.description')}
//                 value={formData.description}
//                 onChange={(e) => handleChange('description', e.target.value)}
//                 fullWidth
//                 multiline
//                 rows={3}
//                 placeholder={t('activities.form.descriptionPlaceholder')}
//               />

//               <Box display="flex" gap={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>{t('activities.form.column')}</InputLabel>
//                   <Select
//                     value={formData.columnId}
//                     label={t('activities.form.column')}
//                     onChange={(e) => handleChange('columnId', e.target.value)}
//                   >
//                     {columns.map(col => (
//                       <MenuItem key={col._id} value={col._id}>
//                         <Box display="flex" alignItems="center" gap={1}>
//                           <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color }} />
//                           {col.name}
//                         </Box>
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <FormControl fullWidth>
//                   <InputLabel>{t('activities.form.priority')}</InputLabel>
//                   <Select
//                     value={formData.priority}
//                     label={t('activities.form.priority')}
//                     onChange={(e) => handleChange('priority', e.target.value)}
//                   >
//                     {ACTIVITY_PRIORITIES.map(p => (
//                       <MenuItem key={p.id} value={p.id}>
//                         <Chip 
//                           label={t(`activities.priority.${p.id}`)} 
//                           size="small" 
//                           sx={{ bgcolor: `${p.color}20`, color: p.color, height: 22 }} 
//                         />
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               <Box display="flex" gap={2}>
//                 <DatePicker
//                   label={t('activities.form.dueDate')}
//                   value={formData.dueDate}
//                   onChange={(newValue) => handleChange('dueDate', newValue)}
//                   slotProps={{ textField: { fullWidth: true } }}
//                 />

//                 <Autocomplete
//                   options={userOptions}
//                   loading={loadingUsers}
//                   getOptionLabel={(option) => option.name || ''}
//                   isOptionEqualToValue={(option, val) => option._id === val?._id}
//                   value={formData.assignedTo}
//                   onChange={(_, newValue) => handleChange('assignedTo', newValue)}
//                   fullWidth
//                   renderInput={(params) => (
//                     <TextField {...params} label={t('activities.form.assignedTo')} placeholder={t('activities.contact.searchByName')} />
//                   )}
//                   renderOption={(props, option) => (
//                     <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={1.5}>
//                       <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
//                         {option.name?.charAt(0)}
//                       </Avatar>
//                       <Box>
//                         <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
//                         <Typography variant="caption" color="text.secondary">{option.email}</Typography>
//                       </Box>
//                     </Box>
//                   )}
//                 />
//               </Box>

//               {/* Sección de Contacto */}
//               <Box>
//                 <Typography variant="subtitle2" fontWeight={600} mb={1}>
//                   {t('activities.form.contact')}
//                 </Typography>
                
//                 <Box display="flex" gap={1} mb={2}>
//                   <Chip
//                     label={t('activities.contact.noContact')}
//                     onClick={() => handleContactTypeChange('none')}
//                     variant={formData.contactType === 'none' ? 'filled' : 'outlined'}
//                     sx={{ bgcolor: formData.contactType === 'none' ? '#e0e0e0' : 'transparent' }}
//                   />
//                   <Chip
//                     label={t('activities.contact.registeredUser')}
//                     icon={<Person sx={{ fontSize: 16 }} />}
//                     onClick={() => handleContactTypeChange('registered')}
//                     color={formData.contactType === 'registered' ? 'primary' : 'default'}
//                     variant={formData.contactType === 'registered' ? 'filled' : 'outlined'}
//                   />
//                   <Chip
//                     label={t('activities.contact.externalContact')}
//                     icon={<PersonAdd sx={{ fontSize: 16 }} />}
//                     onClick={() => handleContactTypeChange('external')}
//                     color={formData.contactType === 'external' ? 'warning' : 'default'}
//                     variant={formData.contactType === 'external' ? 'filled' : 'outlined'}
//                   />
//                 </Box>

//                 {formData.contactType === 'registered' && (
//                   <Autocomplete
//                     options={userOptions}
//                     loading={loadingUsers}
//                     getOptionLabel={(option) => option.name || ''}
//                     isOptionEqualToValue={(option, val) => option._id === val?._id}
//                     value={formData.contact}
//                     onChange={(_, newValue) => handleChange('contact', newValue)}
//                     fullWidth
//                     renderInput={(params) => (
//                       <TextField 
//                         {...params} 
//                         label={t('activities.form.contact')} 
//                         placeholder={t('activities.contact.searchByName')} 
//                         size="small"
//                       />
//                     )}
//                     renderOption={(props, option) => (
//                       <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={1.5}>
//                         <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
//                           {option.name?.charAt(0)}
//                         </Avatar>
//                         <Box flex={1}>
//                           <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {option.email} {option.phone && `• ${option.phone}`}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     )}
//                   />
//                 )}

//                 {formData.contactType === 'external' && (
//                   <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff8e1' }}>
//                     <Box display="flex" alignItems="center" gap={1} mb={2}>
//                       <PersonAdd color="warning" />
//                       <Typography variant="body2" color="warning.main" fontWeight={500}>
//                         {t('activities.contact.unregisteredContact')}
//                       </Typography>
//                     </Box>
//                     <Box display="flex" flexDirection="column" gap={2}>
//                       <TextField
//                         label={t('activities.contact.name')}
//                         value={formData.externalContact.name}
//                         onChange={(e) => handleExternalContactChange('name', e.target.value)}
//                         fullWidth
//                         size="small"
//                         required
//                         InputProps={{
//                           startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
//                         }}
//                       />
//                       <Box display="flex" gap={2}>
//                         <TextField
//                           label={t('activities.contact.phone')}
//                           value={formData.externalContact.phone}
//                           onChange={(e) => handleExternalContactChange('phone', e.target.value)}
//                           fullWidth
//                           size="small"
//                           InputProps={{
//                             startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
//                           }}
//                         />
//                         <TextField
//                           label={t('activities.contact.email')}
//                           value={formData.externalContact.email}
//                           onChange={(e) => handleExternalContactChange('email', e.target.value)}
//                           fullWidth
//                           size="small"
//                           type="email"
//                           InputProps={{
//                             startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
//                           }}
//                         />
//                       </Box>
//                     </Box>
//                   </Paper>
//                 )}
//               </Box>

//               {/* Proyectos relacionados */}
//               <Box>
//                 <Typography variant="subtitle2" mb={1}>{t('activities.form.relatedProjects')}</Typography>
//                 <Autocomplete
//                   multiple
//                   options={projectOptions}
//                   loading={loadingProjects}
//                   getOptionLabel={(option) => option.name || ''}
//                   isOptionEqualToValue={(option, val) => option._id === val?._id}
//                   value={formData.relatedProjects}
//                   onChange={(_, newValue) => handleChange('relatedProjects', newValue)}
//                   disableCloseOnSelect
//                   renderInput={(params) => (
//                     <TextField {...params} placeholder={t('activities.form.searchProjects')} size="small" />
//                   )}
//                   renderOption={(props, option, { selected }) => (
//                     <Box 
//                       component="li" 
//                       {...props} 
//                       key={option._id}
//                       sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: selected ? '#e3f2fd' : 'transparent' }}
//                     >
//                       <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976d2' }}>
//                         <Business sx={{ fontSize: 16 }} />
//                       </Avatar>
//                       <Box flex={1}>
//                         <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
//                         {option.slug && (
//                           <Typography variant="caption" color="text.secondary">{option.slug}</Typography>
//                         )}
//                       </Box>
//                       {option.status && (
//                         <Chip label={option.status} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
//                       )}
//                     </Box>
//                   )}
//                   renderTags={(value, getTagProps) =>
//                     value.map((option, index) => (
//                       <Chip
//                         {...getTagProps({ index })}
//                         key={option._id}
//                         label={option.name}
//                         size="small"
//                         avatar={
//                           <Avatar sx={{ bgcolor: '#1976d2' }}>
//                             <Business sx={{ fontSize: 12, color: 'white' }} />
//                           </Avatar>
//                         }
//                       />
//                     ))
//                   }
//                 />
//               </Box>

//               {/* Tags */}
//               <Box>
//                 <Typography variant="subtitle2" mb={1}>{t('activities.form.tags')}</Typography>
//                 <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
//                   {formData.tags.map(tag => (
//                     <Chip key={tag} label={tag} size="small" onDelete={() => handleRemoveTag(tag)} />
//                   ))}
//                 </Box>
//                 <Box display="flex" gap={1}>
//                   <TextField
//                     size="small"
//                     placeholder={t('activities.form.enterTag')}
//                     value={tagInput}
//                     onChange={(e) => setTagInput(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
//                     sx={{ flex: 1 }}
//                   />
//                   <Button variant="outlined" size="small" onClick={handleAddTag}>
//                     {t('activities.form.addTag')}
//                   </Button>
//                 </Box>
//               </Box>
//             </Box>

//             {isEditing && (
//               <>
//                 <Divider orientation="vertical" flexItem />
//                 <Box sx={{ width: 350, py: 1 }}>
//                   <SubActivityList
//                     subActivities={activity?.subtasks || []}
//                     parentActivityId={activity?._id}
//                     onAdd={handleAddSubtask}
//                     onUpdate={handleUpdateSubtask}
//                     onDelete={handleDeleteSubtask}
//                   />
//                 </Box>
//               </>
//             )}
//           </Box>
//         </LocalizationProvider>
//       </DialogContent>

//       <DialogActions sx={{ p: 2 }}>
//         <Button onClick={onClose} disabled={saving}>
//           {t('activities.form.cancel')}
//         </Button>
//         <Button
//           variant="contained"
//           onClick={handleSave}
//           disabled={!formData.title.trim() || !formData.columnId || saving}
//           startIcon={<Save />}
//         >
//           {saving ? t('activities.saving') : isEditing ? t('activities.form.update') : t('activities.form.create')}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default ActivityModal

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Chip,
  Divider,
  Avatar,
  Paper,
  InputAdornment
} from '@mui/material'
import { 
  Close, 
  Save, 
  Business, 
  Person, 
  PersonAdd, 
  Phone, 
  Email as EmailIcon 
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

import { es, enUS } from 'date-fns/locale'
import { useResidents } from '@shared/hooks/useResidents'
import { useProjects } from '@shared/hooks/useProjects'
import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'
import SubActivityList from './SubActivityList'

const initialFormData = {
  title: '',
  description: '',
  columnId: '',
  priority: 'medium',
  dueDate: null,
  assignedTo: null,
  tags: [],
  relatedProjects: [],
  contactType: 'none',
  contact: null,
  externalContact: { name: '', phone: '', email: '' }
}

const ActivityModal = ({ 
  open, 
  onClose, 
  activity = null, 
  columns = [],
  onSave,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask
}) => {
  const { t, i18n } = useTranslation('activities')
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const isEditing = Boolean(activity?._id)
  const dateLocale = i18n.language === 'es' ? es : enUS

  const { users, loading: loadingUsers } = useResidents(null, { 
    smsProjectId: import.meta.env.VITE_PROJECT_ID 
  })

  const { projects, loading: loadingProjects } = useProjects()

  // ✅ Usuarios para asignar (solo admin y superadmin)
  const adminUserOptions = users
    .filter(u => u.role === 'admin' || u.role === 'superadmin')
    .map(u => ({
      _id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      phone: u.phoneNumber || '',
      role: u.role
    }))

  // ✅ Todos los usuarios (para contacto registrado)
  const allUserOptions = users.map(u => ({
    _id: u._id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
    email: u.email,
    phone: u.phoneNumber || ''
  }))

  const projectOptions = projects.map(p => ({
    _id: p._id,
    name: p.name || p.title?.es || p.title?.en || p.slug || 'Sin nombre',
    slug: p.slug,
    status: p.status
  }))

  useEffect(() => {
    if (activity) {
      const assignee = activity.assignedTo
      
      const relatedProjs = (activity.relatedProjects || []).map(p => {
        if (typeof p === 'object') {
          return {
            _id: p._id,
            name: p.name || p.title?.es || p.title?.en || p.slug || 'Sin nombre',
            slug: p.slug,
            status: p.status
          }
        }
        const found = projects.find(proj => proj._id === p)
        return found ? {
          _id: found._id,
          name: found.name || found.title?.es || found.title?.en || found.slug || 'Sin nombre',
          slug: found.slug,
          status: found.status
        } : null
      }).filter(Boolean)

      let contactType = 'none'
      let contact = null
      let externalContact = { name: '', phone: '', email: '' }
      
      if (activity.contact) {
        if (activity.contact.user) {
          contactType = 'registered'
          const contactUser = users.find(u => u._id === activity.contact.user)
          contact = contactUser ? {
            _id: contactUser._id,
            name: `${contactUser.firstName || ''} ${contactUser.lastName || ''}`.trim() || contactUser.email,
            email: contactUser.email,
            phone: contactUser.phoneNumber || ''
          } : {
            _id: activity.contact.user,
            name: activity.contact.name || '',
            email: activity.contact.email || '',
            phone: activity.contact.phone || ''
          }
        } else if (activity.contact.name) {
          contactType = 'external'
          externalContact = {
            name: activity.contact.name || '',
            phone: activity.contact.phone || '',
            email: activity.contact.email || ''
          }
        }
      }

      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        columnId: typeof activity.columnId === 'object' 
          ? activity.columnId._id 
          : (activity.columnId || columns[0]?._id || ''),
        priority: activity.priority || 'medium',
        dueDate: activity.dueDate ? new Date(activity.dueDate) : null,
        assignedTo: assignee ? {
          _id: assignee._id,
          name: `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim(),
          email: assignee.email,
          phone: assignee.phoneNumber || ''
        } : null,
        tags: activity.tags || [],
        relatedProjects: relatedProjs,
        contactType,
        contact,
        externalContact
      })
    } else {
      setFormData({
        ...initialFormData,
        columnId: columns[0]?._id || ''
      })
    }
  }, [activity, open, columns, projects, users])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleExternalContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      externalContact: { ...prev.externalContact, [field]: value }
    }))
  }

  const handleContactTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      contactType: type,
      contact: null,
      externalContact: { name: '', phone: '', email: '' }
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.columnId) return
    
    setSaving(true)
    try {
      let contactPayload = null
      if (formData.contactType === 'registered' && formData.contact) {
        contactPayload = {
          user: formData.contact._id,
          name: formData.contact.name,
          phone: formData.contact.phone || '',
          email: formData.contact.email || ''
        }
      } else if (formData.contactType === 'external' && formData.externalContact.name) {
        contactPayload = {
          name: formData.externalContact.name,
          phone: formData.externalContact.phone || '',
          email: formData.externalContact.email || ''
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        columnId: formData.columnId,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        assignedTo: formData.assignedTo?._id || undefined,
        tags: formData.tags,
        relatedProjects: formData.relatedProjects.map(p => p._id),
        contact: contactPayload
      }
      
      await onSave?.(payload, activity?._id)
      onClose()
    } catch (err) {
      console.error('Error saving activity:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddSubtask = async (activityId, data) => {
    if (activity?._id) {
      await onAddSubtask?.(activity._id, data)
    }
  }

  const handleUpdateSubtask = async (subtaskId, data) => {
    if (activity?._id) {
      await onUpdateSubtask?.(activity._id, subtaskId, data)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    if (activity?._id) {
      await onDeleteSubtask?.(activity._id, subtaskId)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? t('activities.editActivity') : t('activities.createActivity')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
          <Box display="flex" gap={3}>
            <Box flex={1} display="flex" flexDirection="column" gap={2.5} py={1}>
              <TextField
                label={t('activities.form.title')}
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                fullWidth
                required
                placeholder={t('activities.form.titlePlaceholder')}
              />

              <TextField
                label={t('activities.form.description')}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder={t('activities.form.descriptionPlaceholder')}
              />

              <Box display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>{t('activities.form.column')}</InputLabel>
                  <Select
                    value={formData.columnId}
                    label={t('activities.form.column')}
                    onChange={(e) => handleChange('columnId', e.target.value)}
                  >
                    {columns.map(col => (
                      <MenuItem key={col._id} value={col._id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color }} />
                          {col.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>{t('activities.form.priority')}</InputLabel>
                  <Select
                    value={formData.priority}
                    label={t('activities.form.priority')}
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    {ACTIVITY_PRIORITIES.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        <Chip 
                          label={t(`activities.priority.${p.id}`)} 
                          size="small" 
                          sx={{ bgcolor: `${p.color}20`, color: p.color, height: 22 }} 
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box display="flex" gap={2}>
                <DatePicker
                  label={t('activities.form.dueDate')}
                  value={formData.dueDate}
                  onChange={(newValue) => handleChange('dueDate', newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                {/* ✅ CAMPO ASSIGNED TO - Solo admin y superadmin */}
                <Autocomplete
                  options={adminUserOptions}
                  loading={loadingUsers}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, val) => option._id === val?._id}
                  value={formData.assignedTo}
                  onChange={(_, newValue) => handleChange('assignedTo', newValue)}
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} label={t('activities.form.assignedTo')} placeholder="Buscar administrador..." />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: option.role === 'superadmin' ? '#9c27b0' : '#2196f3' }}>
                        {option.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email} • {option.role}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              {/* Sección de Contacto */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  {t('activities.form.contact')}
                </Typography>
                
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={t('activities.contact.noContact')}
                    onClick={() => handleContactTypeChange('none')}
                    variant={formData.contactType === 'none' ? 'filled' : 'outlined'}
                    sx={{ bgcolor: formData.contactType === 'none' ? '#e0e0e0' : 'transparent' }}
                  />
                  <Chip
                    label={t('activities.contact.registeredUser')}
                    icon={<Person sx={{ fontSize: 16 }} />}
                    onClick={() => handleContactTypeChange('registered')}
                    color={formData.contactType === 'registered' ? 'primary' : 'default'}
                    variant={formData.contactType === 'registered' ? 'filled' : 'outlined'}
                  />
                  <Chip
                    label={t('activities.contact.externalContact')}
                    icon={<PersonAdd sx={{ fontSize: 16 }} />}
                    onClick={() => handleContactTypeChange('external')}
                    color={formData.contactType === 'external' ? 'warning' : 'default'}
                    variant={formData.contactType === 'external' ? 'filled' : 'outlined'}
                  />
                </Box>

                {formData.contactType === 'registered' && (
                  <Autocomplete
                    options={allUserOptions}
                    loading={loadingUsers}
                    getOptionLabel={(option) => option.name || ''}
                    isOptionEqualToValue={(option, val) => option._id === val?._id}
                    value={formData.contact}
                    onChange={(_, newValue) => handleChange('contact', newValue)}
                    fullWidth
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label={t('activities.form.contact')} 
                        placeholder={t('activities.contact.searchByName')} 
                        size="small"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
                          {option.name?.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.email} {option.phone && `• ${option.phone}`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                )}

                {formData.contactType === 'external' && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff8e1' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PersonAdd color="warning" />
                      <Typography variant="body2" color="warning.main" fontWeight={500}>
                        {t('activities.contact.unregisteredContact')}
                      </Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField
                        label={t('activities.contact.name')}
                        value={formData.externalContact.name}
                        onChange={(e) => handleExternalContactChange('name', e.target.value)}
                        fullWidth
                        size="small"
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                        }}
                      />
                      <Box display="flex" gap={2}>
                        <TextField
                          label={t('activities.contact.phone')}
                          value={formData.externalContact.phone}
                          onChange={(e) => handleExternalContactChange('phone', e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
                          }}
                        />
                        <TextField
                          label={t('activities.contact.email')}
                          value={formData.externalContact.email}
                          onChange={(e) => handleExternalContactChange('email', e.target.value)}
                          fullWidth
                          size="small"
                          type="email"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                )}
              </Box>

              {/* Proyectos relacionados */}
              <Box>
                <Typography variant="subtitle2" mb={1}>{t('activities.form.relatedProjects')}</Typography>
                <Autocomplete
                  multiple
                  options={projectOptions}
                  loading={loadingProjects}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, val) => option._id === val?._id}
                  value={formData.relatedProjects}
                  onChange={(_, newValue) => handleChange('relatedProjects', newValue)}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField {...params} placeholder={t('activities.form.searchProjects')} size="small" />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <Box 
                      component="li" 
                      {...props} 
                      key={option._id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: selected ? '#e3f2fd' : 'transparent' }}
                    >
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976d2' }}>
                        <Business sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
                        {option.slug && (
                          <Typography variant="caption" color="text.secondary">{option.slug}</Typography>
                        )}
                      </Box>
                      {option.status && (
                        <Chip label={option.status} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option._id}
                        label={option.name}
                        size="small"
                        avatar={
                          <Avatar sx={{ bgcolor: '#1976d2' }}>
                            <Business sx={{ fontSize: 12, color: 'white' }} />
                          </Avatar>
                        }
                      />
                    ))
                  }
                />
              </Box>

              {/* Tags */}
              <Box>
                <Typography variant="subtitle2" mb={1}>{t('activities.form.tags')}</Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                  {formData.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" onDelete={() => handleRemoveTag(tag)} />
                  ))}
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder={t('activities.form.enterTag')}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" size="small" onClick={handleAddTag}>
                    {t('activities.form.addTag')}
                  </Button>
                </Box>
              </Box>
            </Box>

            {isEditing && (
              <>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ width: 350, py: 1 }}>
                  <SubActivityList
                    subActivities={activity?.subtasks || []}
                    parentActivityId={activity?._id}
                    onAdd={handleAddSubtask}
                    onUpdate={handleUpdateSubtask}
                    onDelete={handleDeleteSubtask}
                  />
                </Box>
              </>
            )}
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t('activities.form.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.title.trim() || !formData.columnId || saving}
          startIcon={<Save />}
        >
          {saving ? t('activities.saving') : isEditing ? t('activities.form.update') : t('activities.form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActivityModal