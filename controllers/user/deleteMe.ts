// Models
import { User } from '../../entities/user.entity.js'
import { Todo } from '../../entities/todo.entity.js'
// Utils
import { logger } from '../../lib/logger.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthUser } from '../../middleware/validateToken.js'

export const deleteMe = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    const user = request.user as AuthUser

    // Delete user and related todos
    try {
        const deletedUser = await User.findByIdAndDelete(user._id)
        if (!deletedUser) return reply.status(404).send({ message: 'User not found' })

        await Todo.deleteMany({ user: user._id })

        return reply.status(200).send({ message: 'User deleted' })
    } catch (error) {
        logger(`Error deleting user: ${String(error)}`, 'error')
        return reply.status(500).send({ message: 'Error deleting user' })
    }
}
