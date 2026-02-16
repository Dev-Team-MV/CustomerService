import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, Keyboard } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// ---------------------------------------------------------------------------
// Lightweight sync bus — instances sharing the same `syncGroup` stay in sync
// ---------------------------------------------------------------------------
const syncBus = (() => {
  const listeners = {}
  const on = (group, cb) => {
    if (!listeners[group]) listeners[group] = new Set()
    listeners[group].add(cb)
    return () => listeners[group]?.delete(cb)
  }
  const emit = (group, index, sender) => {
    listeners[group]?.forEach((cb) => cb(index, sender))
  }
  return { on, emit }
})()

// ---------------------------------------------------------------------------
// GalleryCarrousel
// ---------------------------------------------------------------------------
const GalleryCarrousel = ({
  images = [],
  autoPlay = false,
  autoPlayInterval = 4000,
  showPagination = true,
  showArrows = true,
  syncGroup = null,
  borderRadius = 8,
  objectFit = 'cover',
  startIndex = 0,
  onIndexChange = null,
  className = '',
  watermark = '/images/logos/Logo_LakewoodOaks-08.png'
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxStart, setLightboxStart] = useState(0)
  const swiperRef = useRef(null)
  const instanceId = useRef(Math.random().toString(36).slice(2))
  const receivingSync = useRef(false)

  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  )

  // ---- Sync listener -----------------------------------------------------
  useEffect(() => {
    if (!syncGroup) return
    return syncBus.on(syncGroup, (index, sender) => {
      if (sender === instanceId.current) return
      receivingSync.current = true
      swiperRef.current?.slideTo(index, 300, false)
    })
  }, [syncGroup])

  const handleSlideChange = useCallback(
    (swiper) => {
      const idx = swiper.activeIndex
      onIndexChange?.(idx)
      if (receivingSync.current) {
        receivingSync.current = false
        return
      }
      if (syncGroup) {
        syncBus.emit(syncGroup, idx, instanceId.current)
      }
    },
    [syncGroup, onIndexChange]
  )

  const openLightbox = (index) => {
    setLightboxStart(index)
    setLightboxOpen(true)
  }

  // ---- Empty state -------------------------------------------------------
  if (safeImages.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 text-sm ${className}`}
        style={{ width: '100%', height: '100%', borderRadius, minHeight: 120 }}
      >
        No images available
      </div>
    )
  }

  return (
    <>
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          borderRadius,
          overflow: 'hidden',
          position: 'relative',
          maxWidth: '100%'
        }}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay, Keyboard]}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={handleSlideChange}
          initialSlide={startIndex}
          navigation={showArrows}
          pagination={showPagination ? { clickable: true, dynamicBullets: true } : false}
          autoplay={autoPlay ? { delay: autoPlayInterval, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          keyboard={{ enabled: true }}
          rewind
          grabCursor
          style={{ width: '100%', height: '100%', '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' }}
        >
          {safeImages.map((url, i) => (
            <SwiperSlide key={i} style={{ position: 'relative' }}>
              <img
                src={url}
                alt={`slide-${i}`}
                loading="lazy"
                draggable={false}
                onClick={() => openLightbox(i)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit,
                  cursor: 'pointer',
                  display: 'block'
                }}
              />
              {watermark && (
                <img
                  src={watermark}
                  alt=""
                  draggable={false}
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    height: '22%',
                    maxHeight: 80,
                    minHeight: 40,
                    opacity: 0.35,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    filter: 'brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Counter badge */}
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 12,
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)'
          }}
        >
          {safeImages.length} fotos
        </span>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={safeImages}
          startIndex={lightboxStart}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Lightbox — fullscreen gallery viewer
// ---------------------------------------------------------------------------
const Lightbox = ({ images, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex)
  const lbSwiperRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: 36,
            height: 36,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>
      </div>

      {/* Swiper fullscreen */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          initialSlide={startIndex}
          navigation
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          onSwiper={(s) => (lbSwiperRef.current = s)}
          onSlideChange={(s) => setIndex(s.activeIndex)}
          style={{ width: '100%', height: '100%' }}
        >
          {images.map((url, i) => (
            <SwiperSlide
              key={i}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img
                src={url}
                alt={`lightbox-${i}`}
                loading="lazy"
                draggable={false}
                style={{
                  maxWidth: '92%',
                  maxHeight: '92%',
                  objectFit: 'contain',
                  borderRadius: 4
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            overflowX: 'auto',
            padding: '10px 16px',
            flexShrink: 0
          }}
        >
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`thumb-${i}`}
              loading="lazy"
              draggable={false}
              onClick={() => lbSwiperRef.current?.slideTo(i)}
              style={{
                width: 52,
                height: 52,
                objectFit: 'cover',
                borderRadius: 4,
                cursor: 'pointer',
                border: i === index ? '2px solid #3b82f6' : '2px solid transparent',
                opacity: i === index ? 1 : 0.5,
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default GalleryCarrousel
