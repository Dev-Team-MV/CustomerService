import { useEffect, useMemo, useRef, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, Keyboard } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Keep carousels in sync when they share a syncGroup.
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
  watermark = '/images/logos/Logo_LakewoodOaks-08.png',
  showTitles = false
}) => {
  const swiperRef = useRef(null)
  const instanceId = useRef(Math.random().toString(36).slice(2))
  const receivingSync = useRef(false)

  const safeMedia = useMemo(() => {
    if (!Array.isArray(images)) return []
    return images
      .filter(Boolean)
      .map((item) => {
        if (typeof item === 'object' && item !== null && item.url) {
          return {
            url: item.url,
            type: item.type || 'image',
            title: item.title || ''
          }
        }
        if (typeof item === 'string') {
          return { url: item, type: 'image', title: '' }
        }
        return null
      })
      .filter(Boolean)
  }, [images])

  useEffect(() => {
    if (!syncGroup) return undefined
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

  if (safeMedia.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 text-sm ${className}`}
        style={{ width: '100%', height: '100%', borderRadius, minHeight: 120 }}
      >
        No media available
      </div>
    )
  }

  return (
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
        autoplay={
          autoPlay
            ? { delay: autoPlayInterval, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        keyboard={{ enabled: true }}
        rewind
        grabCursor
        style={{
          width: '100%',
          height: '100%',
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff'
        }}
      >
        {safeMedia.map((media, i) => (
          <SwiperSlide key={i} style={{ position: 'relative' }}>
            {media.type === 'video' ? (
              <video
                controls
                src={media.url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit,
                  display: 'block',
                  borderRadius
                }}
              />
            ) : (
              <img
                src={media.url}
                alt={media.title || `slide-${i}`}
                loading="lazy"
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit,
                  display: 'block',
                  cursor: 'pointer'
                }}
              />
            )}

            {showTitles && media.title && (
              <div
                style={{
                  width: '22%',
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  right: 16,
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                {media.title}
              </div>
            )}

            {watermark && media.type !== 'video' && (
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
    </div>
  )
}

export default GalleryCarrousel
