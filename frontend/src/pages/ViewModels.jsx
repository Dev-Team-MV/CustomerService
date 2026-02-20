// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import {
//   Container, Grid, Typography, Box, Dialog
// } from '@mui/material'
// import api from '../services/api'
// import ModelCustomizationPanel from '../components/ModelCustomizationPanel'
// import PageHeader from '../components/PageHeader'
// import { CompareArrows } from '@mui/icons-material'
// import ViewModelCard from '../components/models/ViewModelCard'

// // Asignación manual de imágenes por ID de modelo
// const modelImages = {
//   "6977c7bbd1f24768968719de": "/images/models/260207_001_0010_ISOMETRIA_4-removebg-preview (1) (1).png",
//   "6977c3e7d1f247689687194a": "/images/models/260721_001_0010_ISOMETRIA_3-2-removebg-preview.png",
//   "6977c547d1f2476896871969": "/images/models/251229_001_0900_EXT_ISOMETRICO1-removebg-preview (1).png",
// };

// const ViewModels = () => {
//   const [models, setModels] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selected, setSelected] = useState([])
//   const [compareOpen, setCompareOpen] = useState(false)
//   const navigate = useNavigate()

//   useEffect(() => {
//     api.get('/models').then(res => {
//       setModels(res.data)
//       setLoading(false)
//     })
//   }, [])

//   const handleSelect = (id) => {
//     setSelected(prev => {
//       if (prev.includes(id)) return prev.filter(x => x !== id)
//       if (prev.length < 2) return [...prev, id]
//       return prev
//     })
//   }

//   const handleCompare = () => {
//     setCompareOpen(true)
//   }

//     useEffect(() => {
//     console.log('moddelos seleccionados', selected)
//   }, [selected])

//   const compareModels = models.filter(m => selected.includes(m._id))

//   const MODEL_10_ID = "6977c7bbd1f24768968719de"
//   const isModel10 = compareModels.some(m => m._id === MODEL_10_ID)

//   const labels = isModel10
//     ? {
//         balcony: "Study",
//         baseTitle: "With Comedor",
//         compareTitle: "With Study"
//       }
//     : {}

//   // Opciones iniciales (puedes tenerlas en tu estado o lógica)
//   const initialOptions = { upgrade: false, balcony: false, storage: false }
//   const compareOptions = { upgrade: true, balcony: false, storage: true }

//   if (loading) return <Box p={6} textAlign="center"><Typography>Loading models...</Typography></Box>

//   return (
//     <Container maxWidth="xl" sx={{ p: 4 }}>
//       <PageHeader
//         icon={CompareArrows}
//         title="All Models"
//         subtitle="Browse and compare all available property models"
//         actionButton={{
//           label: "Compare Selected",
//           onClick: handleCompare,
//           icon: <CompareArrows />,
//           tooltip: "Select 2 models to compare",
//           disabled: selected.length !== 2
//         }}
//       />
//       <Typography variant="caption" sx={{ ml: 2, color: '#6c757d', mb: 4, display: 'block' }}>
//         Select 2 models to compare
//       </Typography>

//       <Grid 
//         container 
//         spacing={3}
//         sx={{ 
//           pt: { xs: 12, sm: 15, md: 20 },
//           rowGap: { xs: 15, sm: 12, md: 8 },
//           display: 'flex',
//           justifyContent: 'space-around',
//         }}
//       >
//         {models.map((model) => (
//           <Grid item xs={12} sm={6} md={6} lg={4} key={model._id}>
//             <ViewModelCard
//               model={model}
//               onGoDetail={(id) => navigate(`/models/${id}`)}
//               selected={selected.includes(model._id)}
//               onSelect={handleSelect}
//               imgSrc={modelImages[model._id] || '/no-image.png'}
//             />
//           </Grid>
//         ))}
//       </Grid>

//       <Dialog 
//         open={compareOpen} 
//         onClose={() => setCompareOpen(false)} 
//         maxWidth="xl"
//         PaperProps={{
//           sx: {
//             borderRadius: 4,
//             boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
//           }
//         }}
//       >
//         {compareModels.length === 2 && (
//           <ModelCustomizationPanel
//             model={compareModels[0]}
//             compareModel={compareModels[1]}
//             initialOptions={initialOptions}
//             compareOptions={compareOptions}
//             labels={labels}
//             onConfirm={result => {
//               // result contiene ambos modelos y sus opciones
//               console.log(result)
//             }}
//           />
//         )}
//       </Dialog>
//     </Container>
//   )
// }

// export default ViewModels

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Grid, Typography, Box, Dialog, IconButton
} from '@mui/material'
import { Close } from '@mui/icons-material'
import api from '../services/api'
import ModelCustomizationCore from '../components/models/Customization/ModelCustomizationCore'
import PageHeader from '../components/PageHeader'
import { CompareArrows } from '@mui/icons-material'
import ViewModelCard from '../components/models/ViewModelCard'

// Asignación manual de imágenes por ID de modelo
const modelImages = {
  "6977c7bbd1f24768968719de": "/images/models/260207_001_0010_ISOMETRIA_4-removebg-preview (1) (1).png",
  "6977c3e7d1f247689687194a": "/images/models/260721_001_0010_ISOMETRIA_3-2-removebg-preview.png",
  "6977c547d1f2476896871969": "/images/models/251229_001_0900_EXT_ISOMETRICO1-removebg-preview (1).png",
};

const ViewModels = () => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/models').then(res => {
      setModels(res.data)
      setLoading(false)
    })
  }, [])

  const handleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length < 2) return [...prev, id]
      return prev
    })
  }

  const handleCompare = () => {
    setCompareOpen(true)
  }

  useEffect(() => {
    console.log('modelos seleccionados', selected)
  }, [selected])

  const compareModels = models.filter(m => selected.includes(m._id))

  const MODEL_10_ID = "6977c7bbd1f24768968719de"
  const isModel10 = compareModels.some(m => m._id === MODEL_10_ID)

  const labels = isModel10
    ? {
        balcony: "Study",
        baseTitle: "With Comedor",
        compareTitle: "With Study"
      }
    : {}

  // Opciones iniciales
  const initialOptions = { upgrade: false, balcony: false, storage: false }
  const compareInitialOptions = { upgrade: false, balcony: false, storage: false }

  if (loading) return <Box p={6} textAlign="center"><Typography>Loading models...</Typography></Box>

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <PageHeader
        icon={CompareArrows}
        title="All Models"
        subtitle="Browse and compare all available property models"
        actionButton={{
          label: "Compare Selected",
          onClick: handleCompare,
          icon: <CompareArrows />,
          tooltip: "Select 2 models to compare",
          disabled: selected.length !== 2
        }}
      />
      <Typography variant="caption" sx={{ ml: 2, color: '#6c757d', mb: 4, display: 'block' }}>
        Select 2 models to compare
      </Typography>

      <Grid 
        container 
        spacing={3}
        sx={{ 
          pt: { xs: 12, sm: 15, md: 20 },
          rowGap: { xs: 15, sm: 12, md: 8 },
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {models.map((model) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={model._id}>
            <ViewModelCard
              model={model}
              onGoDetail={(id) => navigate(`/models/${id}`)}
              selected={selected.includes(model._id)}
              onSelect={handleSelect}
              imgSrc={modelImages[model._id] || '/no-image.png'}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={compareOpen} 
        onClose={() => setCompareOpen(false)} 
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            height: '90vh',
            m: 2
          }
        }}
      >
        <IconButton
          onClick={() => setCompareOpen(false)}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': {
              bgcolor: 'white',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Close />
        </IconButton>
        {compareModels.length === 2 && (
          <ModelCustomizationCore
            model={compareModels[0]}
            compareModel={compareModels[1]}
            initialOptions={initialOptions}
            compareInitialOptions={compareInitialOptions}
            labels={labels}
            confirmLabel="Confirm Comparison"
            onConfirm={result => {
              console.log('Comparison result:', result)
              setCompareOpen(false)
              // Aquí puedes hacer lo que necesites con el resultado
            }}
          />
        )}
      </Dialog>
    </Container>
  )
}

export default ViewModels