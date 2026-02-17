import { Box, Container, Typography, Paper } from '@mui/material'
import AmenitiesMap from '../components/property/AmenitiesMap'
import { motion, AnimatePresence } from "framer-motion";
import {
  Add,
  Edit,
  Delete,
  Home,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Balcony,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon,
  PhotoLibrary,
  Bathtub,
  Bed,
  SquareFoot,
  Layers  
} from "@mui/icons-material";
import PageHeader from '../components/PageHeader';
const AmenitiesPrivate = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, p: 3 }}>
      {/* Header */}
<PageHeader
  icon={Home}
  title="Amenities Map"
  subtitle="Explore all premium amenities available in the community. Click on any point to view detailed photos and information."
/>

      {/* Map Component - Full Access */}
      <AmenitiesMap isPublicView={false} />
    </Container>
  )
}

export default AmenitiesPrivate
