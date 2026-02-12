import News from '../models/News.js'

export const getAllNews = async (req, res) => {
  try {
    const { category, status } = req.query
    const filter = {}

    if (category) filter.category = category
    if (status) filter.status = status

    const news = await News.find(filter).sort({ createdAt: -1 })
    res.json(news)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPublishedNews = async (req, res) => {
  try {
    const { category } = req.query
    const filter = { status: 'published' }
    if (category) filter.category = category

    const news = await News.find(filter).sort({ createdAt: -1 })
    res.json(news)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)

    if (news) {
      res.json(news)
    } else {
      res.status(404).json({ message: 'News article not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createNews = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      heroImage,
      tags,
      contentBlocks,
      images,
      videos
    } = req.body

    const news = await News.create({
      title,
      description,
      category: category || 'announcement',
      status: status || 'draft',
      heroImage: heroImage || '',
      tags: tags || [],
      contentBlocks: contentBlocks || [],
      images: images || [],
      videos: videos || []
    })

    res.status(201).json(news)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)

    if (news) {
      const {
        title,
        description,
        category,
        status,
        heroImage,
        tags,
        contentBlocks,
        images,
        videos
      } = req.body

      if (title !== undefined) news.title = title
      if (description !== undefined) news.description = description
      if (category !== undefined) news.category = category
      if (status !== undefined) news.status = status
      if (heroImage !== undefined) news.heroImage = heroImage
      if (tags !== undefined) news.tags = tags
      if (contentBlocks !== undefined) news.contentBlocks = contentBlocks
      if (images !== undefined) news.images = images
      if (videos !== undefined) news.videos = videos

      const updatedNews = await news.save()
      res.json(updatedNews)
    } else {
      res.status(404).json({ message: 'News article not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)

    if (news) {
      await news.deleteOne()
      res.json({ message: 'News article deleted successfully' })
    } else {
      res.status(404).json({ message: 'News article not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
