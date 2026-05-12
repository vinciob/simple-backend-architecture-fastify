import z from 'zod'
// Models
import { Todo, TodoOutputZ } from '../../entities/todo.entity.js'
// Utils
import { ObjectIdHexZ } from '../../lib/validateObjectId.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthUser } from '../../middleware/validateToken.js'

const TodoParamsZ = z.object({
    todoId: ObjectIdHexZ,
})

export const reopenTodo = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    const user = request.user as AuthUser

    // Validate todo id
    const validateParams = TodoParamsZ.safeParse(request.params)
    if (!validateParams.success) {
        const error = z.treeifyError(validateParams.error)
        return reply.status(400).send({ message: 'Todo id not valid', details: error.properties })
    }

    // Reopen todo
    const todo = await Todo.findOneAndUpdate(
        { _id: validateParams.data.todoId, user: user._id },
        { status: 'pending' },
        { new: true, runValidators: true }
    )

    if (!todo) return reply.status(404).send({ message: 'Todo not found' })

    // Prepare todo output
    const outputTodo = TodoOutputZ.safeParse(todo.toObject())
    if (!outputTodo.success) return reply.status(500).send({ message: 'Error preparing todo output' })

    return reply.status(200).send({ todo: outputTodo.data })
}
