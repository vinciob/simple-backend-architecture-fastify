import z from 'zod'
// Models
import { Todo } from '../../entities/todo.entity.js'
// Utils
import { ObjectIdHexZ } from '../../lib/validateObjectId.js'
import { logger } from '../../lib/logger.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthUser } from '../../middleware/validateToken.js'

const TodoParamsZ = z.object({
    todoId: ObjectIdHexZ,
})

export const deleteTodo = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    const user = request.user as AuthUser

    // Validate todo id
    const validateParams = TodoParamsZ.safeParse(request.params)
    if (!validateParams.success) {
        const error = z.treeifyError(validateParams.error)
        return reply.status(400).send({ message: 'Todo id not valid', details: error.properties })
    }

    // Delete todo
    try {
        const deletedTodo = await Todo.findOneAndDelete({_id: validateParams.data.todoId, user: user._id})
        if (!deletedTodo) return reply.status(404).send({ message: 'Todo not found' })
        return reply.status(200).send({ message: 'Todo deleted' })
    } catch (error) {
        logger(`Error deleting todo: ${String(error)}`, 'error')
        return reply.status(500).send({ message: 'Error deleting todo' })
    }
}
