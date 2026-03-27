import express from 'express'
import {
  createFamilyGroup,
  getMyFamilyGroups,
  getFamilyGroupById,
  updateFamilyGroup,
  addMemberToFamilyGroup,
  removeMemberFromFamilyGroup,
  deleteFamilyGroup
} from '../controllers/familyGroupController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/family-groups:
 *   get:
 *     summary: List my family groups
 *     description: Returns family groups where the user is creator or member. Optional query projectId filters to that project.
 *     tags: [Family Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *         description: If set, only groups in this project
 *     responses:
 *       200:
 *         description: List of family groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FamilyGroup'
 *   post:
 *     summary: Create a family group
 *     description: Creates a new family group. The authenticated user becomes the creator (implicit admin).
 *     tags: [Family Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Group name
 *               projectId:
 *                 type: string
 *                 description: Optional; if omitted, uses the first project in the database (legacy clients)
 *     responses:
 *       201:
 *         description: Family group created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyGroup'
 *       400:
 *         description: Group name is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/')
  .get(protect, getMyFamilyGroups)
  .post(protect, createFamilyGroup)

/**
 * @swagger
 * /api/family-groups/{id}:
 *   get:
 *     summary: Get family group by ID
 *     description: Returns a family group. Only members (creator or added members) can access.
 *     tags: [Family Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family group ID
 *     responses:
 *       200:
 *         description: Family group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyGroup'
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: Family group not found
 *   put:
 *     summary: Update a family group
 *     description: Update name and/or members. Only group admins (creator or members with role admin) or superadmin can update.
 *     tags: [Family Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               members:
 *                 type: array
 *                 description: Full list of members with user and role. Creator must remain.
 *                 items:
 *                   type: object
 *                   properties:
 *                     user: { type: string }
 *                     role: { type: string, enum: [admin, member] }
 *     responses:
 *       200:
 *         description: Updated family group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyGroup'
 *       400:
 *         description: Group creator must remain in the group
 *       403:
 *         description: Only group admins can update the group
 *       404:
 *         description: Family group not found
 *   delete:
 *     summary: Delete a family group
 *     description: Deletes the group and all property shares linked to it. Only group admins or superadmin.
 *     tags: [Family Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family group deleted successfully
 *       403:
 *         description: Only group admins can delete the group
 *       404:
 *         description: Family group not found
 */
router.route('/:id')
  .get(protect, getFamilyGroupById)
  .put(protect, updateFamilyGroup)
  .delete(protect, deleteFamilyGroup)

/**
 * @swagger
 * /api/family-groups/{id}/members:
 *   post:
 *     summary: Add member to family group
 *     description: Add a user to the group. Only group admins or superadmin. Body userId (required), role (optional, 'admin'|'member').
 *     tags: [Family Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to add
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 default: member
 *     responses:
 *       200:
 *         description: Updated family group with new member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyGroup'
 *       400:
 *         description: Creator is already in the group / User is already a member / userId is required
 *       403:
 *         description: Only group admins can add members
 *       404:
 *         description: Family group not found / User not found
 */
router.post('/:id/members', protect, addMemberToFamilyGroup)

/**
 * @swagger
 * /api/family-groups/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from family group
 *     description: Remove a user from the group. Cannot remove the group creator. Only group admins or superadmin.
 *     tags: [Family Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated family group (member removed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyGroup'
 *       400:
 *         description: Cannot remove the group creator
 *       403:
 *         description: Only group admins can remove members
 *       404:
 *         description: Family group not found
 */
router.delete('/:id/members/:userId', protect, removeMemberFromFamilyGroup)

export default router
