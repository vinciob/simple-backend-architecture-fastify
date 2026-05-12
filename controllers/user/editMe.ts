import z from 'zod'
// Models
import { User, UserOutputZ, UserUpdateZ } from '../../entities/user.entity.js'
// Utils
import { logger } from '../../lib/logger.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthUser } from '../../middleware/validateToken.js'

export const editMe = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    const user = request.user as AuthUser

    // Validate user fields
    const validateUser = UserUpdateZ.safeParse(request.body)
    if (!validateUser.success) {
        const error = z.treeifyError(validateUser.error)
        logger(`User fields validation error: ${JSON.stringify(error)}`, 'error')
        return reply.status(400).send({
            message: 'User fields not valid',
            details: error.properties,
        })
    }

    if (Object.keys(validateUser.data).length === 0) {
        return reply.status(400).send({ message: 'No user fields to update' })
    }

    // Edit user
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        validateUser.data,
        { new: true, runValidators: true }
    )

    if (!updatedUser) return reply.status(404).send({ message: 'User not found' })

    // Prepare user output
    const outputUser = UserOutputZ.safeParse(updatedUser.toObject())
    if (!outputUser.success) return reply.status(500).send({ message: 'Error preparing user output' })

    return reply.status(200).send({ user: outputUser.data })
}
