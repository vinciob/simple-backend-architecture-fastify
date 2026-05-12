import z from 'zod'
// Models
import { Todo, TodoOutputZ } from '../../entities/todo.entity.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthUser } from '../../middleware/validateToken.js'

export const getTodos = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    const user = request.user as AuthUser

    // Get user todos
    const todos = await Todo.find({ user: user._id }).sort({ createdAt: -1 }).lean()

    // Prepare todos output
    const outputTodos = z.array(TodoOutputZ).safeParse(todos)
    if (!outputTodos.success) return reply.status(500).send({ message: 'Error preparing todos output' })

    return reply.status(200).send({ todos: outputTodos.data })
}
