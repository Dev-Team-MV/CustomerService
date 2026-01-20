// import { Box, Paper, Typography, Card, CardContent, CardMedia, Chip, IconButton } from '@mui/material'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import HotelIcon from '@mui/icons-material/Hotel'
// import BathtubIcon from '@mui/icons-material/Bathtub'
// import SquareFootIcon from '@mui/icons-material/SquareFoot'
// import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import { useProperty } from '../../context/PropertyContext'

// const ModelSelector = () => {
//   const { models, selectedModel, selectModel } = useProperty()

//   const handleModelClick = (model) => {
//     selectModel(model)
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
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
//           02 SELECCIÓN DE MODELO
//         </Typography>
//         <Typography variant="caption" sx={{ color: '#4a7c59', fontWeight: 'bold' }}>
//           {models.length} OPTIONS
//         </Typography>
//       </Box>

//       <Box 
//         sx={{ 
//           display: 'flex', 
//           gap: { xs: 2, sm: 3 },
//           overflowX: 'auto', 
//           pb: 2,
//           pt: 2,
//           scrollbarWidth: 'thin',
//           '&::-webkit-scrollbar': { height: 6 },
//           '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 3 }
//         }}
//       >
//         {models.map((model) => (
//           <Card
//             key={model._id}
//             onClick={() => handleModelClick(model)}
//             sx={{
//               minWidth: { xs: 220, sm: 260, md: 300 },
//               maxWidth: { xs: 260, sm: 280, md: 320 },
//               flexShrink: 0,
//               cursor: 'pointer',
//               bgcolor: selectedModel?._id === model._id ? '#e8f5e9' : '#fff',
//               border: selectedModel?._id === model._id ? '2px solid #4a7c59' : '1px solid #e0e0e0',
//               borderRadius: { xs: 2, sm: 3 },
//               transition: 'all 0.3s ease',
//               position: 'relative',
//               '&:hover': {
//                 transform: 'translateY(-4px)',
//                 boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
//               }
//             }}
//           >
//             {selectedModel?._id === model._id && (
//               <Chip
//                 label="SELECTED"
//                 size="small"
//                 color="success"
//                 icon={<CheckCircleIcon />}
//                 sx={{
//                   position: 'absolute',
//                   top: { xs: 8, sm: 12 },
//                   right: { xs: 8, sm: 12 },
//                   zIndex: 2,
//                   fontWeight: 'bold',
//                   fontSize: { xs: '0.7rem', sm: '0.8rem' },
//                   height: { xs: 22, sm: 26 }
//                 }}
//               />
//             )}

//             <CardMedia
//               component="img"
//               height="140"
//               image={model.image || `https://via.placeholder.com/400x300?text=Model+${model.modelNumber}`}
//               alt={`Model ${model.modelNumber}`}
//               sx={{ borderBottom: '1px solid #eee', objectFit: 'cover' }}
//             />
            
//             <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
//               <Box sx={{ 
//                 display: 'flex', 
//                 justifyContent: 'space-between', 
//                 alignItems: 'flex-start', 
//                 mb: 1,
//                 gap: 1
//               }}>
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                   <Typography 
//                     variant="h6" 
//                     sx={{ 
//                       fontWeight: 'bold', 
//                       mb: 0.5,
//                       fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
//                       overflow: 'hidden',
//                       textOverflow: 'ellipsis',
//                       whiteSpace: 'nowrap'
//                     }}
//                   >
//                     {model.model || `Model ${model.modelNumber}`}
//                   </Typography>
//                   <Typography 
//                     variant="caption" 
//                     color="text.secondary"
//                     sx={{ 
//                       fontSize: { xs: '0.7rem', sm: '0.75rem' },
//                       display: 'block'
//                     }}
//                   >
//                     Starting at ${model.price?.toLocaleString()}
//                   </Typography>
//                 </Box>
//                 <Typography 
//                   variant="subtitle1" 
//                   sx={{ 
//                     color: '#4a7c59', 
//                     fontWeight: 'bold',
//                     fontSize: { xs: '0.9rem', sm: '1rem' },
//                     flexShrink: 0
//                   }}
//                 >
//                   ${(model.price / 1000).toFixed(0)}K
//                 </Typography>
//               </Box>

//               <Box sx={{ 
//                 display: 'flex', 
//                 gap: { xs: 1, sm: 1.5, md: 2 },
//                 mt: { xs: 1.5, sm: 2 },
//                 flexWrap: 'wrap'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <HotelIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
//                   <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                     {model.bedrooms} Beds
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <BathtubIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
//                   <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                     {model.bathrooms} Baths
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <SquareFootIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
//                   <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                     {model.sqft.toLocaleString()} ft²
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         ))}
        
//         {/* Placeholder for "More" */}
//         <Box 
//           sx={{ 
//             minWidth: { xs: 80, sm: 100 },
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center',
//             bgcolor: '#f9f9f9',
//             borderRadius: { xs: 2, sm: 3 },
//             border: '1px dashed #ddd'
//           }}
//         >
//           <IconButton 
//             sx={{ 
//               bgcolor: '#fff', 
//               boxShadow: 1,
//               width: { xs: 36, sm: 40 },
//               height: { xs: 36, sm: 40 }
//             }}
//           >
//             <ChevronRightIcon fontSize="small" />
//           </IconButton>
//         </Box>
//       </Box>
//     </Paper>
//   )
// }

// export default ModelSelector

import { Box, Paper, Typography, Card, CardContent, CardMedia, Chip, IconButton } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HotelIcon from '@mui/icons-material/Hotel'
import BathtubIcon from '@mui/icons-material/Bathtub'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useProperty } from '../../context/PropertyContext'

const ModelSelector = () => {
  const { models, selectedModel, selectModel } = useProperty()

  const handleModelClick = (model) => {
    selectModel(model)
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        color: '#000',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
          02 MODEL SELECTION
        </Typography>
        <Typography variant="caption" sx={{ color: '#4a7c59', fontWeight: 'bold' }}>
          {models.length} OPTIONS
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 3 },
          overflowX: 'auto', 
          pb: 2,
          pt: 2,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 3 }
        }}
      >
        {models.map((model) => (
          <Card
            key={model._id}
            onClick={() => handleModelClick(model)}
            sx={{
              minWidth: { xs: 220, sm: 260, md: 300 },
              maxWidth: { xs: 260, sm: 280, md: 320 },
              flexShrink: 0,
              cursor: 'pointer',
              bgcolor: selectedModel?._id === model._id ? '#e8f5e9' : '#fff',
              border: selectedModel?._id === model._id ? '2px solid #4a7c59' : '1px solid #e0e0e0',
              borderRadius: { xs: 2, sm: 3 },
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}
          >
            {selectedModel?._id === model._id && (
              <Chip
                label="SELECTED"
                size="small"
                color="success"
                icon={<CheckCircleIcon />}
                sx={{
                  position: 'absolute',
                  top: { xs: 8, sm: 12 },
                  right: { xs: 8, sm: 12 },
                  zIndex: 2,
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  height: { xs: 22, sm: 26 }
                }}
              />
            )}

            <CardMedia
              component="img"
              height="140"
              image={model.image || `https://via.placeholder.com/400x300?text=Model+${model.modelNumber}`}
              alt={`Model ${model.modelNumber}`}
              sx={{ borderBottom: '1px solid #eee', objectFit: 'cover' }}
            />
            
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                mb: 1,
                gap: 1
              }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 0.5,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {model.model || `Model ${model.modelNumber}`}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      display: 'block'
                    }}
                  >
                    Starting at ${model.price?.toLocaleString()}
                  </Typography>
                </Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#4a7c59', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    flexShrink: 0
                  }}
                >
                  ${(model.price / 1000).toFixed(0)}K
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 1.5, md: 2 },
                mt: { xs: 1.5, sm: 2 },
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HotelIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {model.bedrooms} Beds
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BathtubIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {model.bathrooms} Baths
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SquareFootIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {model.sqft.toLocaleString()} ft²
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
        
        {/* Placeholder for "More" */}
        <Box 
          sx={{ 
            minWidth: { xs: 80, sm: 100 },
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: '#f9f9f9',
            borderRadius: { xs: 2, sm: 3 },
            border: '1px dashed #ddd'
          }}
        >
          <IconButton 
            sx={{ 
              bgcolor: '#fff', 
              boxShadow: 1,
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 }
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default ModelSelector