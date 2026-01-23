import Facade from '../models/Facade.js'

export const getFacadeDecks = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
    
    if (!facade) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    
    res.json(facade.decks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addFacadeDeck = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
    
    if (!facade) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    
    const { name, price, description, images, status } = req.body
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' })
    }
    
    facade.decks.push({
      name,
      price,
      description: description || '',
      images: Array.isArray(images) ? images : [],
      status: status || 'active'
    })
    
    await facade.save()
    res.status(201).json(facade.decks[facade.decks.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateFacadeDeck = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
    
    if (!facade) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    
    const deck = facade.decks.id(req.params.deckId)
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' })
    }
    
    if (req.body.name !== undefined) deck.name = req.body.name
    if (req.body.price !== undefined) deck.price = req.body.price
    if (req.body.description !== undefined) deck.description = req.body.description
    if (req.body.images !== undefined) deck.images = Array.isArray(req.body.images) ? req.body.images : []
    if (req.body.status !== undefined) deck.status = req.body.status
    
    await facade.save()
    res.json(deck)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteFacadeDeck = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
    
    if (!facade) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    
    const deck = facade.decks.id(req.params.deckId)
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' })
    }
    
    deck.deleteOne()
    await facade.save()
    res.json({ message: 'Deck deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
