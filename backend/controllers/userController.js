import User from '../models/User.js'

/**
 * Search users by email, firstName or lastName. Available to any authenticated user
 * (e.g. for adding members to family groups). Returns minimal fields.
 * Use q= for search (min 2 chars), or omit q to get a limited list for dropdowns.
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query
    const query = typeof q === 'string' ? q.trim() : ''
    let filter = {}
    if (query.length >= 2) {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter = {
        $or: [
          { email: regex },
          { firstName: regex },
          { lastName: regex }
        ]
      }
    }
    const users = await User.find(filter)
      .select('_id firstName lastName email')
      .limit(query.length >= 2 ? 50 : 100)
      .sort({ lastName: 1, firstName: 1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query
    const filter = role ? { role } : {}
    
    const users = await User.find(filter).select('-password').populate('lots', 'number')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('lots')
    
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      user.firstName = req.body.firstName || user.firstName
      user.lastName = req.body.lastName || user.lastName
      user.email = req.body.email || user.email
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber
      user.birthday = req.body.birthday || user.birthday
      
      if (req.body.password) {
        user.password = req.body.password
      }

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        birthday: updatedUser.birthday,
        role: updatedUser.role
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      await user.deleteOne()
      res.json({ message: 'User deleted successfully' })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
