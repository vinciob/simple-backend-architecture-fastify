import z from 'zod'
// Models
import { Todo, TodoOutputZ, TodoUpdateZ } from '../../entities/todo.entity.js'
// Utils
import { logger } from '../../lib/logger.js'
import { ObjectIdHexZ } from '../../lib/validateObjectId.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthUser } from '../../middleware/validateToken.js'

const TodoParamsZ = z.object({
    todoId: ObjectIdHexZ,
})

export const editTodo = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    const user = request.user as AuthUser

    // Validate todo id
    const validateParams = TodoParamsZ.safeParse(request.params)
    if (!validateParams.success) {
        const error = z.treeifyError(validateParams.error)
        return reply.status(400).send({ message: 'Todo id not valid', details: error.properties })
    }

    // Validate todo fields
    const validateTodo = TodoUpdateZ.safeParse(request.body)
    if (!validateTodo.success) {
        const error = z.treeifyError(validateTodo.error)
        logger(`Todo fields validation error: ${JSON.stringify(error)}`, 'error')
        return reply.status(400).send({
            message: 'Todo fields not valid',
            details: error.properties,
        })
    }

    if (Object.keys(validateTodo.data).length === 0) {
        return reply.status(400).send({ message: 'No todo fields to update' })
    }

    // Edit todo
    const todo = await Todo.findOneAndUpdate(
        { _id: validateParams.data.todoId, user: user._id },
        validateTodo.data,
        { new: true, runValidators: true }
    )

    if (!todo) return reply.status(404).send({ message: 'Todo not found' })

    // Prepare todo output
    const outputTodo = TodoOutputZ.safeParse(todo.toObject())
    if (!outputTodo.success) return reply.status(500).send({ message: 'Error preparing todo output' })

    return reply.status(200).send({ todo: outputTodo.data })
}
