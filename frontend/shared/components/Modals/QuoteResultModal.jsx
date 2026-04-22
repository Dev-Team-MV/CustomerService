// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   Divider,
//   Grid,
//   Chip,
//   IconButton,
//   Paper
// } from '@mui/material'
// import {
//   Close as CloseIcon,
//   Home as HomeIcon,
//   Apartment as ApartmentIcon,
//   AttachMoney as MoneyIcon,
//   CheckCircle as CheckIcon
// } from '@mui/icons-material'
// import { useNavigate } from 'react-router-dom'
// import { useTranslation } from 'react-i18next'

// const QuoteResultModal = ({ open, onClose, quoteData, type = 'property', theme }) => {
//   const navigate = useNavigate()
//   const { t } = useTranslation(['quote', 'common'])

//   if (!quoteData) return null

//   const isProperty = type === 'property'
//   const { totals, breakdown, lot, model, facade, options, apartmentModel, building, floorNumber, apartmentNumber, selectedRenderType } = quoteData

//   // Colores por defecto si no se pasa theme
//   const primaryColor = theme?.palette?.primary?.main || '#333F1F'
//   const secondaryColor = theme?.palette?.secondary?.main || '#8CA551'
//   const warningColor = theme?.palette?.warning?.main || '#E5863C'
//   const bgColor = theme?.palette?.background?.default || '#fafafa'

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(value || 0)
//   }

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//           boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
//         }
//       }}
//     >
//       {/* HEADER */}
//       <DialogTitle
//         sx={{
//           background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
//           color: 'white',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           py: 2.5,
//           px: 3
//         }}
//       >
//         <Box display="flex" alignItems="center" gap={1.5}>
//           <CheckIcon sx={{ fontSize: 32 }} />
//           <Box>
//             <Typography variant="h5" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//               {t('quote:quoteReady', 'Your Quote is Ready!')}
//             </Typography>
//             <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: '"Poppins", sans-serif' }}>
//               {isProperty ? t('quote:propertyQuote', 'Property Quote Details') : t('quote:apartmentQuote', 'Apartment Quote Details')}
//             </Typography>
//           </Box>
//         </Box>
//         <IconButton onClick={onClose} sx={{ color: 'white' }}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent sx={{ p: 3, bgcolor: bgColor }}>
//         {/* TOTALS SECTION */}
//         <Paper
//           elevation={0}
//           sx={{
//             p: 3,
//             mb: 3,
//             background: `linear-gradient(135deg, ${secondaryColor}1A 0%, ${secondaryColor}0D 100%)`,
//             border: `2px solid ${secondaryColor}`,
//             borderRadius: 3,
//             mt: 2
//           }}
//         >
//           <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif' }}>
//             {t('quote:summary', 'Quote Summary')}
//           </Typography>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12} sm={4}>
//               <Box textAlign="center" p={2} bgcolor="white" borderRadius={2}>
//                 <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:totalPrice', 'Total Price')}
//                 </Typography>
//                 <Typography variant="h4" fontWeight={700} sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif' }}>
//                   {formatCurrency(totals?.totalPrice || totals?.price)}
//                 </Typography>
//               </Box>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Box textAlign="center" p={2} bgcolor="white" borderRadius={2}>
//                 <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:initialPayment', 'Initial Payment')}
//                 </Typography>
//                 <Typography variant="h4" fontWeight={700} sx={{ color: secondaryColor, fontFamily: '"Poppins", sans-serif' }}>
//                   {formatCurrency(totals?.initialPayment)}
//                 </Typography>
//               </Box>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Box textAlign="center" p={2} bgcolor="white" borderRadius={2}>
//                 <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:pending', 'Pending')}
//                 </Typography>
//                 <Typography variant="h4" fontWeight={700} sx={{ color: warningColor, fontFamily: '"Poppins", sans-serif' }}>
//                   {formatCurrency(totals?.pending)}
//                 </Typography>
//               </Box>
//             </Grid>
//           </Grid>
//         </Paper>

//         {/* PROPERTY DETAILS */}
//         <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
//           <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
//             {isProperty ? <HomeIcon /> : <ApartmentIcon />}
//             {isProperty ? t('quote:propertyDetails', 'Property Details') : t('quote:apartmentDetails', 'Apartment Details')}
//           </Typography>
//           <Divider sx={{ my: 2 }} />

//           {isProperty ? (
//             <Grid container spacing={2}>
//               {lot && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {t('quote:lot', 'Lot')}
//                   </Typography>
//                   <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     #{lot.number} - {formatCurrency(lot.price)}
//                   </Typography>
//                 </Grid>
//               )}
//               {model && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {t('quote:model', 'Model')}
//                   </Typography>
//                   <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {model.model} - {formatCurrency(model.price)}
//                   </Typography>
//                 </Grid>
//               )}
//               {facade && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {t('quote:facade', 'Facade')}
//                   </Typography>
//                   <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {facade.title} {facade.price > 0 ? `- ${formatCurrency(facade.price)}` : '(Included)'}
//                   </Typography>
//                 </Grid>
//               )}
//               {options && (
//                 <Grid item xs={12}>
//                   <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {t('quote:options', 'Options')}
//                   </Typography>
//                   <Box display="flex" gap={1} flexWrap="wrap">
//                     <Chip 
//                       label={options.modelType === 'upgrade' ? t('quote:upgrade', 'Upgrade') : t('quote:basic', 'Basic')} 
//                       size="small" 
//                       color={options.modelType === 'upgrade' ? 'primary' : 'default'}
//                     />
//                     {options.hasBalcony && (
//                       <Chip label={t('quote:balcony', 'Balcony')} size="small" color="success" />
//                     )}
//                     {!options.hasBalcony && (
//                       <Chip label={t('quote:noBalcony', 'No Balcony')} size="small" variant="outlined" />
//                     )}
//                     {options.hasStorage && (
//                       <Chip label={t('quote:storage', 'Storage')} size="small" color="warning" />
//                     )}
//                     {!options.hasStorage && (
//                       <Chip label={t('quote:noStorage', 'No Storage')} size="small" variant="outlined" />
//                     )}
//                   </Box>
//                 </Grid>
//               )}
//             </Grid>
//           ) : (
//             <Grid container spacing={2}>
//               {apartmentModel && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {t('quote:apartmentModel', 'Model')}
//                   </Typography>
//                   <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {apartmentModel.name} ({apartmentModel.modelNumber})
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {apartmentModel.bedrooms} {t('quote:bedrooms', 'beds')} • {apartmentModel.bathrooms} {t('quote:bathrooms', 'baths')} • {apartmentModel.sqft} sqft
//                   </Typography>
//                 </Grid>
//               )}
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:location', 'Location')}
//                 </Typography>
//                 <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:apartmentNumber', 'Apt {{number}} - Floor {{floor}}', { number: apartmentNumber, floor: floorNumber })}
//                 </Typography>
//               </Grid>
//               {selectedRenderType && (
//                 <Grid item xs={12}>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     {t('quote:renderType', 'Render Type')}
//                   </Typography>
//                   <Chip 
//                     label={selectedRenderType === 'upgrade' ? t('quote:upgrade', 'Upgrade') : t('quote:basic', 'Basic')} 
//                     size="small" 
//                     color={selectedRenderType === 'upgrade' ? 'primary' : 'default'}
//                   />
//                 </Grid>
//               )}
//             </Grid>
//           )}
//         </Paper>

//         {/* PRICE BREAKDOWN (only for properties) */}
//         {isProperty && breakdown && (
//           <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
//             <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
//               <MoneyIcon />
//               {t('quote:priceBreakdown', 'Price Breakdown')}
//             </Typography>
//             <Divider sx={{ my: 2 }} />
//             <Grid container spacing={1.5}>
//               <Grid item xs={6}>
//                 <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:lotPrice', 'Lot Price')}
//                 </Typography>
//               </Grid>
//               <Grid item xs={6} textAlign="right">
//                 <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {formatCurrency(breakdown.lotPrice)}
//                 </Typography>
//               </Grid>

//               <Grid item xs={6}>
//                 <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:modelBasePrice', 'Model Base Price')}
//                 </Typography>
//               </Grid>
//               <Grid item xs={6} textAlign="right">
//                 <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {formatCurrency(breakdown.modelBasePrice)}
//                 </Typography>
//               </Grid>

//               {breakdown.facadePrice > 0 && (
//                 <>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {t('quote:facadePrice', 'Facade Price')}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} textAlign="right">
//                     <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {formatCurrency(breakdown.facadePrice)}
//                     </Typography>
//                   </Grid>
//                 </>
//               )}

//               {breakdown.upgradePrice > 0 && (
//                 <>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {t('quote:upgradePrice', 'Upgrade Price')}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} textAlign="right">
//                     <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {formatCurrency(breakdown.upgradePrice)}
//                     </Typography>
//                   </Grid>
//                 </>
//               )}

//               {breakdown.balconyPrice > 0 && (
//                 <>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {t('quote:balconyPrice', 'Balcony Price')}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} textAlign="right">
//                     <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {formatCurrency(breakdown.balconyPrice)}
//                     </Typography>
//                   </Grid>
//                 </>
//               )}

//               {breakdown.storagePrice > 0 && (
//                 <>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {t('quote:storagePrice', 'Storage Price')}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} textAlign="right">
//                     <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                       {formatCurrency(breakdown.storagePrice)}
//                     </Typography>
//                   </Grid>
//                 </>
//               )}

//               <Grid item xs={12}>
//                 <Divider sx={{ my: 1 }} />
//               </Grid>

//               <Grid item xs={6}>
//                 <Typography variant="body1" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                   {t('quote:total', 'Total')}
//                 </Typography>
//               </Grid>
//               <Grid item xs={6} textAlign="right">
//                 <Typography variant="body1" fontWeight={700} sx={{ color: secondaryColor, fontFamily: '"Poppins", sans-serif' }}>
//                   {formatCurrency(totals?.totalPrice || totals?.price)}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Paper>
//         )}
//       </DialogContent>

//       <DialogActions sx={{ p: 3, bgcolor: bgColor, borderTop: '1px solid #e0e0e0' }}>
//         <Button
//           onClick={onClose}
//           variant="outlined"
//           sx={{
//             borderColor: secondaryColor,
//             color: primaryColor,
//             fontFamily: '"Poppins", sans-serif',
//             '&:hover': {
//               borderColor: secondaryColor,
//               bgcolor: `${secondaryColor}14`
//             }
//           }}
//         >
//           {t('common:close', 'Close')}
//         </Button>
//         <Button
//           onClick={() => {
//             onClose()
//             navigate('/login')
//           }}
//           variant="contained"
//           sx={{
//             bgcolor: primaryColor,
//             fontFamily: '"Poppins", sans-serif',
//             '&:hover': {
//               bgcolor: secondaryColor
//             }
//           }}
//         >
//           {t('quote:signInToCreate', 'Sign In to Create Property')}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default QuoteResultModal

// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/components/Modals/QuoteResultModal.jsx

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  IconButton,
  Paper
} from '@mui/material'
import {
  Close as CloseIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Tune as TuneIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const QuoteResultModal = ({ open, onClose, quoteData, type = 'property', theme }) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['quote', 'common'])

  if (!quoteData) return null

  const isProperty = type === 'property'
  const { totals, breakdown, lot, model, facade, options, apartmentModel, building, floorNumber, apartmentNumber, selectedRenderType, pricingConfig } = quoteData

  // Colores por defecto si no se pasa theme
  const primaryColor = theme?.palette?.primary?.main || '#333F1F'
  const secondaryColor = theme?.palette?.secondary?.main || '#8CA551'
  const warningColor = theme?.palette?.warning?.main || '#E5863C'
  const bgColor = theme?.palette?.background?.default || '#fafafa'

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2.5,
          px: 3
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <CheckIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('quote:quoteReady', 'Your Quote is Ready!')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: '"Poppins", sans-serif' }}>
              {isProperty ? t('quote:propertyQuote', 'Property Quote Details') : t('quote:apartmentQuote', 'Apartment Quote Details')}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: bgColor }}>
        {/* TOTALS SECTION */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${secondaryColor}1A 0%, ${secondaryColor}0D 100%)`,
            border: `2px solid ${secondaryColor}`,
            borderRadius: 3,
            mt: 2
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif' }}>
            {t('quote:summary', 'Quote Summary')}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" p={2} bgcolor="white" borderRadius={2}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:totalPrice', 'Total Price')}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif' }}>
                  {formatCurrency(totals?.totalPrice || totals?.price)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" p={2} bgcolor="white" borderRadius={2}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:initialPayment', 'Initial Payment')}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: secondaryColor, fontFamily: '"Poppins", sans-serif' }}>
                  {formatCurrency(totals?.initialPayment)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" p={2} bgcolor="white" borderRadius={2}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:pending', 'Pending')}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: warningColor, fontFamily: '"Poppins", sans-serif' }}>
                  {formatCurrency(totals?.pending)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* PROPERTY DETAILS */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isProperty ? <HomeIcon /> : <ApartmentIcon />}
            {isProperty ? t('quote:propertyDetails', 'Property Details') : t('quote:apartmentDetails', 'Apartment Details')}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {isProperty ? (
            <Grid container spacing={2}>
              {lot && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('quote:lot', 'Lot')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    #{lot.number} - {formatCurrency(lot.price)}
                  </Typography>
                </Grid>
              )}
              {model && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('quote:model', 'Model')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {model.model} - {formatCurrency(model.price)}
                  </Typography>
                </Grid>
              )}
              {facade && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('quote:facade', 'Facade')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {facade.title} {facade.price > 0 ? `- ${formatCurrency(facade.price)}` : '(Included)'}
                  </Typography>
                </Grid>
              )}
              {options && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('quote:options', 'Options')}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip 
                      label={options.modelType === 'upgrade' ? t('quote:upgrade', 'Upgrade') : t('quote:basic', 'Basic')} 
                      size="small" 
                      color={options.modelType === 'upgrade' ? 'primary' : 'default'}
                    />
                    {options.hasBalcony && (
                      <Chip label={t('quote:balcony', 'Balcony')} size="small" color="success" />
                    )}
                    {!options.hasBalcony && (
                      <Chip label={t('quote:noBalcony', 'No Balcony')} size="small" variant="outlined" />
                    )}
                    {options.hasStorage && (
                      <Chip label={t('quote:storage', 'Storage')} size="small" color="warning" />
                    )}
                    {!options.hasStorage && (
                      <Chip label={t('quote:noStorage', 'No Storage')} size="small" variant="outlined" />
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {apartmentModel && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('quote:apartmentModel', 'Model')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {apartmentModel.name} ({apartmentModel.modelNumber})
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {apartmentModel.bedrooms} {t('quote:bedrooms', 'beds')} • {apartmentModel.bathrooms} {t('quote:bathrooms', 'baths')} • {apartmentModel.sqft} sqft
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:location', 'Location')}
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:apartmentNumber', 'Apt {{number}} - Floor {{floor}}', { number: apartmentNumber, floor: floorNumber })}
                </Typography>
              </Grid>
              {selectedRenderType && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('quote:renderType', 'Render Type')}
                  </Typography>
                  <Chip 
                    label={selectedRenderType === 'upgrade' ? t('quote:upgrade', 'Upgrade') : t('quote:basic', 'Basic')} 
                    size="small" 
                    color={selectedRenderType === 'upgrade' ? 'primary' : 'default'}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </Paper>

        {/* 🆕 ADJUSTMENTS SECTION (NUEVO - para catalog-config) */}
        {isProperty && breakdown?.adjustments && breakdown.adjustments.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${secondaryColor}33` }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon />
              {t('quote:customizations', 'Customizations')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={1.5}>
              {breakdown.adjustments.map((adjustment, idx) => (
                <React.Fragment key={idx}>
                  <Grid item xs={8}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckIcon sx={{ fontSize: 18, color: secondaryColor }} />
                      <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        {adjustment.label || adjustment.code}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4} textAlign="right">
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ 
                        fontFamily: '"Poppins", sans-serif', 
                        color: adjustment.amount >= 0 ? secondaryColor : warningColor 
                      }}
                    >
                      {adjustment.amount >= 0 ? '+' : ''}{formatCurrency(adjustment.amount)}
                    </Typography>
                  </Grid>
                </React.Fragment>
              ))}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={8}>
                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:totalCustomizations', 'Total Customizations')}
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="body2" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif', color: secondaryColor }}>
                  {formatCurrency(breakdown.adjustments.reduce((sum, adj) => sum + adj.amount, 0))}
                </Typography>
              </Grid>
            </Grid>
            
            {pricingConfig?.version && (
              <Box mt={2} p={1.5} bgcolor={`${secondaryColor}0A`} borderRadius={1} border={`1px dashed ${secondaryColor}66`}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:pricingVersion', 'Pricing Configuration Version')}: <Chip label={`v${pricingConfig.version}`} size="small" sx={{ ml: 1, height: 20 }} />
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* PRICE BREAKDOWN (only for properties) */}
        {isProperty && breakdown && (
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: primaryColor, fontFamily: '"Poppins", sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon />
              {t('quote:priceBreakdown', 'Price Breakdown')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:lotPrice', 'Lot Price')}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {formatCurrency(breakdown.lotPrice)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:modelBasePrice', 'Model Base Price')}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {formatCurrency(breakdown.modelBasePrice)}
                </Typography>
              </Grid>

              {breakdown.facadePrice > 0 && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {t('quote:facadePrice', 'Facade Price')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {formatCurrency(breakdown.facadePrice)}
                    </Typography>
                  </Grid>
                </>
              )}

              {breakdown.upgradePrice > 0 && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {t('quote:upgradePrice', 'Upgrade Price')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {formatCurrency(breakdown.upgradePrice)}
                    </Typography>
                  </Grid>
                </>
              )}

              {breakdown.balconyPrice > 0 && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {t('quote:balconyPrice', 'Balcony Price')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {formatCurrency(breakdown.balconyPrice)}
                    </Typography>
                  </Grid>
                </>
              )}

              {breakdown.storagePrice > 0 && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {t('quote:storagePrice', 'Storage Price')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {formatCurrency(breakdown.storagePrice)}
                    </Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('quote:total', 'Total')}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body1" fontWeight={700} sx={{ color: secondaryColor, fontFamily: '"Poppins", sans-serif' }}>
                  {formatCurrency(totals?.totalPrice || totals?.price)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: bgColor, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: secondaryColor,
            color: primaryColor,
            fontFamily: '"Poppins", sans-serif',
            '&:hover': {
              borderColor: secondaryColor,
              bgcolor: `${secondaryColor}14`
            }
          }}
        >
          {t('common:close', 'Close')}
        </Button>
        <Button
          onClick={() => {
            onClose()
            navigate('/login')
          }}
          variant="contained"
          sx={{
            bgcolor: primaryColor,
            fontFamily: '"Poppins", sans-serif',
            '&:hover': {
              bgcolor: secondaryColor
            }
          }}
        >
          {t('quote:signInToCreate', 'Sign In to Create Property')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuoteResultModal