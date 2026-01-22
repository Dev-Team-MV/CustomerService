// import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider } from '@mui/material'
// import { useProperty } from '../../context/PropertyContext'
// import { useAuth } from '../../context/AuthContext'
// import { useState } from 'react'
// import SendIcon from '@mui/icons-material/Send'
// import HomeIcon from '@mui/icons-material/Home'

// const PriceCalculator = ({ onCreatePropertyClick }) => {
//   const { financials, updateFinancials, selectedLot, selectedModel, selectedFacade } = useProperty()
//   const { isAuthenticated } = useAuth()
//   const [initialPaymentDate, setInitialPaymentDate] = useState('')

//   const handleDiscountPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ discountPercent: value })
//   }

//   const handleDownPaymentPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ downPaymentPercent: value })
//   }

//   const handleInitialDownPaymentPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ initialDownPaymentPercent: value })
//   }

//   const handleMonthlyPaymentPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ monthlyPaymentPercent: value })
//   }

//   const handleCreateProperty = () => {
//     if (!selectedLot || !selectedModel) {
//       alert('Please complete your selection (Lot and Model)')
//       return
//     }

//     if (!isAuthenticated) {
//       alert('Please log in to create properties')
//       return
//     }

//     // Trigger parent callback to expand ResidentAssignment
//     onCreatePropertyClick()
//   }

//   const handleSendQuote = () => {
//     if (!selectedLot || !selectedModel) {
//       alert('Please complete your selection (Lot and Model)')
//       return
//     }

//     if (!isAuthenticated) {
//       alert('Please log in to send quotes')
//       return
//     }

//     alert('Quote functionality coming soon!')
//   }

//   return (
//     <Paper 
//       elevation={2} 
//       sx={{ 
//         p: 3, 
//         bgcolor: '#fff', 
//         color: '#000',
//         borderRadius: 2,
//         border: '1px solid #e0e0e0'
//       }}
//     >
//       <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
//         CALCULATOR
//       </Typography>

//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
//         {/* List Price - Calculated automatically */}
//         <CalcField 
//           label="List Price Phase I" 
//           value={financials.listPrice.toFixed(2)} 
//           disabled
//           prefix="$"
//           suffix="USD"
//         />

//         {/* Selection Summary */}
//         <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: '0.75rem' }}>
//           <Typography variant="caption" display="block" color="text.secondary">
//             Lot: {selectedLot ? `#${selectedLot.number} - $${selectedLot.price?.toLocaleString()}` : 'Not selected'}
//           </Typography>
//           <Typography variant="caption" display="block" color="text.secondary">
//             Model: {selectedModel ? `${selectedModel.model} - $${selectedModel.price?.toLocaleString()}` : 'Not selected'}
//           </Typography>
//           <Typography variant="caption" display="block" color="text.secondary">
//             Facade: {selectedFacade 
//               ? `${selectedFacade.title} - ${selectedFacade.price > 0 ? `+$${selectedFacade.price?.toLocaleString()}` : 'Included'}`
//               : 'Not selected'}
//           </Typography>
//         </Box>

//         <Divider />

//         {/* Discount Section */}
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Box sx={{ flex: 1 }}>
//             <CalcField 
//               label="Discount" 
//               value={financials.discountPercent} 
//               onChange={handleDiscountPercentChange}
//               suffix="%"
//             />
//           </Box>
//           <Box sx={{ flex: 1.5 }}>
//             <CalcField 
//               label="Amount" 
//               value={financials.discount.toFixed(2)} 
//               disabled
//               prefix="$"
//             />
//           </Box>
//         </Box>

//         <Divider />

//         {/* Presale Price Highlight */}
//         <Box sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: 2, border: '1px solid #dcedc8', textAlign: 'center' }}>
//           <Typography variant="caption" sx={{ color: '#558b2f', fontWeight: 'bold' }}>PRESALE PRICE TODAY</Typography>
//           <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
//             ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//           </Typography>
//         </Box>

//         <Divider />

//         {/* Down Payment Section */}
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Box sx={{ flex: 1 }}>
//             <CalcField 
//               label="Down Payment" 
//               value={financials.downPaymentPercent} 
//               onChange={handleDownPaymentPercentChange}
//               suffix="%"
//             />
//           </Box>
//           <Box sx={{ flex: 1.5 }}>
//             <CalcField 
//               label="Total DP" 
//               value={financials.totalDownPayment.toFixed(2)} 
//               disabled
//               prefix="$"
//             />
//           </Box>
//         </Box>

//         {/* Initial DP and Date */}
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Box sx={{ flex: 1 }}>
//             <CalcField 
//               label="Initial DP" 
//               value={financials.initialDownPaymentPercent} 
//               onChange={handleInitialDownPaymentPercentChange}
//               suffix="%"
//             />
//           </Box>
//           <Box sx={{ flex: 1.5 }}>
//             <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
//               Payment Date
//             </Typography>
//             <TextField
//               fullWidth
//               size="small"
//               type="date"
//               value={initialPaymentDate}
//               onChange={(e) => setInitialPaymentDate(e.target.value)}
//               InputLabelProps={{ shrink: true }}
//               sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
//             />
//           </Box>
//         </Box>

//         <CalcField 
//           label="Initial Amount" 
//           value={financials.initialDownPayment.toFixed(2)} 
//           disabled
//           prefix="$"
//         />

//         <Divider />

//         {/* Monthly Payment and Mortgage */}
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Box sx={{ flex: 1 }}>
//             <CalcField 
//               label="Monthly %" 
//               value={financials.monthlyPaymentPercent} 
//               onChange={handleMonthlyPaymentPercentChange}
//               suffix="%"
//             />
//           </Box>
//           <Box sx={{ flex: 1.5 }}>
//             <CalcField 
//               label="Monthly Amount" 
//               value={financials.monthlyPayment.toFixed(2)} 
//               disabled
//               prefix="$"
//             />
//           </Box>
//         </Box>

//         <CalcField 
//           label="Mortgage Remaining" 
//           value={financials.mortgage.toFixed(2)} 
//           disabled
//           prefix="$"
//         />

//         {/* Note */}
//         <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
//           * Every 10 houses sold, the discount is reduced by 2%
//         </Typography>

//         {/* Action Buttons */}
//         <Button
//           variant="outlined"
//           fullWidth
//           onClick={handleCreateProperty}
//           startIcon={<HomeIcon />}
//           disabled={!selectedLot || !selectedModel}
//           sx={{
//             borderColor: '#4a7c59',
//             color: '#4a7c59',
//             py: 1.5,
//             borderRadius: 3,
//             fontWeight: 'bold',
//             textTransform: 'none',
//             fontSize: '1rem',
//             '&:hover': {
//               borderColor: '#3d664a',
//               bgcolor: 'rgba(74, 124, 89, 0.04)'
//             },
//             '&:disabled': {
//               borderColor: '#ccc',
//               color: '#999'
//             }
//           }}
//         >
//           Create Property
//         </Button>

//         <Button
//           variant="contained"
//           fullWidth
//           onClick={handleSendQuote}
//           startIcon={<SendIcon />}
//           disabled={!selectedLot || !selectedModel}
//           sx={{
//             bgcolor: '#4a7c59',
//             color: '#fff',
//             py: 1.5,
//             borderRadius: 3,
//             fontWeight: 'bold',
//             textTransform: 'none',
//             fontSize: '1rem',
//             boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
//             '&:hover': {
//               bgcolor: '#3d664a',
//               boxShadow: '0 6px 16px rgba(74, 124, 89, 0.4)'
//             },
//             '&:disabled': {
//               bgcolor: '#ccc',
//               color: '#666'
//             }
//           }}
//         >
//           Generate & Send Quote
//         </Button>
//       </Box>
//     </Paper>
//   )
// }

// const CalcField = ({ label, value, onChange, prefix, suffix, disabled = false }) => (
//   <Box>
//     <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
//       {label}
//     </Typography>
//     <TextField
//       fullWidth
//       size="small"
//       type={disabled ? "text" : "number"}
//       value={value}
//       onChange={onChange}
//       disabled={disabled}
//       InputProps={{
//         startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
//         endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
//         sx: { borderRadius: 2, bgcolor: disabled ? '#f9f9f9' : '#fff' }
//       }}
//     />
//   </Box>
// )

// export default PriceCalculator

import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider, Chip } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'

const PriceCalculator = ({ onCreatePropertyClick }) => {
  const { 
    financials, 
    updateFinancials, 
    selectedLot, 
    selectedModel, 
    selectedFacade,
    options, // ✅ Obtener las opciones
    selectedPricingOption, // ✅ Obtener la opción seleccionada
    getModelPricingInfo // ✅ Obtener info del modelo
  } = useProperty()
  const { isAuthenticated } = useAuth()
  const [initialPaymentDate, setInitialPaymentDate] = useState('')

  const handleDiscountPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ discountPercent: value })
  }

  const handleDownPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ downPaymentPercent: value })
  }

  const handleInitialDownPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ initialDownPaymentPercent: value })
  }

  const handleMonthlyPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ monthlyPaymentPercent: value })
  }

  const handleCreateProperty = () => {
    if (!selectedLot || !selectedModel) {
      alert('Please complete your selection (Lot and Model)')
      return
    }

    if (!isAuthenticated) {
      alert('Please log in to create properties')
      return
    }

    onCreatePropertyClick()
  }

  const handleSendQuote = () => {
    if (!selectedLot || !selectedModel) {
      alert('Please complete your selection (Lot and Model)')
      return
    }

    if (!isAuthenticated) {
      alert('Please log in to send quotes')
      return
    }

    alert('Quote functionality coming soon!')
  }

  // ✅ Obtener información de pricing
  const pricingInfo = getModelPricingInfo()

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        color: '#000',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        maxWidth: '100%', // ✅ No exceder
        boxSizing: 'border-box' // ✅ Importante
      }}
    >
      <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
        CALCULATOR
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* List Price - Calculated automatically */}
        <CalcField 
          label="List Price Phase I" 
          value={financials.listPrice.toFixed(2)} 
          disabled
          prefix="$"
          suffix="USD"
        />

        {/* Selection Summary */}
        <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: '0.75rem' }}>
          <Typography variant="caption" display="block" color="text.secondary">
            Lot: {selectedLot ? `#${selectedLot.number} - $${selectedLot.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Model: {selectedModel ? `${selectedModel.model} - $${selectedModel.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          
          {/* ✅ Mostrar opciones seleccionadas */}
          {selectedModel && pricingInfo && (
            <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
              {options.upgrade && pricingInfo.hasUpgrade && (
                <Chip 
                  label={`Upgrade +$${pricingInfo.upgradePrice.toLocaleString()}`}
                  size="small"
                  color="secondary"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {options.balcony && pricingInfo.hasBalcony && (
                <Chip 
                  label={`Balcony +$${pricingInfo.balconyPrice.toLocaleString()}`}
                  size="small"
                  color="info"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {options.storage && pricingInfo.hasStorage && (
                <Chip 
                  label={`Storage +$${pricingInfo.storagePrice.toLocaleString()}`}
                  size="small"
                  color="success"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          )}
          
          <Typography variant="caption" display="block" color="text.secondary" mt={1}>
            Facade: {selectedFacade 
              ? `${selectedFacade.title} - ${selectedFacade.price > 0 ? `+$${selectedFacade.price?.toLocaleString()}` : 'Included'}`
              : 'Not selected'}
          </Typography>
          
          {/* ✅ Mostrar configuración seleccionada si existe */}
          {selectedPricingOption && (
            <Box mt={1} p={1} bgcolor="primary.50" borderRadius={1}>
              <Typography variant="caption" fontWeight="bold" color="primary">
                {selectedPricingOption.label}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Discount Section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Discount" 
              value={financials.discountPercent} 
              onChange={handleDiscountPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Amount" 
              value={financials.discount.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        <Divider />

        {/* Presale Price Highlight */}
        <Box sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: 2, border: '1px solid #dcedc8', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#558b2f', fontWeight: 'bold' }}>PRESALE PRICE TODAY</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Divider />

        {/* Down Payment Section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Down Payment" 
              value={financials.downPaymentPercent} 
              onChange={handleDownPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Total DP" 
              value={financials.totalDownPayment.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        {/* Initial DP and Date */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Initial DP" 
              value={financials.initialDownPaymentPercent} 
              onChange={handleInitialDownPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
              Payment Date
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={initialPaymentDate}
              onChange={(e) => setInitialPaymentDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <CalcField 
          label="Initial Amount" 
          value={financials.initialDownPayment.toFixed(2)} 
          disabled
          prefix="$"
        />

        <Divider />

        {/* Monthly Payment and Mortgage */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Monthly %" 
              value={financials.monthlyPaymentPercent} 
              onChange={handleMonthlyPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Monthly Amount" 
              value={financials.monthlyPayment.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        <CalcField 
          label="Mortgage Remaining" 
          value={financials.mortgage.toFixed(2)} 
          disabled
          prefix="$"
        />

        {/* Note */}
        <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
          * Every 10 houses sold, the discount is reduced by 2%
        </Typography>

        {/* Action Buttons */}
        <Button
          variant="outlined"
          fullWidth
          onClick={handleCreateProperty}
          startIcon={<HomeIcon />}
          disabled={!selectedLot || !selectedModel}
          sx={{
            borderColor: '#4a7c59',
            color: '#4a7c59',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              borderColor: '#3d664a',
              bgcolor: 'rgba(74, 124, 89, 0.04)'
            },
            '&:disabled': {
              borderColor: '#ccc',
              color: '#999'
            }
          }}
        >
          Create Property
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSendQuote}
          startIcon={<SendIcon />}
          disabled={!selectedLot || !selectedModel}
          sx={{
            bgcolor: '#4a7c59',
            color: '#fff',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
            '&:hover': {
              bgcolor: '#3d664a',
              boxShadow: '0 6px 16px rgba(74, 124, 89, 0.4)'
            },
            '&:disabled': {
              bgcolor: '#ccc',
              color: '#666'
            }
          }}
        >
          Generate & Send Quote
        </Button>
      </Box>
    </Paper>
  )
}

const CalcField = ({ label, value, onChange, prefix, suffix, disabled = false }) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
      {label}
    </Typography>
    <TextField
      fullWidth
      size="small"
      type={disabled ? "text" : "number"}
      value={value}
      onChange={onChange}
      disabled={disabled}
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
        sx: { borderRadius: 2, bgcolor: disabled ? '#f9f9f9' : '#fff' }
      }}
    />
  </Box>
)

export default PriceCalculator