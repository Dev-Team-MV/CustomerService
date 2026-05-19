import mongoose from 'mongoose'
import Activity from '../models/Activity.js'
import ActivityColumn, { DEFAULT_ACTIVITY_COLUMNS } from '../models/ActivityColumn.js'

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

const parsePosition = (value) => {
  if (value === undefined || value === null) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, Math.floor(parsed))
}

const resolveScope = (projectId) => {
  if (projectId === undefined || projectId === null || projectId === '') {
    return { boardType: 'global', projectId: null }
  }
  if (!isValidObjectId(projectId)) return null
  return { boardType: 'project', projectId }
}

const scopeQueryFilter = (scope) => {
  if (scope.boardType === 'project') {
    return {
      projectId: scope.projectId,
      $or: [{ boardType: 'project' }, { boardType: { $exists: false } }]
    }
  }
  return {
    $or: [
      { boardType: 'global' },
      { boardType: { $exists: false }, projectId: { $exists: false } }
    ]
  }
}

const scopePersistData = (scope) => (
  scope.boardType === 'project'
    ? { boardType: 'project', projectId: scope.projectId }
    : { boardType: 'global' }
)

const scopeFromDoc = (doc) => (
  doc.boardType === 'global'
    ? { boardType: 'global', projectId: null }
    : doc.projectId
      ? { boardType: 'project', projectId: doc.projectId }
      : { boardType: 'global', projectId: null }
)

const ensureDefaultColumns = async (scope) => {
  const filter = scopeQueryFilter(scope)
  const existing = await ActivityColumn.find(filter).sort({ order: 1 })
  if (existing.length > 0) return existing

  await ActivityColumn.insertMany(
    DEFAULT_ACTIVITY_COLUMNS.map((column) => ({
      ...scopePersistData(scope),
      ...column
    }))
  )

  return ActivityColumn.find(filter).sort({ order: 1 })
}

const reorderColumnActivities = async (scope, columnId, excludeId = null) => {
  const filter = { ...scopeQueryFilter(scope), columnId }
  if (excludeId) {
    filter._id = { $ne: excludeId }
  }

  const activities = await Activity.find(filter).sort({ position: 1, createdAt: 1 })
  await Promise.all(
    activities.map((activity, index) => (
      activity.position !== index
        ? Activity.updateOne({ _id: activity._id }, { $set: { position: index } })
        : Promise.resolve()
    ))
  )

  return activities.length
}

const placeActivityInColumn = async (activity, targetColumnId, targetPosition = null) => {
  const activityScope = scopeFromDoc(activity)
  const sameColumn = activity.columnId.toString() === targetColumnId.toString()
  if (sameColumn && targetPosition === null) {
    return
  }

  const columnCount = await reorderColumnActivities(activityScope, targetColumnId, sameColumn ? activity._id : null)

  const finalPosition = targetPosition === null
    ? columnCount
    : Math.min(Math.max(targetPosition, 0), columnCount)

  if (sameColumn) {
    await Activity.updateMany(
      {
        ...scopeQueryFilter(activityScope),
        columnId: targetColumnId,
        _id: { $ne: activity._id },
        position: { $gte: finalPosition }
      },
      { $inc: { position: 1 } }
    )
  } else {
    await reorderColumnActivities(activityScope, activity.columnId, activity._id)
    await Activity.updateMany(
      {
        ...scopeQueryFilter(activityScope),
        columnId: targetColumnId,
        position: { $gte: finalPosition }
      },
      { $inc: { position: 1 } }
    )
  }

  activity.columnId = targetColumnId
  activity.position = finalPosition
}

export const getActivityColumns = async (req, res) => {
  try {
    const { projectId } = req.query
    const scope = resolveScope(projectId)
    if (!scope) {
      return res.status(400).json({ message: 'projectId must be a valid ObjectId when provided' })
    }

    const columns = await ensureDefaultColumns(scope)
    res.json(columns)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createActivityColumn = async (req, res) => {
  try {
    const { projectId, key, name, order } = req.body
    const scope = resolveScope(projectId)
    if (!scope) {
      return res.status(400).json({ message: 'projectId must be a valid ObjectId when provided' })
    }
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ message: 'key is required' })
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'name is required' })
    }

    await ensureDefaultColumns(scope)
    const filter = scopeQueryFilter(scope)

    const existing = await ActivityColumn.findOne({ ...filter, key: key.trim() })
    if (existing) {
      return res.status(409).json({ message: 'Column key already exists for this board' })
    }

    const existingColumns = await ActivityColumn.find(filter)
    const normalizedOrder = parsePosition(order)
    const finalOrder = normalizedOrder === null
      ? existingColumns.length
      : Math.min(normalizedOrder, existingColumns.length)

    await ActivityColumn.updateMany(
      { ...filter, order: { $gte: finalOrder } },
      { $inc: { order: 1 } }
    )

    const column = await ActivityColumn.create({
      ...scopePersistData(scope),
      key: key.trim(),
      name: name.trim(),
      order: finalOrder
    })

    res.status(201).json(column)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateActivityColumn = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Valid column id is required' })
    }

    const column = await ActivityColumn.findById(id)
    if (!column) {
      return res.status(404).json({ message: 'Column not found' })
    }

    const { name, order } = req.body
    if (name !== undefined) column.name = name

    if (order !== undefined) {
      const nextOrder = parsePosition(order)
      if (nextOrder === null) {
        return res.status(400).json({ message: 'order must be a number' })
      }

      const columnScope = scopeFromDoc(column)
      const columnFilter = scopeQueryFilter(columnScope)
      const columns = await ActivityColumn.find(columnFilter).sort({ order: 1 })
      const maxOrder = Math.max(0, columns.length - 1)
      const targetOrder = Math.min(nextOrder, maxOrder)
      const previousOrder = column.order

      if (targetOrder !== previousOrder) {
        if (targetOrder > previousOrder) {
          await ActivityColumn.updateMany(
            {
              ...columnFilter,
              _id: { $ne: column._id },
              order: { $gt: previousOrder, $lte: targetOrder }
            },
            { $inc: { order: -1 } }
          )
        } else {
          await ActivityColumn.updateMany(
            {
              ...columnFilter,
              _id: { $ne: column._id },
              order: { $gte: targetOrder, $lt: previousOrder }
            },
            { $inc: { order: 1 } }
          )
        }

        column.order = targetOrder
      }
    }

    const updated = await column.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteActivityColumn = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Valid column id is required' })
    }

    const column = await ActivityColumn.findById(id)
    if (!column) {
      return res.status(404).json({ message: 'Column not found' })
    }

    const linkedActivities = await Activity.countDocuments({ columnId: column._id })
    if (linkedActivities > 0) {
      return res.status(409).json({ message: 'Cannot delete a column with activities' })
    }

    const deletedOrder = column.order
    await column.deleteOne()

    const columnScope = scopeFromDoc(column)
    await ActivityColumn.updateMany(
      { ...scopeQueryFilter(columnScope), order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    )

    res.json({ message: 'Column deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getActivities = async (req, res) => {
  try {
    const { projectId, columnId, assignedTo, priority } = req.query
    const scope = resolveScope(projectId)
    if (!scope) {
      return res.status(400).json({ message: 'projectId must be a valid ObjectId when provided' })
    }

    await ensureDefaultColumns(scope)

    const filter = scopeQueryFilter(scope)
    if (columnId && isValidObjectId(columnId)) filter.columnId = columnId
    if (assignedTo && isValidObjectId(assignedTo)) filter.assignedTo = assignedTo
    if (priority) filter.priority = priority

    const activities = await Activity.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('columnId', 'name key order')
      .sort({ position: 1, createdAt: 1 })

    res.json(activities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getActivityBoard = async (req, res) => {
  try {
    const { projectId } = req.query
    const scope = resolveScope(projectId)
    if (!scope) {
      return res.status(400).json({ message: 'projectId must be a valid ObjectId when provided' })
    }

    const filter = scopeQueryFilter(scope)
    const columns = await ensureDefaultColumns(scope)
    const activities = await Activity.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ position: 1, createdAt: 1 })
      .lean()

    const grouped = columns.map((column) => ({
      ...column.toObject(),
      activities: activities.filter((activity) => activity.columnId.toString() === column._id.toString())
    }))

    res.json({
      boardType: scope.boardType,
      projectId: scope.boardType === 'project' ? scope.projectId : null,
      columns: grouped
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Valid activity id is required' })
    }

    const activity = await Activity.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('columnId', 'name key order')

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    res.json(activity)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createActivity = async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      columnId,
      position,
      priority,
      dueDate,
      assignedTo,
      tags
    } = req.body

    const scope = resolveScope(projectId)
    if (!scope) {
      return res.status(400).json({ message: 'projectId must be a valid ObjectId when provided' })
    }
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required' })
    }

    await ensureDefaultColumns(scope)
    const filter = scopeQueryFilter(scope)

    let targetColumnId = columnId
    if (!targetColumnId) {
      const todoColumn = await ActivityColumn.findOne({ ...filter, key: 'todo' })
      targetColumnId = todoColumn?._id
    }

    if (!targetColumnId || !isValidObjectId(targetColumnId)) {
      return res.status(400).json({ message: 'Valid columnId is required' })
    }

    const column = await ActivityColumn.findOne({ _id: targetColumnId, ...filter })
    if (!column) {
      return res.status(400).json({ message: 'Column does not belong to this board' })
    }

    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: 'assignedTo must be a valid user id' })
    }

    const activity = new Activity({
      ...scopePersistData(scope),
      title: title.trim(),
      description: description || '',
      columnId: targetColumnId,
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      createdBy: req.user._id,
      tags: Array.isArray(tags) ? tags : []
    })

    await placeActivityInColumn(activity, targetColumnId, parsePosition(position))
    const created = await activity.save()

    const payload = await Activity.findById(created._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('columnId', 'name key order')

    res.status(201).json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Valid activity id is required' })
    }

    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    const {
      title,
      description,
      columnId,
      position,
      priority,
      dueDate,
      assignedTo,
      tags
    } = req.body

    if (title !== undefined) activity.title = title
    if (description !== undefined) activity.description = description
    if (priority !== undefined) activity.priority = priority
    if (dueDate !== undefined) activity.dueDate = dueDate || undefined
    if (assignedTo !== undefined) {
      if (assignedTo && !isValidObjectId(assignedTo)) {
        return res.status(400).json({ message: 'assignedTo must be a valid user id' })
      }
      activity.assignedTo = assignedTo || undefined
    }
    if (tags !== undefined) activity.tags = Array.isArray(tags) ? tags : []

    const targetColumnId = columnId || activity.columnId
    if (!isValidObjectId(targetColumnId)) {
      return res.status(400).json({ message: 'Valid columnId is required' })
    }

    const activityScope = scopeFromDoc(activity)
    const column = await ActivityColumn.findOne({ _id: targetColumnId, ...scopeQueryFilter(activityScope) })
    if (!column) {
      return res.status(400).json({ message: 'Column does not belong to this board' })
    }

    await placeActivityInColumn(activity, targetColumnId, parsePosition(position))
    await activity.save()

    const payload = await Activity.findById(activity._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('columnId', 'name key order')

    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const moveActivity = async (req, res) => {
  try {
    const { id } = req.params
    const { columnId, position } = req.body

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Valid activity id is required' })
    }
    if (!columnId || !isValidObjectId(columnId)) {
      return res.status(400).json({ message: 'Valid columnId is required' })
    }

    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    const activityScope = scopeFromDoc(activity)
    const column = await ActivityColumn.findOne({ _id: columnId, ...scopeQueryFilter(activityScope) })
    if (!column) {
      return res.status(400).json({ message: 'Column does not belong to this board' })
    }

    await placeActivityInColumn(activity, columnId, parsePosition(position))
    await activity.save()

    const payload = await Activity.findById(activity._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('columnId', 'name key order')

    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Valid activity id is required' })
    }

    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    const { columnId } = activity
    const deletedPosition = activity.position
    const activityScope = scopeFromDoc(activity)

    await activity.deleteOne()
    await Activity.updateMany(
      {
        ...scopeQueryFilter(activityScope),
        columnId,
        position: { $gt: deletedPosition }
      },
      { $inc: { position: -1 } }
    )

    res.json({ message: 'Activity deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
