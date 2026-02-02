import User from '../models/User.js'

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query
    const filter = { tenant: req.tenantId }
    if (role) filter.role = role

    const users = await User.find(filter).select('-password').populate('lots', 'number section').populate('tenant', 'name slug')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenant: req.tenantId }).select('-password').populate('lots').populate('tenant', 'name slug')
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
    const user = await User.findOne({ _id: req.params.id, tenant: req.tenantId })
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
    const user = await User.findOne({ _id: req.params.id, tenant: req.tenantId })
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
