// import { useState } from 'react'
// import { Box, Container } from '@mui/material'
// import { Add, Home } from '@mui/icons-material'
// import PageHeader from '@shared/components/PageHeader'
// import DataTable from '@shared/components/table/DataTable'
// import EmptyState from '@shared/components/table/EmptyState'
// import { useTheme } from '@mui/material/styles'
// import { usePropertyColumns } from '../Constants/Columns/properties'

// const mockProperties = [
//   {
//     _id: '1',
//     name: 'Property One',
//     status: 'active',
//     model: 'Model A',
//     resident: 'John Doe',
//     price: 120000,
//     phases: [
//       { constructionPercentage: 100 },
//       { constructionPercentage: 80 },
//       { constructionPercentage: 60 },
//       { constructionPercentage: 100 },
//       { constructionPercentage: 100 }
//     ]
//   },
//   {
//     _id: '2',
//     name: 'Property Two',
//     status: 'sold',
//     model: 'Model B',
//     resident: 'Jane Smith',
//     price: 150000,
//     phases: [
//       { constructionPercentage: 100 },
//       { constructionPercentage: 100 },
//       { constructionPercentage: 100 },
//       { constructionPercentage: 100 },
//       { constructionPercentage: 100 }
//     ]
//   }
// ]

// const Properties = () => {
//   const theme = useTheme()
//   const [data, setData] = useState(mockProperties)

//   const columns = usePropertyColumns({
//     isAdmin: true, // <-- Esto activa la columna de contracts
//     t: null, // Si tienes i18n pásalo aquí
//     onViewDetails: (row) => alert(`View details for ${row.name}`),
//     onEdit: null,
//     onDelete: (row) => alert(`Delete property ${row.name}`),
//     onOpenContracts: (row) => alert(`Manage contracts for ${row.name}`) // <-- Esta función para el botón de contracts
//   })

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
//       <Container maxWidth="xl">
//         <PageHeader
//           icon={Home}
//           title="Properties"
//           subtitle="Manage and view all properties"
//           actionButton={{
//             label: 'Add Property',
//             onClick: () => alert('Add property'),
//             icon: <Add />,
//             tooltip: 'Add new property'
//           }}
//         />

//         <DataTable
//           columns={columns}
//           data={data}
//           loading={false}
//           emptyState={
//             <EmptyState
//               icon={Home}
//               title="No properties"
//               description="There are no properties yet."
//               actionLabel="Add Property"
//               onAction={() => alert('Add property')}
//             />
//           }
//           stickyHeader
//           maxHeight={600}
//         />
//       </Container>
//     </Box>
//   )
// }

// export default Properties

import { useMemo } from 'react'
import { Box, Container } from '@mui/material'
import { Add, Home } from '@mui/icons-material'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { useTheme } from '@mui/material/styles'
import { usePropertyColumns } from '../Constants/Columns/properties'
import { useApartments } from '../Constants/hooks/useApartments'
import { useBuildings } from '../Constants/hooks/useBuildings'

const Properties = () => {
  const theme = useTheme()
  // Puedes pasar un buildingId si quieres filtrar por edificio, o dejarlo null para traer todos
  const { assigned, loading, error, refresh } = useApartments()
const { buildings, loading: loadingBuildings } = useBuildings()

// Crea un mapping de id a nombre
const buildingMap = useMemo(() => {
  const map = {}
  buildings?.forEach(b => { map[b._id] = b.name })
  return map
}, [buildings])

  // Adaptar los datos de apartamentos asignados al formato esperado por las columnas
  const data = useMemo(() => assigned.map(apto => ({
    _id: apto._id,
    name: `Apt ${apto.apartmentNumber} - Floor ${apto.floorNumber}`,
    building: buildingMap[apto.building] || 'N/A', // <--- Aquí
    status: apto.status,
    model: apto.apartmentModel?.name || 'N/A',
    resident: Array.isArray(apto.users) && apto.users.length > 0
      ? `${apto.users[0]?.firstName || ''} ${apto.users[0]?.lastName || ''}`.trim()
      : 'Unassigned',
    price: apto.price,
    phases: apto.phases || [],
    raw: apto
  })), [assigned, buildingMap])

  const columns = usePropertyColumns({
    isAdmin: true,
    t: null,
    onViewDetails: (row) => alert(`View details for ${row.name}`),
    onEdit: null,
    onDelete: (row) => alert(`Delete property ${row.name}`),
    onOpenContracts: (row) => alert(`Manage contracts for ${row.name}`)
  })

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title="Properties"
          subtitle="Manage and view all assigned apartments"
          actionButton={{
            label: 'Add Property',
            onClick: () => alert('Add property'),
            icon: <Add />,
            tooltip: 'Add new property'
          }}
        />

        <DataTable
          columns={columns}
          data={data}
          loading={loading || loadingBuildings}
          emptyState={
            <EmptyState
              icon={Home}
              title="No assigned apartments"
              description="There are no assigned apartments yet."
              actionLabel="Add Property"
              onAction={() => alert('Add property')}
            />
          }
          stickyHeader
          maxHeight={600}
        />
      </Container>
    </Box>
  )
}

export default Properties