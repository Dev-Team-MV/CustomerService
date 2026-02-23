import mongoose from 'mongoose'

/**
 * Schema reutilizable para una imagen con visibilidad.
 * isPublic: true = se puede mostrar sin token (pública); false = requiere token.
 */
const imageItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    isPublic: { type: Boolean, default: true }
  },
  { _id: false }
)

export default imageItemSchema
