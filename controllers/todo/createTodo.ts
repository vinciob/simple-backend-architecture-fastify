import z from 'zod'
// Models
import { Todo, TodoCreateZ, TodoOutputZ } from '../../entities/todo.entity.js'
// Utils
import { logger } from '../../lib/logger.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthUser } from '../../middleware/validateToken.js'

export const createTodo = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    const user = request.user as AuthUser

    // Validate todo fields
    const validateTodo = TodoCreateZ.safeParse(request.body)
    if (!validateTodo.success) {
        const error = z.treeifyError(validateTodo.error)
        logger(`Todo fields validation error: ${JSON.stringify(error)}`, 'error')
        return reply.status(400).send({
            message: 'Todo fields not valid',
            details: error.properties,
        })
    }

    // Create todo
    let newTodo
    try {
        newTodo = await Todo.create({...validateTodo.data, user: user._id})
    } catch (error: unknown) {
        logger(`Error creating new todo: ${String(error)}`, 'error')
        return reply.status(500).send({ message: 'Error creating new todo' })
    }

    // Prepare todo output
    const outputTodo = TodoOutputZ.safeParse(newTodo.toObject())
    if (!outputTodo.success) return reply.status(500).send({ message: 'Error preparing todo output' })

    return reply.status(201).send({ todo: outputTodo.data })
}
