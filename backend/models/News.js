import mongoose from 'mongoose'

const contentBlockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['heading', 'paragraph', 'list', 'quote']
    },
    level: { type: Number },
    text: { type: String },
    items: { type: [String] },
    ordered: { type: Boolean },
    author: { type: String }
  },
  { _id: false }
)

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'announcement'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    heroImage: {
      type: String,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    contentBlocks: {
      type: [contentBlockSchema],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    videos: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
)

const News = mongoose.model('News', newsSchema)

export default News
