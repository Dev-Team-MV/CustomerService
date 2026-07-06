import User from '../models/User.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import { notifyUser, notifyUsers, createNotification } from '../services/notificationService.js'

const runNotification = (task) => {
  Promise.resolve(task()).catch((error) => {
    console.error('[Notifications]', error.message)
  })
}

const toIdList = (ids = []) =>
  [...new Set(ids.map((id) => String(id?._id || id)).filter(Boolean))]

export const extractOwnerIds = (unit) => toIdList(unit?.users || [])

export const getAdminUserIds = async () => {
  const admins = await User.find({
    role: { $in: ['admin', 'superadmin'] },
    isActive: { $ne: false }
  }).select('_id')

  return admins.map((admin) => admin._id)
}

const getOwnerIdsForUnit = async ({ propertyId, apartmentId }) => {
  if (propertyId) {
    const property = await Property.findById(propertyId).select('users')
    return extractOwnerIds(property)
  }
  if (apartmentId) {
    const apartment = await Apartment.findById(apartmentId).select('users')
    return extractOwnerIds(apartment)
  }
  return []
}

const excludeActor = (userIds, actorId) => {
  if (!actorId) return userIds
  const actor = String(actorId)
  return userIds.filter((id) => String(id) !== actor)
}

const getProjectIdFromProperty = async (propertyId) => {
  if (!propertyId) return undefined
  const doc = await Property.findById(propertyId).select('project').lean()
  return doc?.project || undefined
}

const getProjectIdFromApartment = async (apartmentId) => {
  if (!apartmentId) return undefined
  const doc = await Apartment.findById(apartmentId)
    .select('building')
    .populate('building', 'project')
    .lean()
  return doc?.building?.project || undefined
}

const resolveProjectId = async ({ projectId, propertyId, apartmentId, unitDoc } = {}) => {
  if (projectId) return projectId
  if (unitDoc?.project) return unitDoc.project
  if (propertyId) return getProjectIdFromProperty(propertyId)
  if (apartmentId) return getProjectIdFromApartment(apartmentId)
  return undefined
}

export const notifyPayloadCreated = ({ payload, unitDoc, actor }) => {
  runNotification(async () => {
    const amount = Number(payload.amount || 0).toLocaleString('en-US')
    const projectId = await resolveProjectId({
      propertyId: payload.property,
      apartmentId: payload.apartment,
      unitDoc
    })
    const payloadBase = {
      event: 'PAYMENT_CREATED',
      payloadId: payload._id,
      propertyId: payload.property || undefined,
      apartmentId: payload.apartment || undefined,
      status: payload.status,
      amount: payload.amount,
      projectId
    }

    const isAdmin = ['admin', 'superadmin'].includes(actor?.role)

    if (!isAdmin) {
      const adminIds = excludeActor(await getAdminUserIds(), actor?._id)
      if (adminIds.length) {
        await notifyUsers(adminIds, {
          title: 'Nuevo pago registrado',
          body: `Se registró un pago de $${amount} pendiente de revisión.`,
          type: 'INFO',
          audience: 'admin',
          projectId,
          payload: payloadBase
        })
      }

      await notifyUser(actor._id, {
        title: 'Pago enviado',
        body: `Tu pago de $${amount} fue recibido y está pendiente de revisión.`,
        type: 'INFO',
        audience: 'user',
        projectId,
        payload: {
          ...payloadBase,
          event: 'PAYMENT_RECEIVED'
        }
      })
      return
    }

    const ownerIds = excludeActor(extractOwnerIds(unitDoc), actor?._id)
    if (!ownerIds.length) return

    await notifyUsers(ownerIds, {
      title: 'Pago registrado',
      body: `Se registró un pago de $${amount}.`,
      type: 'INFO',
      audience: 'user',
      projectId,
      payload: payloadBase
    })
  })
}

export const notifyPayloadStatusChanged = ({ payload, unitDoc, previousStatus, actor }) => {
  if (!payload || previousStatus === payload.status) return

  runNotification(async () => {
    const ownerIds = excludeActor(extractOwnerIds(unitDoc), actor?._id)
    if (!ownerIds.length) return

    const amount = Number(payload.amount || 0).toLocaleString('en-US')
    const projectId = await resolveProjectId({
      propertyId: payload.property,
      apartmentId: payload.apartment,
      unitDoc
    })
    const payloadBase = {
      payloadId: payload._id,
      propertyId: payload.property || undefined,
      apartmentId: payload.apartment || undefined,
      status: payload.status,
      amount: payload.amount,
      projectId
    }

    if (payload.status === 'signed') {
      await notifyUsers(ownerIds, {
        title: 'Pago recibido',
        body: `Tu pago de $${amount} fue procesado.`,
        type: 'INFO',
        audience: 'user',
        projectId,
        payload: { ...payloadBase, event: 'PAYMENT_RECEIVED' }
      })

      const hasDocuments = Boolean(payload.support) || (Array.isArray(payload.urls) && payload.urls.length > 0)
      if (hasDocuments) {
        await notifyUsers(ownerIds, {
          title: 'Documento aprobado',
          body: 'Los documentos de tu pago fueron aprobados.',
          type: 'INFO',
          audience: 'user',
          projectId,
          payload: {
            ...payloadBase,
            event: 'DOCUMENT_APPROVED'
          }
        })
      }
      return
    }

    if (payload.status === 'rejected') {
      await notifyUsers(ownerIds, {
        title: 'Pago rechazado',
        body: `Tu pago de $${amount} fue rechazado.`,
        type: 'WARN',
        audience: 'user',
        projectId,
        payload: { ...payloadBase, event: 'PAYMENT_REJECTED' }
      })
    }
  })
}

export const notifyPropertyAssigned = ({ property, ownerIds, actor }) => {
  runNotification(async () => {
    const targets = excludeActor(toIdList(ownerIds), actor?._id)
    if (!targets.length) return

    const projectId = property.project || await getProjectIdFromProperty(property._id)

    await notifyUsers(targets, {
      title: 'Propiedad asignada',
      body: 'Se te asignó una nueva propiedad.',
      type: 'INFO',
      audience: 'user',
      projectId,
      payload: {
        event: 'PROPERTY_ASSIGNED',
        propertyId: property._id,
        projectId
      }
    })
  })
}

export const notifyPhaseUpdated = ({ phase, actor }) => {
  runNotification(async () => {
    const ownerIds = excludeActor(
      await getOwnerIdsForUnit({
        propertyId: phase.property,
        apartmentId: phase.apartment
      }),
      actor?._id
    )
    if (!ownerIds.length) return

    const phaseLabel = phase.title || `Fase ${phase.phaseNumber}`
    const projectId = await resolveProjectId({
      propertyId: phase.property,
      apartmentId: phase.apartment
    })

    await notifyUsers(ownerIds, {
      title: 'Avance de construcción',
      body: `Se actualizó ${phaseLabel}.`,
      type: 'INFO',
      audience: 'user',
      projectId,
      payload: {
        event: 'PHASE_UPDATED',
        phaseId: phase._id,
        phaseNumber: phase.phaseNumber,
        propertyId: phase.property || undefined,
        apartmentId: phase.apartment || undefined,
        constructionPercentage: phase.constructionPercentage,
        projectId
      }
    })
  })
}

export const notifyFamilyGroupMemberAdded = ({ group, userId, actor }) => {
  runNotification(async () => {
    if (!userId || String(userId) === String(actor?._id)) return

    await notifyUser(userId, {
      title: 'Invitación a grupo familiar',
      body: 'Fuiste agregado a un grupo familiar.',
      type: 'INFO',
      audience: 'user',
      projectId: group.project || undefined,
      payload: {
        event: 'FAMILY_GROUP_INVITE',
        familyGroupId: group._id,
        projectId: group.project || undefined
      }
    })
  })
}

export const notifyContractUpdated = ({ contract, actor, contractTypes = [] }) => {
  runNotification(async () => {
    const ownerIds = excludeActor(
      await getOwnerIdsForUnit({
        propertyId: contract.property,
        apartmentId: contract.apartment
      }),
      actor?._id
    )
    if (!ownerIds.length) return

    const typesLabel = contractTypes.length ? contractTypes.join(', ') : 'contrato'
    const projectId = await resolveProjectId({
      propertyId: contract.property,
      apartmentId: contract.apartment
    })

    await notifyUsers(ownerIds, {
      title: 'Contrato actualizado',
      body: `Hay una actualización en tu contrato (${typesLabel}).`,
      type: 'INFO',
      audience: 'user',
      projectId,
      payload: {
        event: 'CONTRACT_UPDATED',
        contractId: contract._id,
        propertyId: contract.property || undefined,
        apartmentId: contract.apartment || undefined,
        contractTypes,
        projectId
      }
    })
  })
}

export const notifyContractSigned = ({ contract, actor, contractTypes = [] }) => {
  runNotification(async () => {
    const ownerIds = excludeActor(
      await getOwnerIdsForUnit({
        propertyId: contract.property,
        apartmentId: contract.apartment
      }),
      actor?._id
    )
    if (!ownerIds.length) return

    const typesLabel = contractTypes.length ? contractTypes.join(', ') : 'documento'
    const projectId = await resolveProjectId({
      propertyId: contract.property,
      apartmentId: contract.apartment
    })

    await notifyUsers(ownerIds, {
      title: 'Contrato firmado',
      body: `Se registró un nuevo documento contractual (${typesLabel}).`,
      type: 'INFO',
      audience: 'user',
      projectId,
      payload: {
        event: 'CONTRACT_SIGNED',
        contractId: contract._id,
        propertyId: contract.property || undefined,
        apartmentId: contract.apartment || undefined,
        contractTypes,
        projectId
      }
    })
  })
}

export const notifyContractChanges = ({ contract, previousContracts = [], incomingContracts = [], actor }) => {
  if (!incomingContracts.length) {
    notifyContractUpdated({ contract, actor })
    return
  }

  const previousByType = new Map(
    (previousContracts || []).map((item) => {
      const doc = item?.toObject ? item.toObject() : item
      return [doc.type, doc.fileUrl]
    })
  )

  const addedTypes = []
  const updatedTypes = []

  for (const item of incomingContracts) {
    if (!previousByType.has(item.type)) {
      addedTypes.push(item.type)
      continue
    }
    if (previousByType.get(item.type) !== item.fileUrl) {
      updatedTypes.push(item.type)
    }
  }

  if (addedTypes.length) {
    notifyContractSigned({ contract, actor, contractTypes: addedTypes })
  }
  if (updatedTypes.length) {
    notifyContractUpdated({ contract, actor, contractTypes: updatedTypes })
  }
  if (!addedTypes.length && !updatedTypes.length) {
    notifyContractUpdated({ contract, actor })
  }
}

export const notifyActivityThreadMessage = ({ activity, message, actor }) => {
  runNotification(async () => {
    const recipientIds = new Set()

    if (activity.assignedTo) recipientIds.add(String(activity.assignedTo))
    if (activity.createdBy) recipientIds.add(String(activity.createdBy))
    for (const threadMessage of activity.threads || []) {
      if (threadMessage.createdBy) recipientIds.add(String(threadMessage.createdBy))
    }

    const targets = [...recipientIds]
      .filter((id) => id && id !== String(actor?._id))

    if (!targets.length) return

    const preview = typeof message === 'string' ? message.trim().slice(0, 120) : ''

    await notifyUsers(targets, {
      title: 'Nuevo mensaje',
      body: preview || 'Tienes un nuevo mensaje en una actividad.',
      type: 'INFO',
      audience: 'admin',
      projectId: activity.projectId || undefined,
      payload: {
        event: 'NEW_MESSAGE',
        activityId: activity._id,
        projectId: activity.projectId || undefined,
        messagePreview: preview
      }
    })
  })
}

const normalizePhoneDigits = (phone = '') => String(phone).replace(/\D/g, '')

export const findUserIdByPhone = async (phone) => {
  const digits = normalizePhoneDigits(phone)
  if (!digits) return null

  const users = await User.find({ phoneNumber: { $exists: true, $ne: '' } }).select('_id phoneNumber')
  const match = users.find((user) => {
    const userDigits = normalizePhoneDigits(user.phoneNumber)
    return userDigits === digits || userDigits.endsWith(digits) || digits.endsWith(userDigits)
  })

  return match?._id || null
}

export const notifySmsMessage = async ({ to, message, actor, userId }) => {
  runNotification(async () => {
    const resolvedUserId = userId || await findUserIdByPhone(to)
    if (!resolvedUserId || String(resolvedUserId) === String(actor?._id)) return

    const preview = typeof message === 'string' ? message.trim().slice(0, 120) : ''

    await notifyUser(resolvedUserId, {
      title: 'Nuevo mensaje',
      body: preview || 'Recibiste un nuevo mensaje.',
      type: 'INFO',
      audience: 'user',
      payload: {
        event: 'NEW_MESSAGE',
        channel: 'sms',
        messagePreview: preview
      }
    })
  })
}

export const notifyNewsPublished = ({ news, actor }) => {
  if (!news || news.status !== 'published') return

  runNotification(async () => {
    await createNotification({
      title: 'Nueva noticia publicada',
      body: news.title,
      type: 'INFO',
      audience: 'user',
      targetRoles: ['user', 'owner'],
      projectId: news.projectId || undefined,
      payload: {
        event: 'NEWS_PUBLISHED',
        newsId: news._id,
        projectId: news.projectId || undefined
      }
    })
  })
}

export const notifyActivityAssigned = ({ activity, assigneeId, actor }) => {
  if (!assigneeId || String(assigneeId) === String(actor?._id)) return

  runNotification(async () => {
    await notifyUser(assigneeId, {
      title: 'Actividad asignada',
      body: `Se te asignó la actividad "${activity.title}".`,
      type: 'INFO',
      audience: 'admin',
      projectId: activity.projectId || undefined,
      payload: {
        event: 'ACTIVITY_ASSIGNED',
        activityId: activity._id,
        projectId: activity.projectId || undefined
      }
    })
  })
}

export const notifyUserCreatedByAdmin = ({ user }) => {
  runNotification(async () => {
    await notifyUser(user._id, {
      title: 'Cuenta creada',
      body: 'Tu cuenta fue creada. Revisa tu teléfono para configurar tu contraseña.',
      type: 'INFO',
      audience: 'user',
      payload: {
        event: 'ACCOUNT_CREATED',
        userId: user._id
      }
    })
  })
}
