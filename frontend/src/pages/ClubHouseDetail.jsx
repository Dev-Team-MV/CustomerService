import GalleryCarrousel from "../components/GalleryCarrousel";
import AmenitiesMap from "../components/property/AmenitiesMap";
import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";

const urls = [
  'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/02/251106_0100_37-AEREAS.png',
  'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/02/251106_0100_44-PEATONAL-CLUB-HOUSE.png',
  'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/02/251106_0100_35-AEREAS.png',
  'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/02/251106_0100_36-AEREAS.png',
  'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/02/251106_0100_46-PEATONAL-CLUB-HOUSE.png',
  'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/02/251106_0100_33-AEREAS.png',
  'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/02/251106_0100_45-PEATONAL-CLUB-HOUSE.png'
  
]

const exteriorUrls = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80'
]

const interiorUrls = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'
]

const heroVideoUrl = 'https://www.youtube.com/embed/Zgdg2lwQ-Cw?si=7wPgne0EgoEzSext'

const ClubHouseDetail = () => {

  return (
    <>
        {/* Hero Video */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: '40vh', sm: '45vh', md: '50vh' },
            overflow: 'hidden'
          }}
        >
          <iframe
            src={`${heroVideoUrl}&autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
            title="Hero video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            frameBorder="0"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '177.78vh',
              height: '56.25vw',
              minWidth: '100%',
              minHeight: '100%',
              border: 'none',
              pointerEvents: 'none'
            }}
          />
        </Box>

        {/* ClubHouse image — overlapping hero and next section */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: '-110px', sm: '-140px', md: '-380px' },
            mb: { xs: '-110px', sm: '-140px', md: '-180px' },
            pointerEvents: 'none'
          }}
        >
          <Box
            component={motion.img}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            src="/images/ClubHouse.png"
            alt="Club House"
            sx={{
              width: { xs: 220, sm: 320, md: 770 },
              height: 'auto',
              filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.5)) drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
            }}
          />
        </Box>

        {/* Gallery Section — 2 columns */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 4, md: 6 },
            px: { xs: 3, sm: 5, md: 8 },
            py: { xs: 6, md: 10 }
          }}
        >
          {/* Text Column */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            sx={{
              flex: 1,
              minWidth: 0,
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                mb: 2,
                color: '#1a1a1a'
              }}
            >
              The Club House
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                color: '#555',
                lineHeight: 1.8,
                mb: 3
              }}
            >
              A place where leisure meets luxury. Our Club House offers a wide range of amenities
              designed for the whole family — from a stunning infinity pool and fully equipped gym
              to cozy lounge areas and event spaces. Whether you're hosting a weekend barbecue,
              enjoying a sunset by the lake, or staying active with friends, every moment here
              is crafted for an exceptional lifestyle.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: '#888',
                fontStyle: 'italic'
              }}
            >
              Lakewood Oaks on Lake Conroe — Where every day feels like a getaway.
            </Typography>
          </Box>

          {/* Gallery Column */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              height: { xs: 300, sm: 350, md: 420 }
            }}
          >
            <GalleryCarrousel images={urls} autoPlay />
          </Box>
        </Box>

        {/* Interior Amenities Section — 2 columns */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: { xs: 4, md: 6 },
            px: { xs: 3, sm: 5, md: 8 },
            py: { xs: 6, md: 10 },
            bgcolor: '#f8f9fa'
          }}
        >
          {/* Map Column */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            sx={{
              flex: { xs: 1, md: '0 0 62%' },
              minWidth: 0,
              width: '100%'
            }}
          >
            <AmenitiesMap />
          </Box>

          {/* Text Column */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            sx={{
              flex: { xs: 1, md: '0 0 35%' },
              minWidth: 0,
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                mb: 2,
                color: '#1a1a1a'
              }}
            >
              Interior Amenities
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                color: '#555',
                lineHeight: 1.8,
                mb: 3
              }}
            >
              Step inside and discover a world of comfort and entertainment. 
              Our Club House features thoughtfully designed spaces for work, play, 
              and relaxation — all under one roof. Tap on any point in the map to explore each area.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}
            >
              {[
                'Reception', 'Manager Office', 'Conference Room', 'Multi-Purpose',
                'Bar', 'Lounge', 'Coworking', 'Game Room', 'Golf Simulator',
                'Terrace', 'Gym', 'Bathrooms', 'Laundry', 'Counter', 'Catering', 'Mural'
              ].map((name) => (
                <Chip
                  key={name}
                  label={name}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#ccc',
                    color: '#444',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: '#e8e8e8' }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
        
    </>
  );
};

export default ClubHouseDetail;
