import sharp from 'sharp'
import path from 'path'

const IMAGE_MIMES = /^image\/(jpeg|jpg|png|gif|webp)$/
const JPEG_MIME = 'image/jpeg'
const JPG_EXT = '.jpg'

/** Max width for resize (keeps aspect ratio). No resize if under this. */
const MAX_WIDTH = 2560
/** JPEG quality for conversion and optimization (0-100). */
const JPEG_QUALITY = 85

/**
 * Optimize image buffer and convert PNG (and other raster formats) to JPG.
 * Non-image buffers (PDF, video) are returned unchanged.
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

    const isPngOrWebpOrGif = /\.(png|webp|gif)$/i.test(ext) || /image\/(png|webp|gif)/.test(mimeType)
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    const outBuffer = await pipeline.toBuffer()
    const outExt = (isPngOrWebpOrGif || ext === '.jpg' || ext === '.jpeg') ? JPG_EXT : ext
    return {
      buffer: outBuffer,
      mimeType: JPEG_MIME,
      size: outBuffer.length,
      extension: outExt.startsWith('.') ? outExt : `.${outExt}`
    }
  } catch (err) {
    console.error('Image processing error, uploading original:', err.message)
    return { buffer, mimeType, size: buffer.length, extension: ext }
  }
}
