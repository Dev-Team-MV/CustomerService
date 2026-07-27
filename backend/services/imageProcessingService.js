import sharp from 'sharp'
import path from 'path'

const IMAGE_MIMES = /^image\/(jpeg|jpg|png|gif|webp)$/
const JPEG_MIME = 'image/jpeg'
const PNG_MIME = 'image/png'
const WEBP_MIME = 'image/webp'
const JPG_EXT = '.jpg'
const PNG_EXT = '.png'
const WEBP_EXT = '.webp'

/** Max width for resize (keeps aspect ratio). No resize if under this. */
const MAX_WIDTH = 2560
/** JPEG quality for conversion and optimization (0-100). */
const JPEG_QUALITY = 85
const PNG_COMPRESSION = 9
const WEBP_QUALITY = 85

function detectImageFormat (ext, mimeType) {
  if (/\.png$/i.test(ext) || mimeType === 'image/png') return 'png'
  if (/\.webp$/i.test(ext) || mimeType === 'image/webp') return 'webp'
  if (/\.gif$/i.test(ext) || mimeType === 'image/gif') return 'gif'
  return 'jpeg'
}

/**
 * Optimize image buffer for upload. Preserves PNG/WebP/GIF formats (and transparency).
 * JPEG inputs are optimized as JPEG.
 *
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original file name (for extension)
 * @param {string} mimeType - MIME type
 * @returns {Promise<{ buffer: Buffer, mimeType: string, size: number, extension: string }>}
 *   extension: output extension to use (e.g. '.jpg'); use for building final fileName.
 */
export async function processImageForUpload (buffer, originalName, mimeType) {
  const rawExt = path.extname(originalName || '').toLowerCase()
  const ext = rawExt || '.jpg'
  if (!buffer || !Buffer.isBuffer(buffer)) {
    const outExt = IMAGE_MIMES.test(mimeType) ? ext : (rawExt || '.bin')
    return { buffer, mimeType, size: buffer?.length ?? 0, extension: outExt }
  }
  if (!IMAGE_MIMES.test(mimeType)) {
    return { buffer, mimeType, size: buffer.length, extension: rawExt || '.bin' }
  }

  try {
    let pipeline = sharp(buffer)
      .rotate() // auto-orient from EXIF

    const metadata = await pipeline.metadata()
    const width = metadata.width || 0

    if (width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true })
    }

    const format = detectImageFormat(ext, mimeType)
    let outBuffer
    let outMime
    let outExt

    if (format === 'png') {
      outBuffer = await pipeline.png({ compressionLevel: PNG_COMPRESSION }).toBuffer()
      outMime = PNG_MIME
      outExt = PNG_EXT
    } else if (format === 'webp') {
      outBuffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()
      outMime = WEBP_MIME
      outExt = WEBP_EXT
    } else if (format === 'gif') {
      // Static GIFs with alpha → PNG; otherwise JPEG for smaller size
      if (metadata.hasAlpha) {
        outBuffer = await pipeline.png({ compressionLevel: PNG_COMPRESSION }).toBuffer()
        outMime = PNG_MIME
        outExt = PNG_EXT
      } else {
        outBuffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
        outMime = JPEG_MIME
        outExt = JPG_EXT
      }
    } else {
      outBuffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
      outMime = JPEG_MIME
      outExt = JPG_EXT
    }

    return {
      buffer: outBuffer,
      mimeType: outMime,
      size: outBuffer.length,
      extension: outExt
    }
  } catch (err) {
    console.error('Image processing error, uploading original:', err.message)
    return { buffer, mimeType, size: buffer.length, extension: ext }
  }
}
