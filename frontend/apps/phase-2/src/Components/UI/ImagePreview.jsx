import { Box, Card, CardMedia, CardActionArea, Dialog, Typography } from '@mui/material'
import { useState } from 'react'

const ImagePreview = ({ images = [], height = 220 }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)

  if (!images.length) return null

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 3,
          width: '100%',
        }}
      >
        {images.map((url, idx) => (
          <Card
            key={idx}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: theme => `1px solid ${theme.palette.cardBorder}`,
              overflow: 'hidden',
              width: '100%',
              minWidth: 220,
              bgcolor: '#fafbfc'
            }}
          >
            <CardActionArea onClick={() => { setSelected(idx); setOpen(true) }}>
              <CardMedia
                component="img"
                image={url}
                alt={`Preview ${idx + 1}`}
                sx={{
                  width: '100%',
                  height: height,
                  objectFit: 'contain',
                  bgcolor: '#fff'
                }}
              />
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
                  {`Image ${idx + 1}`}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <CardMedia
          component="img"
          image={images[selected]}
          alt={`Preview ${selected + 1}`}
          sx={{ maxHeight: '80vh', objectFit: 'contain', bgcolor: '#111' }}
        />
      </Dialog>
    </>
  )
}

export default ImagePreview